
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { PickupRequest, PickupLocation, UserProfile } from '@/types';
import { Check, X, Route } from 'lucide-react';
import Image from 'next/image';


// Mock user profile since auth is removed
const mockUserProfile: UserProfile = {
    uid: 'recycler-001',
    name: 'Recycle Corp',
    email: 'recycler@example.com',
    role: 'Recycler',
    approved: true,
    photoURL: 'https://placehold.co/100x100.png',
};


export function RecyclerDashboardClient() {
  const [pendingPickups, setPendingPickups] = useState<PickupRequest[]>([]);
  const [acceptedForUser, setAcceptedForUser] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleGetDirections = (location: PickupLocation) => {
    if (!location?.displayAddress) {
      toast({ variant: 'destructive', description: "Pickup location not available." });
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.displayAddress)}`;
    window.open(url, '_blank');
  };

  const refreshPickups = useCallback(() => {
    const pending = JSON.parse(localStorage.getItem('pickups_pending') || '[]');
    const accepted = JSON.parse(localStorage.getItem(`pickups_accepted_${mockUserProfile.uid}`) || '[]');
    setPendingPickups(pending);
    setAcceptedForUser(accepted);
  }, []);

  useEffect(() => {
    setLoading(true);
    refreshPickups();
    setLoading(false);

    window.addEventListener('pickups-updated', refreshPickups);
    return () => window.removeEventListener('pickups-updated', refreshPickups);
  }, [refreshPickups]);
  
  const handleUpdateStatus = (pickup: PickupRequest, status: 'accepted' | 'rejected' | 'completed') => {
      // Update pending list
      const currentPending = JSON.parse(localStorage.getItem('pickups_pending') || '[]');
      const newPending = currentPending.filter((p: PickupRequest) => p.id !== pickup.id);
      localStorage.setItem('pickups_pending', JSON.stringify(newPending));

      // Update accepted list
      const acceptedKey = `pickups_accepted_${mockUserProfile.uid}`;
      let currentAccepted = JSON.parse(localStorage.getItem(acceptedKey) || '[]');
      
      if (status === 'accepted') {
        const updatedPickup = { ...pickup, status: 'accepted' as const, recyclerId: mockUserProfile.uid };
        currentAccepted = [updatedPickup, ...currentAccepted];
      } else if (status === 'completed') {
        currentAccepted = currentAccepted.filter((p: PickupRequest) => p.id !== pickup.id);
      }
      localStorage.setItem(acceptedKey, JSON.stringify(currentAccepted));
      
      // Update the original citizen's pickup list
      const citizenKey = `pickups_${pickup.citizenId}`;
      const citizenPickups = JSON.parse(localStorage.getItem(citizenKey) || '[]');
      const updatedCitizenPickups = citizenPickups.map((p: PickupRequest) => 
        p.id === pickup.id ? { ...p, status } : p
      );
      localStorage.setItem(citizenKey, JSON.stringify(updatedCitizenPickups));

      // Notify all components
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
             {loading ? <Skeleton className="h-32 w-full" /> : acceptedForUser.length === 0 ? <p className="text-muted-foreground text-center py-8">You have no accepted pickups.</p> :
              acceptedForUser.map(pickup => (
                <div key={pickup.id}>
                    <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex gap-4 items-center">
                            <Image src={pickup.photoURL} alt={pickup.description} width={80} height={80} className="rounded-md object-cover h-20 w-20" />
                            <div className="flex-1">
                                <p className="font-semibold">{pickup.category}</p>
                                <p className="text-sm text-muted-foreground">{pickup.location.displayAddress}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm" onClick={() => handleUpdateStatus(pickup, 'completed')}><Check className="h-4 w-4 mr-1" />Mark Complete</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleGetDirections(pickup.location)}><Route className="h-4 w-4 mr-1"/>Get Directions</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
  );
}
