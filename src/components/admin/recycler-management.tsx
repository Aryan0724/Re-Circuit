'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { approveRecycler } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';

export function RecyclerManagement() {
  const [recyclers, setRecyclers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'), where('role', '==', 'Recycler'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecyclers(snapshot.docs.map(doc => doc.data() as UserProfile));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprovalChange = async (uid: string, approved: boolean) => {
    const result = await approveRecycler(uid, approved);
    if(result.success) {
      toast({ title: `Recycler ${approved ? 'approved' : 'unapproved'}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update recycler status.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recycler Management</CardTitle>
        <CardDescription>Approve or deny recycler accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : recyclers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recyclers have registered yet.</p>
        ) : (
          recyclers.map((recycler) => (
            <motion.div
              key={recycler.uid}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={recycler.photoURL} alt={recycler.name} />
                  <AvatarFallback>{recycler.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{recycler.name}</p>
                  <p className="text-sm text-muted-foreground">{recycler.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{recycler.approved ? 'Approved' : 'Pending'}</span>
                <Switch
                  checked={recycler.approved}
                  onCheckedChange={(checked) => handleApprovalChange(recycler.uid, checked)}
                  aria-label={`Approve ${recycler.name}`}
                />
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
