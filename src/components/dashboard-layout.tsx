'use client';

import React from 'react';
import { AppSidebar } from './app-sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col pl-16 md:pl-64">
        <main
          className="flex-1 p-4 md:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
