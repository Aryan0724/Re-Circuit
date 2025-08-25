
'use client';

import { useAuth } from '@/hooks/use-auth';
import LoginScreen from '@/components/login-screen';
import WelcomeScreen from '@/components/welcome-screen';

export default function Home() {
  const { loading, user, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userProfile) {
    // User is logged in and has a profile, they will be redirected by the useAuth hook.
    return null;
  }
  
  if (!user) {
    return <LoginScreen />;
  }

  // User is signed in but has no role yet. Show role selector.
  return <WelcomeScreen />;
}
