
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
             <div className="space-y-4 text-center">
                <p className="text-muted-foreground">Loading your dashboard...</p>
                <Skeleton className="h-28 w-full" />
                <div className="mt-8 grid gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
                    <div className="lg:col-span-3"><Skeleton className="h-96" /></div>
                </div>
            </div>
       </div>
       </DashboardLayout>
    );
  }
  
  if (!userProfile?.role) {
    return <WelcomeScreen />;
  }

  // This part should ideally not be reached
  return null;
}
