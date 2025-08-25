'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import type { PickupRequest, PickupStatus } from '@/types';
import { Package, Hourglass, CheckCircle2, XCircle, Truck } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<PickupStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Hourglass className="h-3 w-3" />, color: 'bg-yellow-500' },
  accepted: { label: 'Accepted', icon: <Truck className="h-3 w-3" />, color: 'bg-blue-500' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-500' },
  rejected: { label: 'Rejected', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-500' },
};

// Mock data, in a real app this would come from a database
const mockPickups: Omit<PickupRequest, 'createdAt'>[] = [
    {
        id: '1',
        citizenId: 'citizen-001',
        citizenName: 'Eco Citizen',
        category: 'Laptop',
        description: 'Old Dell laptop, not turning on.',
        location: { displayAddress: '123 Green St, Eco City', lat: 0, lon: 0 },
        photoURL: 'https://placehold.co/128x128.png',
        status: 'completed',
    },
    {
        id: '2',
        citizenId: 'citizen-001',
        citizenName: 'Eco Citizen',
        category: 'Mobile',
        description: 'Cracked screen iPhone X',
        location: { displayAddress: '123 Green St, Eco City', lat: 0, lon: 0 },
        photoURL: 'https://placehold.co/128x128.png',
        status: 'accepted',
    },
     {
        id: '3',
        citizenId: 'citizen-001',
        citizenName: 'Eco Citizen',
        category: 'Battery',
        description: 'Leaking car battery',
        location: { displayAddress: '123 Green St, Eco City', lat: 0, lon: 0 },
        photoURL: 'https://placehold.co/128x128.png',
        status: 'pending',
    }
];


export function UserPickupsList() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      const pickupsWithDate = mockPickups.map(p => ({ ...p, createdAt: new Date() as any }));
      setPickups(pickupsWithDate);
      setLoading(false);
    }, 500);
  }, []);

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
            <AnimatePresence>
              {pickups.map((pickup) => {
                const config = statusConfig[pickup.status];
                return (
                  <motion.div
                    key={pickup.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
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
                          {/* We use a static date since it's mock data */}
                          {formatDistanceToNow(new Date(2024, 4, 10), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className={`${config.color} text-white hover:${config.color} flex items-center gap-1.5`}>
                          {config.icon}
                          {config.label}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
