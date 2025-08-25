
'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from 'next/link';


const roles = [
    { name: 'Citizen', href: '/citizen' },
    { name: 'Admin', href: '/admin' },
    { name: 'Contractor', href: '/contractor' },
    { name: 'Recycler', href: '/recycler' },
];

function RoleSwitcher() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Users className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Switch role</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.map(role => (
                    <Link href={role.href} key={role.name} passHref>
                        <DropdownMenuItem>
                            {role.name}
                        </DropdownMenuItem>
                    </Link>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
            <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="flex items-center space-x-4">
                <RoleSwitcher />
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
