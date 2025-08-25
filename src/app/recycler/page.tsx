
'use server';

import DashboardLayout from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { PickupRequest } from '@/types';
import { RoutePlanner } from '@/components/recycler/route-planner';
import { Suspense } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Globe, Leaf, BarChart2, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RecyclerDashboardClient } from '@/components/recycler/recycler-dashboard-client';

async function getPickups(userId: string) {
    // NOTE: This is a mock implementation.
    // In a real app, you would fetch this data from a database on the server.
    // Since auth is removed, we'll return empty arrays for this server component.
    const pending: PickupRequest[] = [];
    const accepted: PickupRequest[] = [];
    return { pending, accepted };
}

interface RecyclerStats {
    totalEWasteKg: number;
    co2SavedTonnes: number;
    pickupsCompleted: number;
    itemsRecycled: number;
}

// Mock function to simulate fetching recycler impact statistics
const fetchRecyclerStats = async (userId: string): Promise<RecyclerStats> => {
    // In a real app, you'd fetch this from your database based on the recycler's completed pickups.
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return {
        totalEWasteKg: 1500,
        co2SavedTonnes: 3.5,
        pickupsCompleted: 58,
        itemsRecycled: 750,
    };
};

function ImpactStatCard({ icon, title, value, unit, description }: { icon: React.ReactNode; title: string; value: string | number; unit: string; description: string }) {
    return (
        <Card className="bg-green-50 border-green-200 text-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">{title}</CardTitle>
                <div className="text-green-600">{icon}</div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{value}<span className="text-sm font-normal"> {unit}</span></div><p className="text-xs text-green-700">{description}</p></CardContent>
        </Card>
}


export default async function RecyclerDashboardPage() {
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

      <Tabs defaultValue="pickups" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px] bg-green-100 text-green-800">
            <TabsTrigger value="pickups">Pickup Requests</TabsTrigger>
            <TabsTrigger value="your-pickups">Your Pickups</TabsTrigger>
            <TabsTrigger value="impact">Your Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="pickups" className="mt-6">
            <Suspense fallback={<DashboardLoadingSkeleton />}>
              <RecyclerDashboardClient initialPendingPickups={pending} initialAcceptedPickups={accepted} />
            </Suspense>
        </TabsContent>

        <TabsContent value="your-pickups" className="mt-6">
             <Suspense fallback={<DashboardLoadingSkeleton />}>
              <RecyclerDashboardClient initialPendingPickups={pending} initialAcceptedPickups={accepted} />
            </Suspense>
        </TabsContent>

        <TabsContent value="impact" className="mt-6">
            <Suspense fallback={<ImpactLoadingSkeleton />}>
               <ImpactSection userId={userProfile.uid} />
            </Suspense>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

async function ImpactSection({ userId }: { userId: string }) {
    const stats = await fetchRecyclerStats(userId);
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <ImpactStatCard icon={<Globe className="h-5 w-5" />} title="Total E-Waste Recycled" value={stats.totalEWasteKg} unit="kg" description="Your contribution to a cleaner planet." />
             <ImpactStatCard icon={<Leaf className="h-5 w-5" />} title="CO2 Emissions Avoided" value={stats.co2SavedTonnes} unit="tonnes" description="Equivalent to planting many trees!" />
             <ImpactStatCard icon={<BarChart2 className="h-5 w-5" />} title="Pickups Completed" value={stats.pickupsCompleted} unit="" description="Successful collections you've made." />
             <ImpactStatCard icon={<Package className="h-5 w-5" />} title="Items Recycled" value={stats.itemsRecycled} unit="" description="Individual items processed." />
        </div>
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

function ImpactLoadingSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full bg-green-100" />
            <Skeleton className="h-32 w-full bg-green-100" />
            <Skeleton className="h-32 w-full bg-green-100" />
            <Skeleton className="h-32 w-full bg-green-100" />
        </div>
    );
}
