'use client';

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types';

// Define mock users for fake authentication
const mockUsers: Record<UserRole, Omit<UserProfile, 'uid'>> = {
  Citizen: {
    role: 'Citizen',
    name: 'Eco Citizen',
    email: 'citizen@example.com',
    photoURL: 'https://placehold.co/100x100.png',
    credits: 420,
  },
  Recycler: {
    role: 'Recycler',
    name: 'Green Recyclers',
    email: 'recycler@example.com',
    photoURL: 'https://placehold.co/100x100.png',
    approved: false, // Default to not approved
  },
  Admin: {
    role: 'Admin',
    name: 'Platform Admin',
    email: 'admin@example.com',
    photoURL: 'https://placehold.co/100x100.png',
  },
  Contractor: {
    role: 'Contractor',
    name: 'Govt Contractor',
    email: 'contractor@example.com',
    photoURL: 'https://placehold.co/100x100.png',
  },
};

const roleToUidMap: Record<UserRole, string> = {
    Citizen: 'citizen-001',
    Recycler: 'recycler-001',
    Admin: 'admin-001',
    Contractor: 'contractor-001',
}


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
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    if (storedRole) {
      const uid = roleToUidMap[storedRole];
      const profile = { uid, ...mockUsers[storedRole] };
      // In a real app, you might want to check if the recycler was approved.
      // For this mock, we can check a separate localStorage item.
      if (profile.role === 'Recycler') {
        const isApproved = localStorage.getItem(`recycler_${uid}_approved`) === 'true';
        profile.approved = isApproved;
      }
      setUserProfile(profile);
    }
    setLoading(false);
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
      if (pathname !== expectedPath && !pathname.startsWith('/api')) { // Ignore api routes
        router.push(expectedPath);
      }
    } else if (!isPublicPage) {
      router.push('/');
    }
  }, [userProfile, loading, pathname, router]);

  const setUserRole = (role: UserRole) => {
    setLoading(true);
    const baseProfile = mockUsers[role];
    const uid = roleToUidMap[role];

    if (baseProfile) {
        localStorage.setItem('userRole', role);
        setUserProfile({ uid, ...baseProfile });
    } else {
        console.error("Invalid role selected");
    }
    setLoading(false);
  };
  
  const signOut = () => {
    localStorage.removeItem('userRole');
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
