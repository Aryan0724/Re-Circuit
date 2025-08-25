
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { UserProfile } from '@/types';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  photo: z.any().optional(),
});

interface ProfileEditorProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileEditor({ children, open, onOpenChange }: ProfileEditorProps) {
  const { userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (userProfile && open) {
      form.reset({ name: userProfile.name });
      setPreview(userProfile.photoURL);
    }
  }, [userProfile, open, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile) return;
    setIsSubmitting(true);
    
    try {
        const profileUpdates: Partial<Pick<UserProfile, 'name' | 'photoURL'>> = {
            name: values.name,
        };

        if (preview && preview !== userProfile.photoURL) {
            profileUpdates.photoURL = preview;
        }
        
        updateProfile(profileUpdates);
        
        toast({ title: 'Success!', description: 'Your profile has been updated.' });
        onOpenChange(false); // Close the dialog on success
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating your profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
                    <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                            <FormLabel>Profile Picture</FormLabel>
                             <FormControl>
                                <label htmlFor="profile-pic-upload" className="cursor-pointer">
                                    <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
                                        <AvatarImage src={preview || ''} alt={userProfile?.name} />
                                        <AvatarFallback>{userProfile?.name ? userProfile.name.charAt(0) : 'U'}</AvatarFallback>
                                    </Avatar>
                                    <Input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={e => { field.onChange(e.target.files); handleFileChange(e); }} />
                                </label>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
