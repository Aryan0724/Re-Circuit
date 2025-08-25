'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PickupRequest, PickupStatus } from '@/types';
import { Package, Hourglass, CheckCircle2, XCircle, Truck } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const statusConfig: Record<PickupStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Hourglass className="h-3 w-3" />, color: 'bg-yellow-500' },
  accepted: { label: 'Accepted', icon: <Truck className="h-3 w-3" />, color: 'bg-blue-500' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-500' },
  rejected: { label: 'Rejected', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-500' },
};


export function UserPickupsList() {
  const { userProfile } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const q = query(
        collection(db, 'pickups'), 
        where('citizenId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const pickupsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to Date
        })) as PickupRequest[];
        setPickups(pickupsData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Your Pickup History</CardTitle>
        <CardDescription>Track the status of your e-waste pickups.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {loading ? (
            <p>Loading...</p>
          ) : pickups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <Package className="mx-auto h-12 w-12" />
                <p className="mt-4">You haven't made any pickup requests yet.</p>
            </div>
          ) : (
            <div>
              {pickups.map((pickup) => {
                const config = statusConfig[pickup.status];
                return (
                  <div
                    key={pickup.id}
                    className="mb-2"
                  >
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                      <Image
                        src={pickup.photoURL}
                        alt={pickup.description}
                        width={64}
                        height={64}
                        className="rounded-md object-cover h-16 w-16"
                        data-ai-hint="electronics"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{pickup.category}</h4>
                        <p className="text-sm text-muted-foreground truncate">{pickup.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pickup.createdAt ? formatDistanceToNow(new Date(pickup.createdAt), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                      <Badge className={`${config.color} text-white hover:${config.color} flex items-center gap-1.5`}>
                          {config.icon}
                          {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
