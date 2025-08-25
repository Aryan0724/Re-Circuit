'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronRight, Moon, Sun, Recycle } from 'lucide-react';
import type { UserRole } from '@/types';
import { useEffect, useState } from 'react';

const roles: { role: UserRole; title: string }[] = [
  { role: 'Citizen', title: 'Citizen' },
  { role: 'Recycler', title: 'NGO/Recycler' },
  { role: 'Contractor', title: 'Govt Contractor' },
  { role: 'Admin', title: 'Admin' },
];

export default function Home() {
  const { loading, setUserRole } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
       <div className="absolute top-4 right-4">
        <Button onClick={toggleTheme} variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center gap-2"
      >
        <Recycle className="h-16 w-16 text-primary" />
        <h1 className="text-5xl font-bold text-primary">Re-Circuit</h1>
        <p className="mt-2 text-muted-foreground">Welcome! Please select your role to begin.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 w-full max-w-sm space-y-3"
      >
        {roles.map(({ role, title }) => (
          <Button
            key={role}
            variant="outline"
            size="lg"
            className="w-full justify-between text-base py-6 bg-card hover:bg-accent/50"
            onClick={() => setUserRole(role)}
          >
            {title}
            <ChevronRight className="h-5 w-5" />
          </Button>
        ))}
      </motion.div>
    </div>
  );
}
