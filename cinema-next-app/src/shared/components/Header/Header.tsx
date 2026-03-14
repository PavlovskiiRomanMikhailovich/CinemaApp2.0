'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';
import classNames from 'classnames';
import UserMenu from 'components/UserMenu/UserMenu';

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={styles.header}>
      <div className={styles['header__logo']}>
        <img src="/images/logo.png" alt="Logo" />
      </div>
      <nav className={styles['header__nav']}>
        <Link
          href="/movies"
          className={classNames(
            styles['header__link'],
            { [styles['active']]: isActive('/movies') }
          )}
        >
          Фильмы
        </Link>
        <Link
          href="/new_films"
          className={classNames(
            styles['header__link'],
            { [styles['active']]: isActive('/new_films') }
          )}
        >
          Новинки
        </Link>
        <Link
          href="/recomendations"
          className={classNames(
            styles['header__link'],
            { [styles['active']]: isActive('/recomendations') }
          )}
        >
          Подборки
        </Link>
        <Link
          href="/trends"
          className={classNames(
            styles['header__link'],
            { [styles['active']]: isActive('/trends') }
          )}
        >
          Тренды
        </Link>
      </nav>
      <div className={styles['icons-container']}>
        <Link href="/favorites">
          <img src="/images/Bookmark.svg" alt="Избранное" />
        </Link>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
