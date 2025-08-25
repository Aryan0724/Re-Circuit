
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, HardHat, Recycle } from 'lucide-react';
import type { UserRole } from '@/types';
import { AnimatedGradient } from '@/components/animated-gradient';

export default function WelcomePage() {
  const router = useRouter();

  const handleRoleSelection = (role: UserRole) => {
    switch (role) {
      case 'Citizen':
        router.push('/citizen');
        break;
      case 'Recycler':
        router.push('/recycler');
        break;
      case 'Admin':
        router.push('/admin');
        break;
      case 'Contractor':
        router.push('/contractor');
        break;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#E5F5FB] p-4">
      <AnimatedGradient />
      <div className="z-10 text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-2">Welcome to Re-Circuit</h1>
        <p className="text-xl text-muted-foreground">The future of responsible e-waste management.</p>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Choose Your Role</CardTitle>
          <CardDescription className="text-center">Select a dashboard view to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleRoleSelection('Citizen')}
            className="w-full h-16 text-lg"
            variant="outline"
          >
            <User className="mr-3" /> Citizen
          </Button>
          <Button
            onClick={() => handleRoleSelection('Recycler')}
            className="w-full h-16 text-lg"
             variant="outline"
          >
            <Recycle className="mr-3" /> Recycler
          </Button>
           <Button
            onClick={() => handleRoleSelection('Contractor')}
            className="w-full h-16 text-lg"
             variant="outline"
          >
            <HardHat className="mr-3" /> Contractor
          </Button>
          <Button
            onClick={() => handleRoleSelection('Admin')}
            className="w-full h-16 text-lg"
             variant="outline"
          >
            <Shield className="mr-3" /> Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
