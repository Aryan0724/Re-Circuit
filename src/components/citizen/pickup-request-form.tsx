
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generatePickupDescription } from '@/ai/flows/generate-pickup-description';
import { UploadCloud, Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import type { PickupRequest } from '@/types';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Please provide a more detailed description.'),
  photo: z.any().refine((files) => files?.length === 1, 'An image is required.'),
  address: z.string().min(5, 'Address is required.'),
});

export function PickupRequestForm() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      description: '',
      address: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        handleGenerateDescription(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async (photoDataUri: string) => {
    setIsGenerating(true);
    form.setValue('description', 'Generating description...');
    try {
      const result = await generatePickupDescription({ photoDataUri });
      form.setValue('description', result.description);
    } catch (error) {
      console.error('Error generating description:', error);
      form.setValue('description', 'Could not generate description. Please enter one manually.');
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate item description.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Location Error', description: 'Geolocation is not supported by your browser.' });
      return;
    }
    
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you'd use a reverse geocoding service here.
        // For this prototype, we'll use a mock address.
        form.setValue('address', '123 Main Street, Anytown, USA');
        toast({ title: 'Location found!' });
        setIsFetchingLocation(false);
      },
      () => {
        toast({ variant: 'destructive', title: 'Location Error', description: 'Unable to retrieve your location. Please grant permission or enter it manually.' });
        setIsFetchingLocation(false);
      }
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!preview || !userProfile) return;
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const newPickup: PickupRequest = {
            id: `pickup_${Date.now()}`,
            citizenId: userProfile.uid,
            citizenName: userProfile.name,
            category: values.category,
            description: values.description,
            location: { displayAddress: values.address, lat: 40.7128, lon: -74.0060 },
            photoURL: preview,
            status: 'pending',
            createdAt: new Date(),
        };

        const citizenPickupsKey = `pickups_${userProfile.uid}`;
        const existingCitizenPickups = JSON.parse(localStorage.getItem(citizenPickupsKey) || '[]');
        localStorage.setItem(citizenPickupsKey, JSON.stringify([newPickup, ...existingCitizenPickups]));
        
        const pendingPickupsKey = `pickups_pending`;
        const existingPendingPickups = JSON.parse(localStorage.getItem(pendingPickupsKey) || '[]');
        localStorage.setItem(pendingPickupsKey, JSON.stringify([newPickup, ...existingPendingPickups]));
        
        window.dispatchEvent(new CustomEvent('pickups-updated'));

        toast({ title: 'Success!', description: 'Your pickup request has been submitted.' });
        form.reset();
        setPreview(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Pickup Request</CardTitle>
        <CardDescription>Fill out the form to schedule a new e-waste pickup.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Photo</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                            {preview ? (
                                <Image src={preview} alt="Preview" width={150} height={150} className="object-contain h-full" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
                                </div>
                            )}
                            <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={e => { field.onChange(e.target.files); handleFileChange(e); }} />
                        </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Battery">Battery</SelectItem>
                      <SelectItem value="Appliance">Appliance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Description
                    {isGenerating && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> AI is writing...</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Old Dell laptop, not turning on..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="123 Green St, Eco City" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isFetchingLocation}>
                      {isFetchingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      <span className="sr-only">Use my location</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || isGenerating || isFetchingLocation}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
