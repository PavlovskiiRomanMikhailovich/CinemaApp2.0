'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from 'providers/StoreProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      router.push('/register');
    }
  }, [authStore.isAuthenticated, router]);

  if (!authStore.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}