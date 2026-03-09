'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Card from 'components/Card/Card';
import Text from 'components/Text/Text';
import Button from 'components/Button/Button';
import { useFavoritesStore, useAuthStore } from 'providers/StoreProvider';
import { useRouter } from 'next/navigation';
import { formatAgeLimit, isTruthy } from 'utils/dataFromat';
import styles from './FavoritesPage.module.scss';

const FavoritesPage = observer(() => {
  const navigate = useRouter();
  const favoritesStore = useFavoritesStore();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated) {
      favoritesStore.fetchFavorites();
    }
  }, [authStore.isAuthenticated]);

  const handleCardClick = (documentId: string) => {
    navigate.push(`/film/${documentId}`);
    navigate.refresh();
  };

  const handleRemoveFromFavorites = async (e: React.MouseEvent, filmId: number) => {
    e.stopPropagation();
    await favoritesStore.removeFromFavorites(filmId);
  };

  if (favoritesStore.loading) {
    return <div className={styles.loading}>Загрузка избранного...</div>;
  }

  if (favoritesStore.favorites.length === 0) {
    return (
      <div className={styles.empty}>
        <Text tag="h1" color="primary">Избранное</Text>
        <Text color="secondary">У вас пока нет избранных фильмов</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Text tag="h1" color="primary" className={styles.title}>
        Избранное ({favoritesStore.favoritesCount})
      </Text>
      
      <div className={styles.grid}>
        {favoritesStore.favorites.map((film) => {
          const posterUrl = film.poster?.formats?.small?.url || film.poster?.url || '';
          
          const infoString = [
            film.releaseYear,
            film.category?.title,
            formatAgeLimit(film.ageLimit)
          ]
            .filter(isTruthy)
            .join('  •  ');

          const actionSlot = (
            <div className={styles["card-actions"]}>
              <Button 
                variant='filled'
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Смотреть:', film.title);
                }}
              >
                Смотреть
              </Button>
              <Button 
                variant='outline'
                onClick={(e) => handleRemoveFromFavorites(e, film.id)}
              >
                Удалить
              </Button>
            </div>
          );

          return (
            <Card
              key={film.documentId}
              image={posterUrl}
              captionSlot={infoString}
              title={film.title}
              rating={film.rating} 
              duration={film.duration}
              subtitle={film.shortDescription || film.description}
              actionSlot={actionSlot}
              onClick={() => handleCardClick(film.documentId)}
            />
          );
        })}
      </div>
    </div>
  );
});

export default FavoritesPage;
