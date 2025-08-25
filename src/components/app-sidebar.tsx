'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutDashboard, Recycle, Shield, HardHat, LogOut, User, Settings, PackagePlus, ListChecks, Activity, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { useState } from 'react';

const navItemsByRole: Record<UserRole, { href: string; label: string; icon: React.ElementType }[]> = {
  Citizen: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ],
  Recycler: [
    { href: '/recycler', label: 'Dashboard', icon: LayoutDashboard },
  ],
  Admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  ],
  Contractor: [
    { href: '/contractor', label: 'Dashboard', icon: LayoutDashboard },
  ],
};

const roleIcons: Record<UserRole, React.ElementType> = {
    Citizen: User,
    Recycler: Recycle,
    Admin: Shield,
    Contractor: HardHat
}

export function AppSidebar() {
  const { userProfile, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  if (loading || !userProfile) {
    return (
        <aside className="fixed left-0 top-0 z-10 h-screen w-16 md:w-64 border-r bg-card/50 backdrop-blur-lg flex flex-col items-center py-4 gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full animate-pulse"></div>
             <div className="w-8 h-8 bg-muted rounded-md animate-pulse mt-8"></div>
             <div className="w-8 h-8 bg-muted rounded-md animate-pulse"></div>
             <div className="w-8 h-8 bg-muted rounded-md animate-pulse"></div>
             <div className="mt-auto w-8 h-8 bg-muted rounded-md animate-pulse"></div>
        </aside>
    );
  }

  const navItems = navItemsByRole[userProfile.role];
  const RoleIcon = roleIcons[userProfile.role];

  return (
    <TooltipProvider>
      <aside className="fixed left-0 top-0 z-10 h-screen w-16 md:w-64 border-r bg-card/50 backdrop-blur-lg flex flex-col transition-all duration-300">
        <div className="flex flex-col items-center md:items-start p-2 md:p-4 border-b">
          <Link href={`/${userProfile.role.toLowerCase()}`} className="flex items-center gap-2 w-full">
            <Recycle className="h-8 w-8 text-primary flex-shrink-0" />
            <span className="text-xl font-bold hidden md:inline">Re-Circuit</span>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col items-center md:items-stretch gap-2 p-2 md:p-4">
          {navItems.map((item) => (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-12 h-12 md:w-full md:justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="hidden md:inline ml-4">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        <div className="mt-auto p-2 md:p-4 border-t">
          <div className="flex items-center gap-2 p-2 rounded-lg mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col flex-1 overflow-hidden">
              <span className="font-semibold text-sm truncate">{userProfile.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RoleIcon className="h-3 w-3" />
                {userProfile.role}
              </span>
            </div>
             <ProfileEditor open={isProfileEditorOpen} onOpenChange={setIsProfileEditorOpen}>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:inline-flex" onClick={() => setIsProfileEditorOpen(true)}>
                           <Settings className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Edit Profile
                    </TooltipContent>
                </Tooltip>
             </ProfileEditor>
          </div>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-12 h-12 md:w-full md:justify-start" onClick={signOut}>
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline ml-4">Sign Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="md:hidden">
              Sign Out
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
