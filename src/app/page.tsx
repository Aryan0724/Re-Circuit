
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, HardHat, Recycle } from 'lucide-react';

export default function Home() {
  const roles = [
    { name: 'Citizen', href: '/citizen', icon: User },
    { name: 'Admin', href: '/admin', icon: Settings },
    { name: 'Contractor', href: '/contractor', icon: HardHat },
    { name: 'Recycler', href: '/recycler', icon: Recycle },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent py-12">
      <h1 className="text-4xl font-bold mb-10 text-foreground">Select Your Role</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl px-4">
        {roles.map((role) => (
          <Link key={role.name} href={role.href} passHref>
            <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <role.icon className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">{role.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {role.name === 'Citizen' && 'Manage your e-waste pickups and track your impact.'}
                  {role.name === 'Admin' && 'Oversee platform activity and manage users.'}
                  {role.name === 'Contractor' && 'Manage incoming e-waste pickup requests for your contracts.'}
                  {role.name === 'Recycler' && 'View available pickups and plan your recycling routes.'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} E-Waste Recycling Platform
      </footer>
    </div>
  );
}
