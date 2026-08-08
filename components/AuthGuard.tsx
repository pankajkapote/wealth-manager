'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-invest-accent"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect is in-flight; render nothing to avoid a flash of dashboard content.
    return null;
  }

  return <>{children}</>;
}
