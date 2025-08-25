'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award } from 'lucide-react';
import type { UserProfile } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';


export function CitizenLeaderboard() {
  const [citizens, setCitizens] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
        collection(db, 'users'), 
        where('role', '==', 'Citizen'),
        orderBy('credits', 'desc'),
        limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const citizensData = snapshot.docs.map(doc => ({...doc.data(), uid: doc.id})) as UserProfile[];
        setCitizens(citizensData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citizen Leaderboard</CardTitle>
        <CardDescription>Top contributing citizens by credits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : citizens.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No citizen data available.</p>
        ) : (
          citizens.map((citizen, index) => (
            <div
              key={citizen.uid}
              className="flex items-center gap-4"
            >
              <span className="font-bold text-lg w-6 text-center">{index + 1}</span>
              <Avatar>
                <AvatarImage src={citizen.photoURL} alt={citizen.name} />
                <AvatarFallback>{citizen.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-medium flex-1 truncate">{citizen.name}</p>
              <div className="flex items-center gap-1 font-bold text-yellow-500">
                <Award className="h-4 w-4" />
                <span>{citizen.credits ?? 0}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
