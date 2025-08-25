'use client';

import { useAuth } from '@/hooks/use-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Moon, Recycle, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'firebase/auth';
import LoginScreen from '@/components/login-screen';
import WelcomeScreen from '@/components/welcome-screen';

export default function Home() {
  const { loading, user, userProfile } = useAuth();
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

  if (userProfile) {
    // User is logged in and has a profile, they will be redirected by the useAuth hook.
    return null;
  }
  
  if (!user) {
    return <LoginScreen />;
  }

  // User is signed in but has no role yet. Show role selector.
  return <WelcomeScreen />;
}
