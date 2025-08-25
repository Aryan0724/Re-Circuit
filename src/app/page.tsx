
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WelcomeScreen from '@/components/welcome-screen';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/components/dashboard-layout';

export default function Home() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.role) {
      router.push(`/${userProfile.role.toLowerCase()}`);
    }
  }, [userProfile, loading, router]);

  if (loading || (userProfile && userProfile.role)) {
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
  
  // A "fake" user profile exists but they haven't selected a role yet
  if (userProfile && !userProfile.role) {
    return <WelcomeScreen />;
  }

  // This part should ideally not be reached if logic is correct
  return null;
}
