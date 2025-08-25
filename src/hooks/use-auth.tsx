'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { ProfileEditor } from '@/components/profile/profile-editor';

// MOCK USER DATA
const MOCK_USER_ID = "mock-user-01";
const MOCK_USER_PROFILE: UserProfile = {
  uid: MOCK_USER_ID,
  name: 'Alex Rider',
  email: 'alex.rider@example.com',
  photoURL: `https://placehold.co/100x100.png`,
  role: 'Citizen', 
};


interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadProfile = useCallback(() => {
    setLoading(true);
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // If no profile, "log in" with the mock profile
        localStorage.setItem('userProfile', JSON.stringify(MOCK_USER_PROFILE));
        setUserProfile(MOCK_USER_PROFILE);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Fallback to default mock user
      setUserProfile(MOCK_USER_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('userProfile');
    setUserProfile(null);
    router.push('/');
  }, [router]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const newProfile = { ...userProfile, ...updates };
      setUserProfile(newProfile);
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
    }
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ userProfile, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
