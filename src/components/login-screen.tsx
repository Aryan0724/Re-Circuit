'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChromeIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-primary">Re-Circuit</h1>
          <CardDescription className="pt-2">
            Your partner in building a sustainable future. Sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={signInWithGoogle} 
            disabled={loading}
            size="lg"
          >
            <ChromeIcon className="mr-2 h-5 w-5" />
            {loading ? 'Redirecting to Google...' : 'Sign in with Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;