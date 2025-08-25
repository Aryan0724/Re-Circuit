
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Recycle, ChevronRight } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/hooks/use-auth';

const selectableRoles: { name: string, role: UserRole }[] = [
    { name: 'Citizen', role: 'Citizen' },
    { name: 'NGO/Recycler', role: 'Recycler' },
    { name: 'Govt Contractor', role: 'Contractor' },
    { name: 'Admin', role: 'Admin' }
];

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
      setUserRole(role);
    } catch (err) {
      console.error("Error setting user role: ", err);
      setError('Failed to set your role. Please try again.');
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0FFF4] py-12 text-green-800">
        <div className="text-center">
            <Recycle className="h-16 w-16 mx-auto mb-4"/>
            <h1 className="text-5xl font-bold mb-4">Re-Circuit</h1>
            <p className="text-lg mb-8">Welcome! Please select your role to begin.</p>
        </div>

        <div className="flex flex-col space-y-4 w-full max-w-sm">
          {selectableRoles.map(({name, role}) => (
            <Button
              key={role}
              variant="outline"
              size="lg"
              className="w-full justify-between !bg-white hover:!bg-green-50 !text-green-800 border-green-200"
              onClick={() => handleRoleSelection(role)}
              disabled={!!loadingRole}
            >
              {loadingRole === role ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                 <span>{name}</span>
                 <ChevronRight className="h-5 w-5" />
                </>
              )}
            </Button>
          ))}
        </div>
        {error && (
            <p className="text-sm text-red-500 mt-4">{error}</p>
        )}
    </div>
  );
};

export default WelcomeScreen;
