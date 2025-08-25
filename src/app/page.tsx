
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Default to citizen view since auth is removed
    router.push('/citizen');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading your dashboard...</p>
    </div>
  );
}
