'use client';

import { useTheme } from 'providers/ThemeProvider';
import styles from './ThemeToggle.module.scss';

const ThemeToggle = () => {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  const isLight = theme === 'light';

  return (
    <button
      className={`${styles.toggle} ${isLight ? styles['toggle--light'] : ''}`}
      onClick={toggleTheme}
      aria-label={isLight ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
      type="button"
    >
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
    </button>
  );
};

export default ThemeToggle;
