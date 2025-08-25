
'use client';

import { useAuth } from '@/hooks/use-auth';
import LoginScreen from '@/components/login-screen';
import WelcomeScreen from '@/components/welcome-screen';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { loading, user, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }
  
  if (!userProfile) {
    // User is signed in but has no role yet. Show role selector.
    return <WelcomeScreen />;
  }

  // User is logged in and has a profile, they will be redirected by the useAuth hook.
  // Show a loading state while redirecting.
  return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
}
