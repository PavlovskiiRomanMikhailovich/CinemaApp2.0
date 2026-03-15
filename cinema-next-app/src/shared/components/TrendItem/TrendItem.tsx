'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import type { TrendFilm } from 'stores/trendsStore';
import { useFavoritesStore } from 'providers/StoreProvider';
import styles from './TrendItem.module.scss';

interface TrendItemProps {
  item: TrendFilm;
  isActive: boolean;
  isVisible: boolean;
  onBecameActive: (documentId: string) => void;
}

const TrendItem = observer(({ item, isActive, isVisible, onBecameActive }: TrendItemProps) => {
  const [slide, setSlide]           = useState(0);
  const [expanded, setExpanded]     = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const rootRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // pointer-drag для десктопа
  const dragging    = useRef(false);
  const dragX0      = useRef(0);
  const scrollLeft0 = useRef(0);

  const favStore = useFavoritesStore();
  const isFav    = favStore.isFavorite(item.id);

  // Картинки: gallery или poster как fallback
  const images     = item.gallery.length > 0 ? item.gallery : item.posterUrl ? [item.posterUrl] : [];
  const totalSlides = images.length + 1; // +1 трейлер-слайд

  // ── Сбрасываем состояние когда элемент уходит из вьюпорта ──────────────────
  useEffect(() => {
    if (!isActive) {
      setSlide(0);
      setExpanded(false);
      setTrailerOpen(false);
      if (trackRef.current) trackRef.current.scrollLeft = 0;
    }
  }, [isActive]);

  // ── IntersectionObserver ───────────────────────────────────────────────────
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7)
          onBecameActive(item.documentId);
      },
      { threshold: 0.7 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [item.documentId, onBecameActive]);

  // ── Синхронизация dots ↔ нативный скролл ──────────────────────────────────
  const onTrackScroll = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const idx = Math.round(t.scrollLeft / t.offsetWidth);
    if (idx !== slide) setSlide(idx);
  }, [slide]);

  // ── Переход к слайду (из dots) ────────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    setSlide(idx);
    trackRef.current?.scrollTo({ left: idx * (trackRef.current.offsetWidth), behavior: 'smooth' });
  }, []);

  // ── Pointer-drag (только мышь — touch обрабатывает нативный скролл) ────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    // Не перехватываем клики по интерактивным элементам внутри трека
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return;
    dragging.current    = true;
    dragX0.current      = e.clientX;
    scrollLeft0.current = trackRef.current?.scrollLeft ?? 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !trackRef.current) return;
    trackRef.current.scrollLeft = scrollLeft0.current + (dragX0.current - e.clientX);
  };
  const onPointerUp = () => { dragging.current = false; };

  // ── Fullscreen при открытии трейлера ─────────────────────────────────────
  useEffect(() => {
    if (!trailerOpen) return;

    const el = modalRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }

    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setTrailerOpen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [trailerOpen]);

  const handleCloseTrailer = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      setTrailerOpen(false);
    }
  }, []);

  // ── Избранное ──────────────────────────────────────────────────────────────
  const handleFav = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) await favStore.removeFromFavorites(item.id);
    else       await favStore.addToFavorites(item.id);
  }, [isFav, item.id, favStore]);

  // ── Placeholder пока слайд вне окна виртуализации ─────────────────────────
  if (!isVisible) {
    return (
      <div ref={rootRef} className={styles.item}>
        {item.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.title} className={styles.fallback} />
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={styles.item}>

      {/* ══ Горизонтальная галерея ══════════════════════════════════════════ */}
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={onTrackScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {images.map((url, i) => (
          <div key={i} className={styles.slide}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className={styles.slideImg} draggable={false} />
          </div>
        ))}

        {/* Слайд-трейлер (последний) */}
        <div className={classNames(styles.slide, styles.trailerSlide)}>
          {item.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.posterUrl} alt="" className={styles.trailerBg} draggable={false} />
          )}
          <div className={styles.trailerCenter}>
            <button
              className={styles.playBtn}
              onClick={(e) => { e.stopPropagation(); setTrailerOpen(true); }}
              aria-label="Смотреть трейлер"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            <span className={styles.playLabel}>Смотреть трейлер</span>
          </div>
        </div>
      </div>

      {/* ══ Затемнение галереи при раскрытии описания ══════════════════════ */}
      {expanded && (
        <div className={styles.backdrop} onClick={() => setExpanded(false)} />
      )}

      {/* ══ Нижняя панель: dots + инфо + кнопки ════════════════════════════ */}
      <div
        className={classNames(styles.panel, { [styles['panel--expanded']]: expanded })}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Dot-индикаторы */}
        <div className={styles.dots}>
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              className={classNames(styles.dot, { [styles['dot--active']]: i === slide })}
              onClick={() => goTo(i)}
              aria-label={i === totalSlides - 1 ? 'Трейлер' : `Фото ${i + 1}`}
            />
          ))}
        </div>

        {/* Основное тело: текст слева, кнопки справа */}
        <div className={styles.body}>
          <div className={styles.textWrap} onClick={() => setExpanded(v => !v)}>
            <h2 className={styles.title}>{item.title}</h2>
            {item.shortDescription && (
              <p className={classNames(styles.desc, { [styles['desc--expanded']]: expanded })}>
                {item.shortDescription}
              </p>
            )}
            {item.shortDescription && (
              <span className={styles.toggle}>
                {expanded ? '↑ Свернуть' : '↓ Читать далее'}
              </span>
            )}
          </div>

          {/* Кнопки: избранное + страница фильма */}
          <div className={styles.actions}>
            <button
              className={classNames(styles.btn, { [styles['btn--fav']]: isFav })}
              onClick={handleFav}
              aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={isFav ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <Link
              href={`/film/${item.documentId}`}
              className={styles.btn}
              aria-label="О фильме"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ Модалка трейлера ════════════════════════════════════════════════ */}
      {trailerOpen && (
        <div ref={modalRef} className={styles.modal}>
          <button
            className={styles.modalClose}
            onClick={handleCloseTrailer}
            aria-label="Закрыть трейлер"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <iframe
            src={`${item.trailerUrl}&autoplay=1&hd=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
            className={styles.modalIframe}
            title={`${item.title} — трейлер`}
          />
        </div>
      )}

    </div>
  );
});

export default TrendItem;
