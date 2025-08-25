import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/hooks/use-auth';

// Admin role is assigned manually, not selectable on signup
const selectableRoles: UserRole[] = ['Citizen', 'Recycler', 'Contractor'];

const WelcomeScreen: React.FC = () => {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (role: UserRole) => {
    if (!user) return;

    setLoadingRole(role);
    setError(null);

    try {
      const baseProfile = {
        uid: userProfile.uid,
        name: user.displayName || 'New User',
        email: user.email || '',
        photoURL: user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`,
        role: role,
      };

      let newUserProfile: UserProfile;

      // Add role-specific default properties
      switch (role) {
        case 'Citizen':
          newUserProfile = {
            ...baseProfile,
            role: 'Citizen',
            credits: 0,
            badges: [],
          };
          break;
        case 'Recycler':
          newUserProfile = {
            ...baseProfile,
            role: 'Recycler',
            approved: false, // Recyclers must be approved by an Admin
          };
          break;
        case 'Contractor':
          newUserProfile = {
            ...baseProfile,
            role: 'Contractor',
          };
          break;
        default:
          throw new Error(`Invalid role selected: ${role}`);
      }
      
      const appId = app.options.appId;
      if (!appId) {
        throw new Error("Firebase App ID could not be determined.");
      }
      
      // Use setUserRole from the hook to update profile in Firestore and state
      await setUserRole(role);
    } catch (err) {
      console.error("Error creating user profile in Firestore: ", err);
      setError('Failed to create your profile. Please try again.');
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black">
      <Card className="w-full max-w-md mx-4 shadow-xl animate-in fade-in-0 zoom-in-95">
        <CardHeader className="text-center">
          <img src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`} alt="User Avatar" className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-white dark:border-gray-800" />
          <CardTitle className="text-3xl font-bold">Welcome, {user.displayName || 'Friend'}!</CardTitle>
          <CardDescription className="text-md pt-2">
            To complete your registration, please select your role in the Re-Circuit ecosystem.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 pt-4">
          {selectableRoles.map((role) => (
            <Button
              key={role}
              onClick={() => handleRoleSelection(role)}
              disabled={!!loadingRole}
              className="w-full py-6 text-lg font-semibold transform hover:scale-105 transition-transform duration-200"
            >
              {loadingRole === role ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                `I am a ${role}`
              )}
            </Button>
          ))}
        </CardContent>
        {error && (
            <CardFooter>
                <p className="text-sm text-red-500 text-center w-full">{error}</p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default WelcomeScreen;