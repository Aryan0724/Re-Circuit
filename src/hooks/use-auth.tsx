'use client';

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db, googleProvider } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
        } else {
          // New user, needs to select a role
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

    const dashboardPaths: Record<UserRole, string> = {
      Citizen: '/dashboard',
      Recycler: '/recycler',
      Admin: '/admin',
      Contractor: '/contractor',
    };

    if (!user) {
      if (pathname !== '/') {
        router.push('/');
      }
    } else {
      if (!userProfile) {
        if (pathname !== '/select-role') {
          router.push('/select-role');
        }
      } else {
        const expectedPath = dashboardPaths[userProfile.role];
        if (pathname === '/' || pathname === '/select-role' || (pathname !== expectedPath && !pathname.startsWith(expectedPath + '/'))) {
          router.push(expectedPath);
        }
      }
    }
  }, [user, userProfile, loading, pathname, router]);


  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
    // The onAuthStateChanged listener will handle the rest
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  const setUserRole = async (role: UserRole) => {
    if (!user) return;
    setLoading(true);
    const newUserProfile: UserProfile = {
      uid: user.uid,
      role,
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      photoURL: user.photoURL || '',
    };
    if (role === 'Citizen') {
      newUserProfile.credits = 0;
    }
    if (role === 'Recycler') {
      newUserProfile.approved = false;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), newUserProfile);
      setUserProfile(newUserProfile);
    } catch (error) {
      console.error("Error setting user role:", error);
    } finally {
      setLoading(false);
    }
  };


  const value = { user, userProfile, loading, signInWithGoogle, signOut, setUserRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
