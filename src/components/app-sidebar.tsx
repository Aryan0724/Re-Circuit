
'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutDashboard, Recycle, Shield, HardHat, User, Settings, PackagePlus, ListChecks, Activity, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const navItemsByRole: Record<UserRole, { href: string; label: string; icon: React.ElementType }[]> = {
  Citizen: [
    { href: '/citizen', label: 'Dashboard', icon: LayoutDashboard },
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

const dashboardRoutes: Record<UserRole, string> = {
    Citizen: '/citizen',
    Recycler: '/recycler',
    Admin: '/admin',
    Contractor: '/contractor'
}

// Mock user profile since auth is removed. Default to Citizen.
const mockUser: UserProfile = {
    uid: 'citizen-001',
    role: 'Citizen',
    name: 'Eco Citizen',
    email: 'citizen@example.com',
    photoURL: 'https://placehold.co/100x100.png',
    credits: 420,
    badges: ['first-contribution', 'laptop-recycler']
};


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUser);

  // Determine current role from URL
  const currentRole: UserRole = (() => {
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/recycler')) return 'Recycler';
    if (pathname.startsWith('/contractor')) return 'Contractor';
    return 'Citizen';
  })();

  // Update mock user's role based on current path
  if (userProfile.role !== currentRole) {
      const newUser = {...mockUser, role: currentRole, name: `${currentRole} User` };
      if (currentRole === 'Recycler') {
          (newUser as any).approved = true;
      }
      setUserProfile(newUser);
  }

  const navItems = navItemsByRole[userProfile.role];
  const RoleIcon = roleIcons[userProfile.role];

  const handleRoleChange = (role: UserRole) => {
    router.push(`/${role.toLowerCase()}`);
  }

  return (
    <TooltipProvider>
      <aside className="fixed left-0 top-0 z-10 h-screen w-16 md:w-64 border-r bg-card/50 backdrop-blur-lg flex flex-col transition-all duration-300">
        <div className="flex flex-col items-center md:items-start p-2 md:p-4 border-b">
          <Link href={dashboardRoutes[userProfile.role]} className="flex items-center gap-2 w-full">
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
          </div>
          
           <div className="hidden md:block p-2">
              <label htmlFor="role-switcher" className="text-xs text-muted-foreground">Switch View</label>
              <select 
                id="role-switcher"
                value={userProfile.role} 
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full mt-1 p-2 rounded-md bg-muted text-sm border-border"
              >
                <option value="Citizen">Citizen</option>
                <option value="Recycler">Recycler</option>
                <option value="Contractor">Contractor</option>
                <option value="Admin">Admin</option>
              </select>
           </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
