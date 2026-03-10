'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import Card from 'components/Card/Card';
import Text from 'components/Text/Text';
import Button from 'components/Button/Button';
import styles from './MoviesContent.module.scss';
import { formatAgeLimit, isTruthy } from 'utils/dataFromat';
import Input from 'components/Input/Input';
import Dropdown from 'components/Dropdow/Dropdow';
import { useFilmsStore, useCategoriesStore, useFavoritesStore } from 'providers/StoreProvider';

interface MoviesContentProps {
  title: string;
  category: 'home' | 'new_films' | 'recomendations';
}

const MoviesContent = observer(({ title, category }: MoviesContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const filmsStore = useFilmsStore();
  const categoriesStore = useCategoriesStore();
  const favoritesStore = useFavoritesStore();
  
  const [tempSearchQuery, setTempSearchQuery] = useState('');

  useEffect(() => {
    categoriesStore.fetchCategories();
  }, [categoriesStore]);

  useEffect(() => {
    if (favoritesStore.favorites.length === 0) {
      favoritesStore.fetchFavorites();
    }
  }, [favoritesStore]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const categories = searchParams.getAll('category');
    
    setTempSearchQuery(search);
    categoriesStore.setTempSelectedCategories(categories);
    categoriesStore.setSelectedCategories(categories);
    
    filmsStore.reset();
    filmsStore.fetchFilms({ 
      search, 
      categoryIds: categories.map(Number),
      page: 1 
    });
  }, [searchParams, filmsStore, categoriesStore]);

  const handleSearch = async () => {
    categoriesStore.applySelection();
    
    // Создаем новые URL параметры
    const params = new URLSearchParams();
    if (tempSearchQuery) {
      params.set('search', tempSearchQuery);
    }
    categoriesStore.selectedCategories.forEach(cat => {
      params.append('category', cat);
    });
    
    // Обновляем URL без перезагрузки страницы
    router.push(`?${params.toString()}`);
    
    filmsStore.reset();
    await filmsStore.fetchFilms({ 
      search: tempSearchQuery, 
      categoryIds: categoriesStore.selectedCategoryIds,
      page: 1 
    });
  };

  const lastFilmRef = useCallback((node: HTMLDivElement) => {
    if (filmsStore.loading || filmsStore.loadingMore) return;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && filmsStore.hasMore) {
        filmsStore.loadMore({
          search: tempSearchQuery,
          categoryIds: categoriesStore.selectedCategoryIds
        });
      }
    });
    
    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.disconnect();
    };
  }, [filmsStore.loading, filmsStore.loadingMore, filmsStore.hasMore, tempSearchQuery, categoriesStore.selectedCategoryIds]);

  const handleCardClick = (documentId: string) => {
    router.push(`/film/${documentId}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent, filmId: number, isFavorite: boolean) => {
    e.stopPropagation();
    if (isFavorite) {
      await favoritesStore.removeFromFavorites(filmId);
    } else {
      await favoritesStore.addToFavorites(filmId);
    }
  };

  if (filmsStore.loading && filmsStore.films.length === 0) {
    return <div className="loading">Загрузка фильмов...</div>;
  }
  
  if (filmsStore.error) {
    throw filmsStore.error;
  }

  return (
    <div className={styles["movies-content"]}>
      <div className={styles["serch-container"]}>
        <Input 
          value={tempSearchQuery}
          onChange={(e) => setTempSearchQuery(e.target.value)}
          placeholder="Поиск по названию"
        />
        <Button variant='filled' onClick={handleSearch}>
          Найти
        </Button>
      </div>
      
      <Dropdown
        options={categoriesStore.categoryOptions}
        value={categoriesStore.tempSelectedCategories}
        onChange={(selected) => categoriesStore.setTempSelectedCategories(selected)}
        placeholder="Фильтры"
        multiple
      />
      
      <Text className={styles['movies-header']} color='primary' tag='h1'>{title}</Text>
      
      <div className={styles["movies-grid"]}>
        {filmsStore.films.map((film, index) => {
          const posterUrl = film.poster?.formats?.small?.url || film.poster?.url || '';
          
          const infoString = [
            film.releaseYear,
            film.category?.title,
            formatAgeLimit(film.ageLimit)
          ]
            .filter(isTruthy)
            .join('  •  ');

          const isFavorite = favoritesStore.isFavorite(film.id);

          const actionSlot = (
            <div className={styles["card-actions"]}>
              <Button 
                variant={isFavorite ? 'filled' : 'outline'}
                onClick={(e) => handleFavoriteClick(e, film.id, isFavorite)}
              >
                {isFavorite ? 'В избранном' : 'В избранное'}
              </Button>
              <Button 
                variant='filled'
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Смотреть:', film.title);
                }}
              >
                Смотреть
              </Button>
            </div>
          );

          const isLastElement = index === filmsStore.films.length - 1;
          
          return (
            <div
              key={film.documentId}
              ref={isLastElement ? lastFilmRef : null}
            >
              <Card
                image={posterUrl}
                captionSlot={infoString}
                title={film.title}
                rating={film.rating} 
                duration={film.duration}
                subtitle={film.shortDescription || film.description}
                actionSlot={actionSlot}
                onClick={() => handleCardClick(film.documentId)}
              />
            </div>
          );
        })}
      </div>
      
      {filmsStore.loadingMore && (
        <div className={styles.loadingMore}>Загрузка...</div>
      )}
      
      {!filmsStore.hasMore && filmsStore.films.length > 0 && (
        <div className={styles.noMore}>Больше фильмов нет</div>
      )}
    </div>
  );
});

export default MoviesContent;
