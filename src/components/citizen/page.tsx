
'use client';

import DashboardLayout from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Package, Star } from 'lucide-react';
import { PickupRequestForm } from '@/components/citizen/pickup-request-form';
import { UserPickupsList } from '@/components/citizen/user-pickups-list';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImpactDashboard } from '@/components/citizen/impact-dashboard';
import type { UserProfile } from '@/types';
import { CitizenLeaderboard } from '@/components/citizen/citizen-leaderboard';
import { useAuth } from '@/hooks/use-auth';

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

export default function CitizenDashboardPage() {
  const { userProfile } = useAuth();
  const [totalPickups, setTotalPickups] = useState(0);

  useEffect(() => {
    if (!userProfile) return;

    const getPickups = () => {
        const storedPickups = localStorage.getItem(`pickups_${userProfile.uid}`);
        if (storedPickups) {
            setTotalPickups(JSON.parse(storedPickups).length);
        }
    }
    getPickups();
    
    window.addEventListener('pickups-updated', getPickups);
    return () => window.removeEventListener('pickups-updated', getPickups);

  }, [userProfile]);
  
  if (!userProfile) {
    return <DashboardLayout><p>Loading profile...</p></DashboardLayout>
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
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
            <TabsTrigger value="pickups">My Pickups</TabsTrigger>
            <TabsTrigger value="impact">My Impact</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
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
        <TabsContent value="leaderboard" className="mt-6">
            <CitizenLeaderboard />
        </TabsContent>
      </Tabs>

    </DashboardLayout>
  );
}
