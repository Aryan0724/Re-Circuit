'use client';

import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { AnimatedGradient } from '@/components/animated-gradient';
import LoginScreen from '@/components/login-screen';
import WelcomeScreen from '@/components/welcome-screen';

export default function Providers({ children }: { children: ReactNode }) {
  const { userProfile, loading } = useAuth();

  if (loading) {
 return null; // Or a loading spinner
  }

  return (
    <AuthProvider>
 <AnimatedGradient />
 <main>{!userProfile ? <LoginScreen /> : userProfile.role === 'New' ? <WelcomeScreen /> : children}</main>
 <Toaster />
    </AuthProvider>
  );
}