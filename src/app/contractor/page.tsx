'use server';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { PickupRequest } from '@/types';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { RoutePlanner } from '@/components/recycler/route-planner';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractorDashboardClient } from '@/components/contractor/contractor-dashboard-client';

async function getPickups(userId: string) {
    // NOTE: This is a mock implementation using localStorage.
    // In a real app, you would fetch this data from a database.
    // The localStorage calls will not work in a Server Component.
    const pending = []; // JSON.parse(localStorage.getItem('pickups_pending') || '[]');
    const accepted = []; // JSON.parse(localStorage.getItem(`pickups_accepted_${userId}`) || '[]');
    return { pending, accepted };
}


export default async function RecyclerDashboardPage() {
  // Mock user for server component
  const userProfile = { uid: 'contractor-001', name: 'Govt Contractor', role: 'Contractor' as const };

  const { pending, accepted } = await getPickups(userProfile.uid);

  return (
    <DashboardLayout>
        <PageHeader title="Contractor Dashboard" subtitle="Manage incoming e-waste pickup requests.">
            <RoutePlanner acceptedPickups={accepted} />
        </PageHeader>
        <Suspense fallback={<DashboardLoadingSkeleton />}>
            <ContractorDashboardClient initialPendingPickups={pending} initialAcceptedPickups={accepted} />
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
