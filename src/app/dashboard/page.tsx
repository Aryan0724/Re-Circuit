'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Package, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { PickupRequestForm } from '@/components/citizen/pickup-request-form';
import { UserPickupsList } from '@/components/citizen/user-pickups-list';

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`text-${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function CitizenDashboardPage() {
  const { userProfile, loading } = useAuth();

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
      
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard icon={<Star className="h-5 w-5" />} title="Your Credits" value={userProfile.credits ?? 0} color="yellow-500" />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard icon={<Package className="h-5 w-5" />} title="Total Pickups" value={0} color="blue-500" />
        </motion.div>
         <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard icon={<Award className="h-5 w-5" />} title="Eco-Badge" value="Seedling" color="green-500" />
        </motion.div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-5">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PickupRequestForm />
        </motion.div>
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <UserPickupsList />
        </motion.div>
      </div>

    </DashboardLayout>
  );
}
