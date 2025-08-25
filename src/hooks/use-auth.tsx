
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

// MOCK USER DATA - now with no default role
const MOCK_USER_ID = "mock-user-01";
const MOCK_USER_PROFILE_BASE: Omit<UserProfile, 'role'> = {
  uid: MOCK_USER_ID,
  name: 'Alex Rider',
  email: 'alex.rider@example.com',
  photoURL: `https://placehold.co/100x100.png`,
};


interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = useCallback(() => {
    setLoading(true);
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // If no profile, "log in" with the base mock profile, role will be set later
        const newUserProfile = { ...MOCK_USER_PROFILE_BASE } as UserProfile;
        localStorage.setItem('userProfile', JSON.stringify(newUserProfile));
        setUserProfile(newUserProfile);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Fallback to default mock user
      setUserProfile({ ...MOCK_USER_PROFILE_BASE } as UserProfile);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const setUserRole = (role: UserRole) => {
    if (userProfile) {
        const updatedProfile = { ...userProfile, role, approved: role === 'Recycler' ? false : undefined };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        router.push(`/${role.toLowerCase()}`);
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('userProfile');
    setUserProfile(null);
    // After logout, reload to reset state and show welcome screen logic again
    window.location.href = '/';
  }, []);

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
    <AuthContext.Provider value={{ userProfile, loading, logout, updateProfile, setUserRole }}>
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
