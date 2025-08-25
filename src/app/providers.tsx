'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { AnimatedGradient } from '@/components/animated-gradient';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AnimatedGradient />
      <main>{children}</main>
      <Toaster />
    </AuthProvider>
  );
}