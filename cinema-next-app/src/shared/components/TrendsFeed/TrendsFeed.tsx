'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTrendsStore } from 'stores/trendsStore';
import { useFavoritesStore, useAuthStore } from 'providers/StoreProvider';
import TrendItem from 'components/TrendItem/TrendItem';
import styles from './TrendsFeed.module.scss';

const RENDER_WINDOW = 2;

const TrendsFeed = () => {
  const router = useRouter();
  const { items, loading, hasMore, activeIndex, fetchNextPage, setActiveIndex } = useTrendsStore();
  const favoritesStore = useFavoritesStore();
  const authStore = useAuthStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authStore.isAuthenticated && favoritesStore.favorites.length === 0) {
      favoritesStore.fetchFavorites();
    }
  }, [authStore.isAuthenticated]);

  useEffect(() => {
    if (items.length === 0) fetchNextPage();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loading) fetchNextPage(); },
      { threshold: 0.1 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loading, fetchNextPage]);

  const handleBecameActive = useCallback(
    (documentId: string) => {
      const index = items.findIndex(i => i.documentId === documentId);
      if (index !== -1 && index !== activeIndex) setActiveIndex(index);
    },
    [items, activeIndex, setActiveIndex],
  );

  return (
    <div className={styles.feed}>
      <button className={styles.backBtn} onClick={() => router.back()} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Назад</span>
      </button>

      <div className={styles.scroll}>
        {items.map((item, index) => (
          <TrendItem
            key={item.documentId}
            item={item}
            isActive={index === activeIndex}
            isVisible={Math.abs(index - activeIndex) <= RENDER_WINDOW}
            onBecameActive={handleBecameActive}
          />
        ))}

        <div ref={sentinelRef} className={styles.sentinel} />

        {loading && (
          <div className={styles.loader}>
            <span /><span /><span />
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className={styles.end}>Все тренды просмотрены</div>
        )}
      </div>
    </div>
  );
};

export default TrendsFeed;
