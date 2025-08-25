'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Recycle, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    // AuthProvider will handle redirection, but this is a fallback.
    router.push('/dashboard'); 
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Recycle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">Re-Circuit</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your connection to a sustainable future. Manage e-waste responsibly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full text-lg py-6" 
              onClick={signInWithGoogle}
              disabled={loading}
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
