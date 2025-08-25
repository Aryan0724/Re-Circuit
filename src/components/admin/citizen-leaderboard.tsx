'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import type { UserProfile } from '@/types';

export function CitizenLeaderboard() {
  const [citizens, setCitizens] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'Citizen'),
      orderBy('credits', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCitizens(snapshot.docs.map(doc => doc.data() as UserProfile));
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
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : citizens.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No citizen data available.</p>
        ) : (
          citizens.map((citizen, index) => (
            <motion.div
              key={citizen.uid}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
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
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
