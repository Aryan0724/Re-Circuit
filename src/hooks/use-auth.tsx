'use client';

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types';
import { auth, db } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

const USERS_COLLECTION = 'users';

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  user: User | null;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicPages = ['/']; // Pages accessible to unauthenticated users
const welcomePage = '/'; // Page for new users to select a role is now the root

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setUserProfile(profile);
        } else {
          // This is a new user, they will stay on the welcome screen
          // to create their profile.
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicPage = publicPages.includes(pathname);

    if (user && userProfile) {
      // User is logged in and has a profile, redirect to their dashboard
      const dashboardPath = `/${userProfile.role.toLowerCase()}`;
      if (pathname !== dashboardPath) {
        router.push(dashboardPath);
      }
    } else if (!user && !isPublicPage) {
      // No user, and not on a public page, redirect to home to log in
      router.push('/');
    }
    // If user is logged in but no profile, they stay on the root page (which shows WelcomeScreen).
    // If no user is logged in, they stay on the root page (which shows LoginScreen).

  }, [user, userProfile, loading, pathname, router]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (role: UserRole) => {
    if (!user) throw new Error("User not authenticated.");

    const baseProfile = {
        uid: user.uid,
        name: user.displayName || 'New User',
        email: user.email || '',
        photoURL: user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`,
        role: role,
      };

      let newUserProfile: UserProfile;

      switch (role) {
        case 'Citizen':
          newUserProfile = { ...baseProfile, role: 'Citizen', credits: 0, badges: [] };
          break;
        case 'Recycler':
          newUserProfile = { ...baseProfile, role: 'Recycler', approved: false };
          break;
        case 'Contractor':
          newUserProfile = { ...baseProfile, role: 'Contractor' };
          break;
        case 'Admin':
           newUserProfile = { ...baseProfile, role: 'Admin' };
           break;
        default:
          throw new Error(`Invalid role selected: ${role}`);
      }

    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(userDocRef, newUserProfile);
    setUserProfile(newUserProfile);
  };
  
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const userDocRef = doc(db, USERS_COLLECTION, userProfile.uid);
    await setDoc(userDocRef, updates, { merge: true });
    setUserProfile((prev) => prev ? { ...prev, ...updates } : null);
  };

  const value = { user, userProfile, loading, signInWithGoogle, signOut, setUserRole, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
