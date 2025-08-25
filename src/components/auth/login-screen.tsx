
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
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

interface LoginScreenProps {
    onSwitch: () => void;
}

export default function LoginScreen({ onSwitch }: LoginScreenProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({ title: 'Login successful!' });
      // The useAuth hook will handle redirection
    } catch (error: any) {
        let errorMessage = 'An unknown error occurred.';
        if (error.code) {
            switch(error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password.';
                    break;
                default:
                    errorMessage = 'Failed to login. Please try again.';
                    break;
            }
        }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
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
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
                <p className="text-muted-foreground text-base">Sign in to your Re-Circuit account</p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                ) : (
                    'Sign In'
                )}
                </Button>
            </form>
            </Form>

             <div className="mt-6 text-center">
                <p className="text-sm">
                    Don&apos;t have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={onSwitch}>Sign Up</Button>
                </p>
            </div>
        </div>
    </div>
  );
}
