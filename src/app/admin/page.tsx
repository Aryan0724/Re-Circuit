'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Recycle, Activity, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { RecyclerManagement } from '@/components/admin/recycler-management';
import { CitizenLeaderboard } from '@/components/admin/citizen-leaderboard';

function AdminStatCard({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string | number; subtitle: string; }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
    // Mock stats
    const [stats, setStats] = useState({ users: 2350, recyclers: 2, pickups: 142, completed: 120 });
    const [loading, setLoading] = useState(false);

    return (
        <DashboardLayout>
            <PageHeader title="Admin Dashboard" subtitle="Oversee platform activity and manage users." />
            
            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
                variants={{
                    animate: { transition: { staggerChildren: 0.1 } }
                }}
                initial="initial"
                animate="animate"
            >
                {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) :
                <>
                    <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
                        <AdminStatCard icon={<Users className="h-4 w-4 text-muted-foreground" />} title="Total Users" value={stats.users} subtitle="All roles" />
                    </motion.div>
                    <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
                        <AdminStatCard icon={<Recycle className="h-4 w-4 text-muted-foreground" />} title="Recyclers" value={stats.recyclers} subtitle="Registered recyclers" />
                    </motion.div>
                    <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
                        <AdminStatCard icon={<Activity className="h-4 w-4 text-muted-foreground" />} title="Total Pickups" value={stats.pickups} subtitle="All time requests" />
                    </motion.div>
                    <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
                        <AdminStatCard icon={<PackageCheck className="h-4 w-4 text-muted-foreground" />} title="Completed Pickups" value={stats.completed} subtitle="Successful collections" />
                    </motion.div>
                </>
                }
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecyclerManagement />
                </div>
                <div>
                    <CitizenLeaderboard />
                </div>
            </div>
        </DashboardLayout>
    );
}
