'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';

const mockRecyclers: UserProfile[] = [
    { uid: 'recycler-001', role: 'Recycler', name: 'Green Recyclers', email: 'recycler@example.com', photoURL: 'https://placehold.co/100x100.png', approved: false },
    { uid: 'recycler-002', role: 'Recycler', name: 'Eco Warriors', email: 'warriors@example.com', photoURL: 'https://placehold.co/100x100.png', approved: true },
]

export function RecyclerManagement() {
  const [recyclers, setRecyclers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial state from mock data and localStorage
    const loadedRecyclers = mockRecyclers.map(r => {
        const storedApproval = localStorage.getItem(`recycler_${r.uid}_approved`);
        return {
            ...r,
            approved: storedApproval ? storedApproval === 'true' : r.approved,
        };
    });
    setRecyclers(loadedRecyclers);
    setLoading(false);
  }, []);

  const handleApprovalChange = (uid: string, approved: boolean) => {
    try {
        localStorage.setItem(`recycler_${uid}_approved`, String(approved));
        setRecyclers(currentRecyclers => 
            currentRecyclers.map(r => r.uid === uid ? { ...r, approved } : r)
        );
        toast({ title: `Recycler ${approved ? 'approved' : 'unapproved'}.` });
        // Dispatch an event so other parts of the app can react if needed
        window.dispatchEvent(new CustomEvent('recycler-approval-changed', { detail: { uid, approved } }));
    } catch (error) {
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
          <p>Loading...</p>
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
