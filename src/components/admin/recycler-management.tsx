
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export function RecyclerManagement() {
  const [recyclers, setRecyclers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecyclers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'Recycler'));
            const querySnapshot = await getDocs(q);
            const recyclerList = querySnapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
            setRecyclers(recyclerList);
        } catch (error) {
            console.error("Error fetching recyclers:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch recycler data.' });
        }
        setLoading(false);
    }
    fetchRecyclers();
  }, [toast]);

  const handleApprovalChange = async (uid: string, approved: boolean) => {
    try {
        const recyclerDocRef = doc(db, 'users', uid);
        await updateDoc(recyclerDocRef, { approved });

        setRecyclers(currentRecyclers => 
            currentRecyclers.map(r => r.uid === uid ? { ...r, approved } : r)
        );
        toast({ title: `Recycler ${approved ? 'approved' : 'unapproved'}.` });
    } catch (error) {
        console.error("Error updating recycler status:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update recycler status.' });
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
          <p>Loading recyclers...</p>
        ) : recyclers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recyclers have registered yet.</p>
        ) : (
          recyclers.map((recycler) => (
            <div
              key={recycler.uid}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={recycler.photoURL} alt={recycler.name} />
                  <AvatarFallback>{recycler.name?.charAt(0) || 'R'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{recycler.name}</p>
                  <p className="text-sm text-muted-foreground">{recycler.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{recycler.approved ? 'Approved' : 'Pending'}</span>
                <Switch
                  checked={!!recycler.approved}
                  onCheckedChange={(checked) => handleApprovalChange(recycler.uid, checked)}
                  aria-label={`Approve ${recycler.name}`}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
