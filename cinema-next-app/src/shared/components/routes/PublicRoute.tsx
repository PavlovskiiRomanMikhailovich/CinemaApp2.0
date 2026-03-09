'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from 'providers/StoreProvider';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated) {
      router.push('/');
    }
  }, [authStore.isAuthenticated, router]);

  if (authStore.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}