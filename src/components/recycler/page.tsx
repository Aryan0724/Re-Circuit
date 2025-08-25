'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import type { PickupRequest } from '@/types';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { RoutePlanner } from '@/components/recycler/route-planner';

const mockPendingPickupsData: Omit<PickupRequest, 'createdAt'>[] = [
  { id: 'p1', citizenId: 'c1', citizenName: 'Alice', category: 'Laptop', description: 'Broken Macbook Pro', location: { displayAddress: '1 Main St', lat: 0, lon: 0 }, photoURL: 'https://placehold.co/128x128.png', status: 'pending' },
  { id: 'p2', citizenId: 'c2', citizenName: 'Bob', category: 'Appliance', description: 'Old microwave', location: { displayAddress: '2 Oak Ave', lat: 0, lon: 0 }, photoURL: 'https://placehold.co/128x128.png', status: 'pending' },
];

const mockAcceptedPickupsData: Omit<PickupRequest, 'createdAt'>[] = [
  { id: 'p3', citizenId: 'c3', citizenName: 'Charlie', recyclerId: 'recycler-001', category: 'Battery', description: 'Used car battery', location: { displayAddress: '3 Pine Ln', lat: 0, lon: 0 }, photoURL: 'https://placehold.co/128x128.png', status: 'accepted' },
];

export default function RecyclerDashboardPage() {
  const { userProfile } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<PickupRequest[]>([]);
  const [acceptedPickups, setAcceptedPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userProfile) return;
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
        setPendingPickups(mockPendingPickupsData.map(p => ({ ...p, createdAt: new Date() as any })));
        setAcceptedPickups(mockAcceptedPickupsData.map(p => ({ ...p, createdAt: new Date() as any })));
        setLoading(false);
    }, 500);
  }, [userProfile]);
  
  const handleUpdateStatus = async (pickupId: string, status: 'accepted' | 'rejected' | 'completed') => {
    // In-memory update for demonstration
    if (status === 'accepted') {
      const pickupToAccept = pendingPickups.find(p => p.id === pickupId);
      if (pickupToAccept) {
        setPendingPickups(current => current.filter(p => p.id !== pickupId));
        setAcceptedPickups(current => [{ ...pickupToAccept, status: 'accepted' }, ...current]);
      }
    } else if (status === 'rejected') {
        setPendingPickups(current => current.filter(p => p.id !== pickupId));
    } else if (status === 'completed') {
        setAcceptedPickups(current => current.filter(p => p.id !== pickupId));
    }

    toast({ title: `Request ${status}` });
  }

  if (!userProfile?.approved) {
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

  return (
    <DashboardLayout>
      <PageHeader title="Recycler Dashboard" subtitle="Manage incoming e-waste pickup requests.">
        <RoutePlanner acceptedPickups={acceptedPickups} />
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>New requests available for pickup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {loading ? <p>Loading...</p> : pendingPickups.length === 0 ? <p className="text-muted-foreground text-center py-8">No pending requests.</p> :
              pendingPickups.map(pickup => (
                <motion.div key={pickup.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex gap-4">
                            <Image src={pickup.photoURL} alt={pickup.description} width={80} height={80} className="rounded-md object-cover h-20 w-20" />
                            <div className="flex-1">
                                <p className="font-semibold">{pickup.category}</p>
                                <p className="text-sm text-muted-foreground truncate">{pickup.description}</p>
                                <p className="text-xs text-muted-foreground">{pickup.location.displayAddress}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3 justify-end">
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(pickup.id, 'rejected')}><X className="h-4 w-4 mr-1" />Reject</Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(pickup.id, 'accepted')}><Check className="h-4 w-4 mr-1" />Accept</Button>
                        </div>
                    </div>
                </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Accepted Pickups</CardTitle>
            <CardDescription>Items you've scheduled for pickup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
             {loading ? <p>Loading...</p> : acceptedPickups.length === 0 ? <p className="text-muted-foreground text-center py-8">You have no accepted pickups.</p> :
              acceptedPickups.map(pickup => (
                <motion.div key={pickup.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex gap-4 items-center">
                            <Image src={pickup.photoURL} alt={pickup.description} width={80} height={80} className="rounded-md object-cover h-20 w-20" />
                            <div className="flex-1">
                                <p className="font-semibold">{pickup.category}</p>
                                <p className="text-sm text-muted-foreground">{pickup.location.displayAddress}</p>
                            </div>
                            <Button size="sm" onClick={() => handleUpdateStatus(pickup.id, 'completed')}><Check className="h-4 w-4 mr-1" />Mark Complete</Button>
                        </div>
                    </div>
                </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
