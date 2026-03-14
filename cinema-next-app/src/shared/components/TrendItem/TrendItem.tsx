'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { TrendFilm } from 'stores/trendsStore';
import styles from './TrendItem.module.scss';

interface TrendItemProps {
  item: TrendFilm;
  isActive: boolean;
  isVisible: boolean;
  isLiked: boolean;
  onLike: (documentId: string) => void;
  onBecameActive: (documentId: string) => void;
}

const TrendItem = ({
  item,
  isActive,
  isVisible,
  isLiked,
  onLike,
  onBecameActive,
}: TrendItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          onBecameActive(item.documentId);
        }
      },
      { threshold: 0.7 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item.documentId, onBecameActive]);

  // Re-mount iframe with new key when item becomes active to trigger VK autoplay
  const iframeSrc = `${item.trailerUrl}&autoplay=${isActive ? '1' : '0'}&hd=1`;
  const iframeKey = isActive ? `${item.documentId}-on` : item.documentId;

  return (
    <div ref={ref} className={styles.item}>
      <div className={styles.media}>
        {isVisible ? (
          <iframe
            key={iframeKey}
            src={iframeSrc}
            allow="autoplay; fullscreen"
            allowFullScreen
            className={styles.iframe}
            title={item.title}
          />
        ) : (
          item.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.posterUrl}
              alt={item.title}
              className={styles.poster}
            />
          )
        )}
      </div>

      <div className={styles.overlay}>
        <Link href={`/film/${item.documentId}`} className={styles.title}>
          {item.title}
        </Link>

        <button
          className={classNames(styles.like, {
            [styles['like--active']]: isLiked,
          })}
          onClick={() => onLike(item.documentId)}
          aria-label={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TrendItem;
