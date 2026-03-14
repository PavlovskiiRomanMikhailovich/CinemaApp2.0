'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTrendsStore } from 'stores/trendsStore';
import TrendItem from 'components/TrendItem/TrendItem';
import styles from './TrendsFeed.module.scss';

/** Кол-во слотов вокруг активного, для которых рендерим реальный iframe */
const RENDER_WINDOW = 2;

const TrendsFeed = () => {
  const {
    items,
    loading,
    hasMore,
    activeIndex,
    likedIds,
    fetchNextPage,
    toggleLike,
    setActiveIndex,
  } = useTrendsStore();

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Первичная загрузка
  useEffect(() => {
    if (items.length === 0) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll: следим за sentinel-элементом в конце списка
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchNextPage]);

  // Callback, который TrendItem вызывает, когда становится активным (>= 70% видимости)
  const handleBecameActive = useCallback(
    (documentId: string) => {
      const index = items.findIndex(item => item.documentId === documentId);
      if (index !== -1 && index !== activeIndex) {
        setActiveIndex(index);
      }
    },
    [items, activeIndex, setActiveIndex],
  );

  return (
    <div className={styles.feed}>
      <div className={styles.scroll}>
        {items.map((item, index) => (
          <TrendItem
            key={item.documentId}
            item={item}
            isActive={index === activeIndex}
            isVisible={Math.abs(index - activeIndex) <= RENDER_WINDOW}
            isLiked={likedIds.has(item.documentId)}
            onLike={toggleLike}
            onBecameActive={handleBecameActive}
          />
        ))}

        {/* Sentinel для infinite scroll */}
        <div ref={sentinelRef} className={styles.sentinel} />

        {loading && (
          <div className={styles.loader}>
            <span />
            <span />
            <span />
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
