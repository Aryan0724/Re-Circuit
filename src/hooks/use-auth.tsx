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
  user: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for a "logged in" user in localStorage
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    if (storedRole && mockUsers[storedRole]) {
      const profile = mockUsers[storedRole];
      setUserProfile(profile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const dashboardPaths: Record<UserRole, string> = {
      Citizen: '/dashboard',
      Recycler: '/recycler',
      Admin: '/admin',
      Contractor: '/contractor',
    };

    if (!userProfile) {
      // If not logged in, stay on the homepage
      if (pathname !== '/') {
        router.push('/');
      }
    } else {
      // If logged in, redirect to the correct dashboard
      const expectedPath = dashboardPaths[userProfile.role];
      if (pathname !== expectedPath) {
        router.push(expectedPath);
      }
    }
  }, [userProfile, loading, pathname, router]);

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('userRole');
    setUserProfile(null);
    router.push('/');
    setLoading(false);
  };

  const setUserRole = async (role: UserRole) => {
    setLoading(true);
    const profile = mockUsers[role];
    if (profile) {
      localStorage.setItem('userRole', role);
      setUserProfile(profile);
    } else {
      console.error("Invalid role selected");
    }
  };
  
  const signInWithGoogle = async () => {
    console.warn("signInWithGoogle is not implemented in fake auth.");
  };

  const value = { user: userProfile, userProfile, loading, signOut, setUserRole, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
