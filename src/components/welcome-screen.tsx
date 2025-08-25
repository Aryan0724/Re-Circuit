
import React, { useState } from 'react';
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
  const { userProfile, setUserRole } = useAuth();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!userProfile) {
    return null; // Or a loading indicator
  }

  const handleRoleSelection = async (role: UserRole) => {
    setLoadingRole(role);
    setError(null);
    try {
      // The useAuth hook will handle the redirect
      setUserRole(role);
    } catch (err) {
      console.error("Error setting user role: ", err);
      setError('Failed to set your role. Please try again.');
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent py-12">
       <Card className="w-full max-w-md mx-4 shadow-xl animate-in fade-in-0 zoom-in-95 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
           <img src={userProfile.photoURL || `https://avatar.vercel.sh/${userProfile.uid}.png`} alt="User Avatar" className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-card" />
          <CardTitle className="text-3xl font-bold">Welcome, {userProfile.name || 'Friend'}!</CardTitle>
          <CardDescription className="text-md pt-2">
            To get started, please select your role in the Re-Circuit ecosystem.
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
