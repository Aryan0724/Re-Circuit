'use client';

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types';
import { auth, db } from '@/lib/firebase'; // Assuming firebase.ts exports auth and db

const googleProvider = new GoogleAuthProvider();

const USERS_COLLECTION = 'artifacts/recircuit/public/data/users'; // Secure path as requested


interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  setUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        // Check if user profile exists in Firestore
        const userDocRef = doc(db, USERS_COLLECTION, user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Existing user
          const profileData = userDocSnap.data() as UserProfile;
          setUserProfile(profileData);
        } else {
          // New user - set initial profile data
          const initialProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || 'New User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'Citizen', // Default role, will be updated in WelcomeScreen
            credits: 0, // Default credits
            badges: [], // Default empty badges array
            approved: false, // Default approved status for Recyclers/Contractors
          };
          await setDoc(userDocRef, initialProfile);
          setUserProfile(initialProfile);
        }
        setLoading(false);
      } else {
        // User logged out
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const dashboardPaths: Record<UserRole, string> = {
      Citizen: '/citizen', // Assuming '/citizen' is the Citizen dashboard path
      Recycler: '/recycler',
      Admin: '/admin',
      Contractor: '/contractor',
    };

    if (userProfile) {
      const expectedPath = dashboardPaths[userProfile.role];
      // Only redirect if the user is not already on their designated dashboard or on the welcome screen
      if (pathname !== expectedPath && pathname !== '/welcome') {
        router.push(expectedPath);
      }
    } else if (firebaseUser && !userProfile && pathname !== '/welcome') {
      // Firebase user exists but no profile yet (new user)
      router.push('/welcome');
    }
    else if (!firebaseUser && !isPublicPage) {
        // No Firebase user and not on a public page, redirect to home (login screen)
      router.push('/');
    }

  }, [userProfile, firebaseUser, pathname, router, loading]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged listener will handle setting userProfile and redirection
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged listener will handle setting userProfile to null and redirection
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };
  
  // This function is part of AuthContextType but was not defined.
  // It was intended for profile updates, which should happen directly
  // or via a dedicated profile editor component.
  // Placeholder implementation, will be removed if not used elsewhere.
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const userDocRef = doc(db, USERS_COLLECTION, userProfile.uid);
    await setDoc(userDocRef, updates, { merge: true });
    setUserProfile({...userProfile, ...updates}); // Update local state
  };



  const value = { userProfile, loading, signOut, updateUserProfile, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
