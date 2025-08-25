
'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Home, User, Settings, HardHat, Recycle } from "lucide-react"
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';


const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Citizen', href: '/citizen', icon: User },
    { name: 'Admin', href: '/admin', icon: Settings },
    { name: 'Contractor', href: '/contractor', icon: HardHat },
    { name: 'Recycler', href: '/recycler', icon: Recycle },
];

function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Re-Circuit</SheetTitle>
                    <SheetDescription>
                        E-Waste Management Platform
                    </SheetDescription>
                </SheetHeader>
                <Separator className="my-4" />
                <div className="flex flex-col space-y-2">
                    {navItems.map(item => (
                        <Link href={item.href} key={item.name} passHref>
                           <Button variant="ghost" className="w-full justify-start gap-2">
                             <item.icon className="h-4 w-4" />
                             {item.name}
                           </Button>
                        </Link>
                    ))}
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
                    <Recycle className="h-6 w-6 text-primary" />
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
