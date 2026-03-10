import Link from 'next/link';
import styles from 'styles/not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Страница не найдена</h2>
        <p className={styles.text}>
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <Link href="/movies" className={styles.link}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}