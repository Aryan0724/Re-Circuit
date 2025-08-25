'use client';

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types';

// Define mock users for fake authentication
const mockUsers: Record<UserRole, UserProfile> = {
  Citizen: {
    uid: 'citizen-001',
    role: 'Citizen',
    name: 'Eco Citizen',
    email: 'citizen@example.com',
    photoURL: 'https://placehold.co/100x100.png',
    credits: 420,
  },
  Recycler: {
    uid: 'recycler-001',
    role: 'Recycler',
    name: 'Green Recyclers',
    email: 'recycler@example.com',
    photoURL: 'https://placehold.co/100x100.png',
    approved: true,
  },
  Admin: {
    uid: 'admin-001',
    role: 'Admin',
    name: 'Platform Admin',
    email: 'admin@example.com',
    photoURL: 'https://placehold.co/100x100.png',
  },
  Contractor: {
    uid: 'contractor-001',
    role: 'Contractor',
    name: 'Govt Contractor',
    email: 'contractor@example.com',
    photoURL: 'https://placehold.co/100x100.png',
  },
};

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for a "logged in" user in localStorage
    try {
      const storedRole = localStorage.getItem('userRole') as UserRole | null;
      if (storedRole && mockUsers[storedRole]) {
        setUserProfile(mockUsers[storedRole]);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicPage = pathname === '/';
    const dashboardPaths: Record<UserRole, string> = {
      Citizen: '/dashboard',
      Recycler: '/recycler',
      Admin: '/admin',
      Contractor: '/contractor',
    };

    if (userProfile) {
      const expectedPath = dashboardPaths[userProfile.role];
      if (pathname !== expectedPath) {
        router.push(expectedPath);
      }
    } else if (!isPublicPage) {
      router.push('/');
    }
  }, [userProfile, loading, pathname, router]);

  const setUserRole = (role: UserRole) => {
    const profile = mockUsers[role];
    if (profile) {
      try {
        localStorage.setItem('userRole', role);
      } catch (error) {
         console.error("Could not access localStorage:", error);
      }
      setUserProfile(profile);
    } else {
      console.error("Invalid role selected");
    }
  };
  
  const signOut = () => {
    try {
      localStorage.removeItem('userRole');
    } catch (error) {
       console.error("Could not access localStorage:", error);
    }
    setUserProfile(null);
    router.push('/');
  };

  const value = { userProfile, loading, signOut, setUserRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
