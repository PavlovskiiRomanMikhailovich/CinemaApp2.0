'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from 'providers/StoreProvider';

export default function HomeRedirect() {
  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated) {
      router.replace('/movies');
    } else {
      router.replace('/login');
    }
  }, [authStore.isAuthenticated, router]);

  return <div>Перенаправление...</div>;
}