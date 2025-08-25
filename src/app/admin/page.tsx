'use server';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Recycle, Activity, PackageCheck, AlertCircle } from 'lucide-react';
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

interface PlatformStats {
    users: number;
    recyclers: number;
    pickups: number;
    completed: number;
}

// Mock function to simulate fetching platform statistics
const fetchPlatformStats = async (): Promise<PlatformStats> => {
    // In a real app, you'd fetch this from your database.
    // The `await new Promise` is to simulate network latency.
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return {
        users: 2350,
        recyclers: 2,
        pickups: 142,
        completed: 120,
    };
};

export default async function AdminDashboardPage() {
    let stats: PlatformStats | null = null;
    let error: string | null = null;

    try {
        stats = await fetchPlatformStats();
    } catch (err) {
        error = 'Failed to load platform statistics.';
        console.error(err);
    }

    return (
        <DashboardLayout>
            <PageHeader title="Admin Dashboard" subtitle="Oversee platform activity and manage users." />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {error ? (
                    <div className="md:col-span-2 lg:col-span-4 text-center text-red-500 flex items-center justify-center"><AlertCircle className="mr-2"/> {error}</div>
                ) : stats ? (
                    <>
                        <AdminStatCard icon={<Users className="h-4 w-4 text-muted-foreground" />} title="Total Users" value={stats.users} subtitle="All roles" />
                        <AdminStatCard icon={<Recycle className="h-4 w-4 text-muted-foreground" />} title="Recyclers" value={stats.recyclers} subtitle="Registered recyclers" />
                        <AdminStatCard icon={<Activity className="h-4 w-4 text-muted-foreground" />} title="Total Pickups" value={stats.pickups} subtitle="All time requests" />
                        <AdminStatCard icon={<PackageCheck className="h-4 w-4 text-muted-foreground" />} title="Completed Pickups" value={stats.completed} subtitle="Successful collections" />
                    </>
                ) : (
                    // This will be shown during server-side rendering if stats are not yet available.
                    // Or you can implement a more sophisticated loading skeleton.
                    <p>Loading stats...</p>
                )}
            </div>

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
