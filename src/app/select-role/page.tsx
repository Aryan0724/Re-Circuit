'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User, Recycle, Building, Shield, HardHat, Check } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { role: UserRole; title: string; description: string; icon: React.ReactNode }[] = [
  {
    role: 'Citizen',
    title: 'I am a Citizen',
    description: 'I want to recycle my e-waste and earn rewards.',
    icon: <User className="h-8 w-8 text-primary" />,
  },
  {
    role: 'Recycler',
    title: 'I am an NGO/Recycler',
    description: 'I want to collect e-waste for recycling.',
    icon: <Recycle className="h-8 w-8 text-primary" />,
  },
  {
    role: 'Admin',
    title: 'I am an Admin',
    description: 'I need to manage the platform and users.',
    icon: <Shield className="h-8 w-8 text-primary" />,
  },
  {
    role: 'Contractor',
    title: 'I am a Contractor',
    description: 'I need to monitor pickup activities.',
    icon: <HardHat className="h-8 w-8 text-primary" />,
  },
];

export default function SelectRolePage() {
  const { user, setUserRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome to Re-Circuit!</CardTitle>
            <CardDescription>
              To get started, please select the role that best describes you.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="h-full flex flex-col items-center justify-center text-center p-6 hover:bg-primary/5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setUserRole(item.role)}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
