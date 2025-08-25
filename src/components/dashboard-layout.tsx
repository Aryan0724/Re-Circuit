
'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, User } from "lucide-react"
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileEditor } from '@/components/profile/profile-editor';
import type { UserProfile } from '@/types';


// Mock user profile since auth is removed
const mockUserProfile: UserProfile = {
    uid: 'citizen-001',
    name: 'Eco Citizen',
    email: 'citizen@example.com',
    role: 'Citizen',
    photoURL: 'https://placehold.co/100x100.png',
    credits: 420,
    badges: ['first-contribution', 'laptop-recycler'],
};


function MobileSidebar() {
    const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                 <div className="flex flex-col h-full">
                     <div className="p-4 border-b">
                         <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={mockUserProfile?.photoURL} alt={mockUserProfile?.name} />
                                <AvatarFallback>{mockUserProfile?.name?.charAt(0) || mockUserProfile?.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{mockUserProfile?.name}</p>
                                <p className="text-sm text-muted-foreground">{mockUserProfile?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 py-4 px-2">
                         <ProfileEditor open={isProfileEditorOpen} onOpenChange={setIsProfileEditorOpen}>
                            <SheetClose asChild>
                               <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsProfileEditorOpen(true)}>
                                 <User className="h-4 w-4" />
                                 Profile
                               </Button>
                            </SheetClose>
                         </ProfileEditor>
                    </div>
                    <Separator />
                    <div className="p-2">
                        <SheetClose asChild>
                            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => alert("Logout functionality removed.")}>
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </SheetClose>
                    </div>
                 </div>
            </SheetContent>
        </Sheet>
    );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
          <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
            <div className="flex gap-6 md:gap-10">
                <Link href="/" className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span className="inline-block font-bold">Re-Circuit</span>
                </Link>
            </div>

            <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="flex items-center space-x-4">
                <MobileSidebar />
              </nav>
            </div>
          </div>
        </header>
        <main
          className="flex-1 p-4 md:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
