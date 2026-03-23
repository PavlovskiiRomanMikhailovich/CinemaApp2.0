'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import styles from 'styles/error.module.scss';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>500</h1>
        <h2 className={styles.subtitle}>Что-то пошло не так</h2>
        <p className={styles.text}>
          Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
        </p>
        <div className={styles.actions}>
          <Link href="/movies" className={styles.link}>
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
