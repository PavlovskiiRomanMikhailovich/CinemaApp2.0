'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from 'components/ThemeToggle/ThemeToggle';
import { useAuthStore } from 'providers/StoreProvider';
import styles from './UserMenu.module.scss';

const UserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = () => {
    authStore.logout();
    router.push('/login');
  };

  return (
    <div ref={menuRef} className={styles.wrap}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles['trigger--open'] : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Меню пользователя"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserIcon />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.themeRow}>
            <span className={styles.themeLabel}>Тема</span>
            <ThemeToggle />
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <button
            type="button"
            role="menuitem"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
