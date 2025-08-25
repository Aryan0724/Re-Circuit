
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signOut, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    } else {
      // Profile needs to be created, might happen after role selection
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile, router]);

  const signUp = async (username: string, email: string, password: string) => {
    // 1. Check if username is unique
    const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(usernameQuery);
    if (!querySnapshot.empty) {
        throw new Error('Username is already taken.');
    }

    // 2. Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // 3. Create user profile document in Firestore
    const userDocRef = doc(db, 'users', newUser.uid);
    const newUserProfile: Partial<UserProfile> = {
        uid: newUser.uid,
        username,
        email: newUser.email,
        name: username, // Default name to username
        photoURL: `https://placehold.co/100x100.png`
    };
    await setDoc(userDocRef, newUserProfile);
    setUser(newUser);
    setUserProfile(newUserProfile as UserProfile); // Initially no role
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the rest
  };

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    router.push('/');
  }, [router]);

  const setUserRole = async (role: UserRole) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const updatedProfileData = { 
            role, 
            approved: role === 'Recycler' ? false : undefined 
        };
        await setDoc(userDocRef, updatedProfileData, { merge: true });
        await fetchUserProfile(user); // Refetch profile to get the new role
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updates, { merge: true });
      await fetchUserProfile(user); // Refetch to update state
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout, signUp, login, updateProfile, setUserRole }}>
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
