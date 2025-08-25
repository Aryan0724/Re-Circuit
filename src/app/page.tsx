
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WelcomeScreen from '@/components/welcome-screen';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/components/dashboard-layout';
import LoginScreen from '@/components/auth/login-screen';
import SignUpScreen from '@/components/auth/signup-screen';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (!loading && user && userProfile?.role) {
      router.push(`/${userProfile.role.toLowerCase()}`);
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
       <DashboardLayout>
         <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
             <div className="space-y-4 text-center w-full max-w-4xl">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
                    <div className="lg:col-span-1"><Skeleton className="h-96" /></div>
                </div>
            </div>
       </div>
       </DashboardLayout>
    );
  }
  
  if (!user) {
    return showLogin ? <LoginScreen onSwitch={() => setShowLogin(false)} /> : <SignUpScreen onSwitch={() => setShowLogin(true)} />;
  }

  if (user && !userProfile?.role) {
    return <WelcomeScreen />;
  }

  // This should only show for a brief moment during redirection
  return (
       <DashboardLayout>
         <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
             <p>Loading your dashboard...</p>
         </div>
       </DashboardLayout>
    );
}
