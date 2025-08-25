
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { PickupRequest, UserProfile } from '@/types';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

interface ContractorDashboardClientProps {
    initialPendingPickups: PickupRequest[];
    initialAcceptedPickups: PickupRequest[];
}

const mockContractorUser: UserProfile = {
  uid: 'contractor-001',
  role: 'Contractor',
  name: 'Govt Contractor',
  email: 'contractor@example.com',
  photoURL: ''
}

export function ContractorDashboardClient({ initialPendingPickups, initialAcceptedPickups }: ContractorDashboardClientProps) {
  const [pendingPickups, setPendingPickups] = useState<PickupRequest[]>(initialPendingPickups);
  const [acceptedPickups, setAcceptedPickups] = useState<PickupRequest[]>(initialAcceptedPickups);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshPickups = () => {
    const pending = JSON.parse(localStorage.getItem('pickups_pending') || '[]');
    // For contractors, we'll use a different key to avoid conflicts with recyclers
    const accepted = JSON.parse(localStorage.getItem(`pickups_accepted_${mockContractorUser.uid}`) || '[]');
    setPendingPickups(pending);
    setAcceptedPickups(accepted);
  }

  useEffect(() => {
    setLoading(true);
    refreshPickups();
    setLoading(false);

    window.addEventListener('pickups-updated', refreshPickups);
    return () => window.removeEventListener('pickups-updated', refreshPickups);
  }, []);
  
  const handleUpdateStatus = (pickup: PickupRequest, status: 'accepted' | 'rejected' | 'completed') => {
      // Remove from pending
      const currentPending = JSON.parse(localStorage.getItem('pickups_pending') || '[]');
      const newPending = currentPending.filter((p: PickupRequest) => p.id !== pickup.id);
      localStorage.setItem('pickups_pending', JSON.stringify(newPending));

      if (status === 'accepted') {
        const acceptedKey = `pickups_accepted_${mockContractorUser.uid}`;
        const currentAccepted = JSON.parse(localStorage.getItem(acceptedKey) || '[]');
        const updatedPickup = { ...pickup, status: 'accepted' as const, recyclerId: mockContractorUser.uid };
        localStorage.setItem(acceptedKey, JSON.stringify([updatedPickup, ...currentAccepted]));
      }
       
      if (status === 'completed') {
        const acceptedKey = `pickups_accepted_${mockContractorUser.uid}`;
        const currentAccepted = JSON.parse(localStorage.getItem(acceptedKey) || '[]');
        const newAccepted = currentAccepted.filter((p: PickupRequest) => p.id !== pickup.id);
        localStorage.setItem(acceptedKey, JSON.stringify(newAccepted));
      }

      // Update the original citizen's record
      const citizenKey = `pickups_${pickup.citizenId}`;
      const citizenPickups = JSON.parse(localStorage.getItem(citizenKey) || '[]');
      const updatedCitizenPickups = citizenPickups.map((p: PickupRequest) => 
        p.id === pickup.id ? { ...p, status } : p
      );
      localStorage.setItem(citizenKey, JSON.stringify(updatedCitizenPickups));

      window.dispatchEvent(new CustomEvent('pickups-updated'));
      toast({ title: `Request ${status}` });
  }

  return (
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
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(pickup, 'rejected')}><X className="h-4 w-4 mr-1" />Reject</Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(pickup, 'accepted')}><Check className="h-4 w-4 mr-1" />Accept</Button>
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
                            <Button size="sm" onClick={() => handleUpdateStatus(pickup, 'completed')}><Check className="h-4 w-4 mr-1" />Mark Complete</Button>
                        </div>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
  );
}
