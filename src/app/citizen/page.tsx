'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Package, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PickupRequestForm } from '@/components/citizen/pickup-request-form';
import { UserPickupsList } from '@/components/citizen/user-pickups-list';
import { useEffect, useState, use } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImpactDashboard } from '@/components/citizen/impact-dashboard';

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

const getTotalPickups = async (uid: string) => {
    const storedPickups = localStorage.getItem(`pickups_${uid}`);
    if (storedPickups) {
        return JSON.parse(storedPickups).length;
    }
    return 0;
}


export default function CitizenDashboardPage() {
  const { userProfile, loading } = useAuth();
  const [totalPickups, setTotalPickups] = useState(0);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const getPickups = () => {
        const storedPickups = localStorage.getItem(`pickups_${userProfile.uid}`);
        if (storedPickups) {
            setTotalPickups(JSON.parse(storedPickups).length);
        }
    }
    getPickups();
    
    window.addEventListener('pickups-updated', getPickups);
    return () => window.removeEventListener('pickups-updated', getPickups);

  }, [userProfile?.uid]);


  if (loading || !userProfile) {
    return (
      <DashboardLayout>
        <PageHeader title="Dashboard" subtitle="Loading your personal space..." />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
            <div className="lg:col-span-3"><Skeleton className="h-96" /></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title={`Welcome, ${userProfile.name}!`} subtitle="Manage your e-waste pickups and track your contributions." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard icon={<Star className="h-5 w-5" />} title="Your Credits" value={userProfile.credits ?? 0} color="text-yellow-500" />
        <StatCard icon={<Package className="h-5 w-5" />} title="Total Pickups" value={totalPickups} color="text-blue-500" />
        <StatCard icon={<Award className="h-5 w-5" />} title="Eco-Badge" value="Seedling" color="text-green-500" />
      </div>

      <Tabs defaultValue="pickups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="pickups">My Pickups</TabsTrigger>
            <TabsTrigger value="impact">My Impact</TabsTrigger>
        </TabsList>
        <TabsContent value="pickups" className="mt-6">
             <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-2">
                <PickupRequestForm />
                </div>
                <div className="lg:col-span-3">
                <UserPickupsList />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="impact" className="mt-6">
            <ImpactDashboard />
        </TabsContent>
      </Tabs>

    </DashboardLayout>
  );
}
