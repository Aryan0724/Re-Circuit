
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Recycle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be less than 20 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

interface SignUpScreenProps {
    onSwitch: () => void;
}

export default function SignUpScreen({ onSwitch }: SignUpScreenProps) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await signUp(values.username, values.email, values.password);
      toast({ title: 'Account created successfully!', description: 'Please select your role to continue.' });
      // The useAuth hook will handle redirection to the welcome screen
    } catch (error: any) {
        let errorMessage = 'An unknown error occurred. Please check the console for more details or contact support.';
        
        if (error.message?.includes('Username is already taken')) {
            errorMessage = 'This username is already taken. Please choose another one.';
        } else if (error.code) {
             switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already in use by another account.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. Please use at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid.';
                    break;
                 case 'permission-denied': // Firestore permission error
                    errorMessage = 'There was a problem setting up your profile. Please check Firestore security rules and contact support.';
                    break;
                default:
                    errorMessage = `An unexpected error occurred: ${error.code || error.message}`;
                    break;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0FFF4] p-4 text-green-800">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-green-100">
            <div className="text-center mb-8">
                <Recycle className="h-12 w-12 mx-auto mb-2"/>
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-muted-foreground text-base">Join Re-Circuit and make an impact!</p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input placeholder="your_username" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                ) : (
                    'Sign Up'
                )}
                </Button>
            </form>
            </Form>

             <div className="mt-6 text-center">
                <p className="text-sm">
                    Already have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={onSwitch}>Login</Button>
                </p>
            </div>
        </div>
    </div>
  );
}
