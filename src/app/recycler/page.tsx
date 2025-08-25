'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { updatePickupStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { PickupRequest } from '@/types';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { RoutePlanner } from '@/components/recycler/route-planner';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';

export default function RecyclerDashboardPage() {
  const { userProfile } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<PickupRequest[]>([]);
  const [acceptedPickups, setAcceptedPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userProfile?.uid) return;

    setLoading(true);

    // Listener for pending pickups
    const pendingQuery = query(collection(db, 'pickups'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(pendingQuery, (snapshot) => {
      const pickupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PickupRequest[];
      setPendingPickups(pickupsData);
      setLoading(false);
    });

    // Listener for pickups accepted by the current recycler
    const acceptedQuery = query(collection(db, 'pickups'), where('status', '==', 'accepted'), where('recyclerId', '==', userProfile.uid));
    const unsubAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      const pickupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PickupRequest[];
      setAcceptedPickups(pickupsData);
    });

    return () => {
      unsubPending();
      unsubAccepted();
    };
  }, [userProfile?.uid]);
  
  const handleUpdateStatus = async (pickupId: string, status: 'accepted' | 'rejected' | 'completed') => {
    const result = await updatePickupStatus(pickupId, status, userProfile?.uid);
    if(result.success) {
      toast({ title: `Request ${status}` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update status.' });
    }
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
            {loading ? <Skeleton className="h-32 w-full" /> : pendingPickups.length === 0 ? <p className="text-muted-foreground text-center py-8">No pending requests.</p> :
              pendingPickups.map(pickup => (
                <div key={pickup.id}>
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
                </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Accepted Pickups</CardTitle>
            <CardDescription>Items you've scheduled for pickup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
             {loading ? <Skeleton className="h-32 w-full" /> : acceptedPickups.length === 0 ? <p className="text-muted-foreground text-center py-8">You have no accepted pickups.</p> :
              acceptedPickups.map(pickup => (
                <div key={pickup.id}>
                    <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex gap-4 items-center">
                            <Image src={pickup.photoURL} alt={pickup.description} width={80} height={80} className="rounded-md object-cover h-20 w-20" />
                            <div className="flex-1">
                                <p className="font-semibold">{pickup.category}</p>
                                <p className="text-sm text-muted-foreground">{pickup.location.displayAddress}</p>
                            </div>
                            <Button size="sm" onClick={() => handleUpdateStatus(pickup.id, 'completed', userProfile?.uid, pickup.citizenId)}><Check className="h-4 w-4 mr-1" />Mark Complete</Button>
                        </div>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
