'use client';

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types';

// Define mock users for fake authentication
const mockUsers: Record<UserRole, Omit<UserProfile, 'uid' | 'badges'>> = {
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
  updateUserProfile: (updates: Partial<Pick<UserProfile, 'name' | 'photoURL'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadProfile = () => {
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    if (storedRole) {
      const uid = roleToUidMap[storedRole];
      const baseProfile = mockUsers[storedRole];
      const storedProfile = JSON.parse(localStorage.getItem(`user_profile_${uid}`) || '{}');

      const profile: UserProfile = { 
        uid, 
        ...baseProfile,
        ...storedProfile, // Overwrite with stored edits
        badges: storedProfile.badges || [], // Ensure badges array exists
      };
      
      if (profile.role === 'Recycler') {
        const isApproved = localStorage.getItem(`recycler_${uid}_approved`) === 'true';
        profile.approved = isApproved;
      }
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProfile();
    setLoading(false);

    window.addEventListener('profile-updated', loadProfile);
    return () => window.removeEventListener('profile-updated', loadProfile);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicPage = pathname === '/';
    const dashboardPaths: Record<UserRole, string> = {
      Citizen: '/citizen',
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
    setLoading(true);
    const baseProfile = mockUsers[role];
    const uid = roleToUidMap[role];

    if (baseProfile) {
        localStorage.setItem('userRole', role);
        const fullProfile = { uid, ...baseProfile, badges: [] };

        if(role === 'Recycler') {
            const storedApproval = localStorage.getItem(`recycler_${uid}_approved`);
            fullProfile.approved = storedApproval === 'true';
        }
        
        // Also clear any previous profile edits for that role
        localStorage.removeItem(`user_profile_${uid}`);

        setUserProfile(fullProfile as UserProfile);
    } else {
        console.error("Invalid role selected");
    }
    setLoading(false);
  };
  
  const signOut = () => {
    localStorage.removeItem('userRole');
    // We don't remove the profile edits, so they persist on next login
    setUserProfile(null);
    router.push('/');
  };

  const updateUserProfile = (updates: Partial<Pick<UserProfile, 'name' | 'photoURL'>>) => {
    if (!userProfile) return;
    
    const updatedProfile = { ...userProfile, ...updates };
    
    // Update local state
    setUserProfile(updatedProfile);

    // Persist changes to localStorage
    const storedProfile = JSON.parse(localStorage.getItem(`user_profile_${userProfile.uid}`) || '{}');
    const newStoredProfile = { ...storedProfile, ...updates };
    localStorage.setItem(`user_profile_${userProfile.uid}`, JSON.stringify(newStoredProfile));

    // Dispatch event for other components if needed, though state update should cover it
    window.dispatchEvent(new CustomEvent('profile-updated'));
  };

  const value = { userProfile, loading, signOut, setUserRole, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
