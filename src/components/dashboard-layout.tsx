'use client';

import React from 'react';
import { AppSidebar } from './app-sidebar';
import { motion } from 'framer-motion';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col pl-16 md:pl-64">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-4 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
