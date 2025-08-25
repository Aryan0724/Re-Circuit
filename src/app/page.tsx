'use client';

import { useAuth } from '@/hooks/use-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Moon, Recycle, Sun } from 'lucide-react';
import type { UserRole, UserProfile } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'firebase/auth';

const roles: { role: UserRole; title: string }[] = [
  { role: 'Citizen', title: 'Citizen' },
  { role: 'Recycler', title: 'NGO/Recycler' },
  { role: 'Contractor', title: 'Govt Contractor' },
  { role: 'Admin', title: 'Admin' },
];

function WelcomeAnimation({ onFinish }: { onFinish: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onFinish, 2000); // 2 seconds
        return () => clearTimeout(timer);
    }, [onFinish]);
    
    return (
        <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
            transition={{ duration: 0.8 }}
            className="text-center flex flex-col items-center gap-2"
        >
            <Recycle className="h-24 w-24 text-primary" />
            <h1 className="text-6xl font-bold text-primary">Re-Circuit</h1>
        </motion.div>
    )
}

function RoleSelector({ user }: { user: User | null }) {
    const { setUserRole } = useAuth();
    
    const handleSetRole = (role: UserRole) => {
        if (user) {
            setUserRole(role);
        }
    }

    return (
        <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-sm text-center"
        >
            <div className="text-center flex flex-col items-center gap-2 mb-8">
                <Recycle className="h-16 w-16 text-primary" />
                <h1 className="text-5xl font-bold text-primary">Re-Circuit</h1>
                <p className="mt-2 text-muted-foreground">Welcome! Please select your role to begin.</p>
            </div>

            <div className="space-y-3">
                {roles.map(({ role, title }) => (
                <Button
                    key={role}
                    variant="outline"
                    size="lg"
                    className="w-full justify-between text-base py-6 bg-card hover:bg-accent/50"
                    onClick={() => handleSetRole(role)}
                    disabled={!user}
                >
                    {title}
                    <ChevronRight className="h-5 w-5" />
                </Button>
                ))}
            </div>
        </motion.div>
    )
}


export default function Home() {
  const { loading, userProfile, user, signInWithGoogle } = useAuth();
  const [theme, setTheme] = useState('light');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Determine theme
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

  // If auth state is loading, show a spinner
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
    // New visitor, show sign-in button which will then lead to role selection
    return (
         <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
            <motion.div
                key="sign-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm text-center"
            >
                <div className="text-center flex flex-col items-center gap-2 mb-8">
                    <Recycle className="h-16 w-16 text-primary" />
                    <h1 className="text-5xl font-bold text-primary">Re-Circuit</h1>
                    <p className="mt-2 text-muted-foreground">Welcome! Please sign in to begin.</p>
                </div>

                <Button
                    size="lg"
                    className="w-full text-base py-6"
                    onClick={signInWithGoogle}
                >
                    Sign In with Google
                </Button>
            </motion.div>
        </div>
    )
  }

  // User is signed in but has no role yet. Show role selector.
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
       <div className="absolute top-4 right-4">
        <Button onClick={toggleTheme} variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      
      <AnimatePresence mode="wait">
        {showWelcome ? (
            <WelcomeAnimation onFinish={() => setShowWelcome(false)} />
        ) : (
            <RoleSelector user={user} />
        )}
      </AnimatePresence>
    </div>
  );
}
