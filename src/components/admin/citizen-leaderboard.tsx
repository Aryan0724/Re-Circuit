'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award } from 'lucide-react';
import type { UserProfile } from '@/types';


const mockCitizens: UserProfile[] = [
    {
        uid: 'citizen-001',
        role: 'Citizen',
        name: 'Eco Citizen',
        email: 'citizen@example.com',
        photoURL: 'https://placehold.co/100x100.png',
        credits: 420,
    },
    {
        uid: 'citizen-002',
        role: 'Citizen',
        name: 'Jane Green',
        email: 'jane@example.com',
        photoURL: 'https://placehold.co/100x100.png',
        credits: 350,
    },
    {
        uid: 'citizen-003',
        role: 'Citizen',
        name: 'Recycle Rick',
        email: 'rick@example.com',
        photoURL: 'https://placehold.co/100x100.png',
        credits: 280,
    }
];


export function CitizenLeaderboard() {
  const [citizens, setCitizens] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Sort mock citizens by credits
    const sortedCitizens = [...mockCitizens].sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0));
    setCitizens(sortedCitizens);
    setLoading(false);
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
