'use server';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PickupRequest } from '@/types';
import { RoutePlanner } from '@/components/recycler/route-planner';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RecyclerDashboardClient } from '@/components/recycler/recycler-dashboard-client';

async function getPickups(userId: string) {
    // NOTE: This is a mock implementation using localStorage.
    // In a real app, you would fetch this data from a database on the server.
    // The localStorage calls will not work in a Server Component, so we return empty arrays.
    const pending: PickupRequest[] = []; // JSON.parse(localStorage.getItem('pickups_pending') || '[]');
    const accepted: PickupRequest[] = []; // JSON.parse(localStorage.getItem(`pickups_accepted_${userId}`) || '[]');
    return { pending, accepted };
}


export default async function RecyclerDashboardPage() {
  // Mock user for server component. In a real app, you'd get this from the session.
  const userProfile = { uid: 'recycler-001', name: 'Green Recyclers', role: 'Recycler' as const, approved: true };

   if (!userProfile.approved) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-lg text-center p-8">
                    <CardHeader>
                        <CardTitle>Approval Pending</CardTitle>
                        <CardDescription>Your account is awaiting approval from an administrator. You will be able to see pickup requests once approved.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </DashboardLayout>
    )
  }

  const { pending, accepted } = await getPickups(userProfile.uid);

  return (
    <DashboardLayout>
      <PageHeader title="Recycler Dashboard" subtitle="Manage incoming e-waste pickup requests.">
        <RoutePlanner acceptedPickups={accepted} />
      </PageHeader>
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <RecyclerDashboardClient initialPendingPickups={pending} initialAcceptedPickups={accepted} />
      </Suspense>
    </DashboardLayout>
  );
}

function DashboardLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>New requests available for pickup.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Your Accepted Pickups</CardTitle>
                    <CardDescription>Items you've scheduled for pickup.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                     <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
