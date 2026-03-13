'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import Card from 'components/Card/Card';
import Text from 'components/Text/Text';
import Button from 'components/Button/Button';
import Input from 'components/Input/Input';
import FiltersBar from 'components/FiltersBar/FiltersBar';
import {
  EMPTY_FILTERS,
  type FiltersState,
  parseFiltersFromParams,
  parseFiltersForApi,
} from 'components/FiltersBar/filtersConfig';
import styles from './MoviesContent.module.scss';
import { formatAgeLimit, isTruthy } from 'utils/dataFromat';
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
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);

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
    const parsedFilters = parseFiltersFromParams(searchParams);

    setTempSearchQuery(search);
    setFilters(parsedFilters);

    filmsStore.reset();
    filmsStore.fetchFilms({
      search,
      page: 1,
      ...parseFiltersForApi(parsedFilters),
    });
  }, [searchParams, filmsStore]);

  const buildParams = (search: string, activeFilters: FiltersState): URLSearchParams => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    activeFilters.genres.forEach((g) => params.append('category', g));
    if (activeFilters.year) params.set('year', activeFilters.year);
    if (activeFilters.rating) params.set('rating', activeFilters.rating);
    if (activeFilters.duration) params.set('duration', activeFilters.duration);
    activeFilters.age.forEach((a) => params.append('age', a));
    return params;
  };

  const handleSearch = () => {
    router.push(`?${buildParams(tempSearchQuery, filters).toString()}`);
  };

  const handleFiltersChange = (newFilters: FiltersState) => {
    router.push(`?${buildParams(tempSearchQuery, newFilters).toString()}`);
  };

  const lastFilmRef = useCallback(
    (node: HTMLDivElement) => {
      if (filmsStore.loading || filmsStore.loadingMore) return;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && filmsStore.hasMore) {
          filmsStore.loadMore({
            search: tempSearchQuery,
            ...parseFiltersForApi(filters),
          });
        }
      });

      if (node) observer.observe(node);
      return () => {
        if (node) observer.disconnect();
      };
    },
    [filmsStore.loading, filmsStore.loadingMore, filmsStore.hasMore, tempSearchQuery, filters],
  );

  const handleCardClick = (documentId: string) => {
    router.push(`/film/${documentId}`);
  };

  const handleFavoriteClick = async (
    e: React.MouseEvent,
    filmId: number,
    isFavorite: boolean,
  ) => {
    e.stopPropagation();
    if (isFavorite) {
      await favoritesStore.removeFromFavorites(filmId);
    } else {
      await favoritesStore.addToFavorites(filmId);
    }
  };

  if (filmsStore.error) {
    throw filmsStore.error;
  }

  const isInitialLoading = filmsStore.loading && filmsStore.films.length === 0;

  return (
    <div className={styles['movies-content']}>
      <div className={styles['serch-container']}>
        <Input
          value={tempSearchQuery}
          onChange={(e) => setTempSearchQuery(e.target.value)}
          placeholder="Поиск по названию"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="filled" onClick={handleSearch}>
          Найти
        </Button>
      </div>

      <FiltersBar
        filters={filters}
        categoryOptions={categoriesStore.categoryOptions}
        onChange={handleFiltersChange}
      />

      <Text className={styles['movies-header']} color="primary" tag="h1">
        {title}
      </Text>

      <div className={styles['movies-grid']}>
        {isInitialLoading
          ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonBody}>
                  <div className={styles.skeletonLine} />
                  <div className={`${styles.skeletonLine} ${styles['skeletonLine--wide']}`} />
                  <div className={`${styles.skeletonLine} ${styles['skeletonLine--short']}`} />
                </div>
              </div>
            ))
          : filmsStore.films.map((film, index) => {
          const posterUrl = film.poster?.formats?.small?.url || film.poster?.url || '';

          const infoString = [
            film.releaseYear,
            film.category?.title,
            formatAgeLimit(film.ageLimit),
          ]
            .filter(isTruthy)
            .join('  •  ');

          const isFavorite = favoritesStore.isFavorite(film.id);

          const actionSlot = (
            <div className={styles['card-actions']}>
              <Button
                variant={isFavorite ? 'filled' : 'outline'}
                onClick={(e) => handleFavoriteClick(e, film.id, isFavorite)}
              >
                {isFavorite ? 'В избранном' : 'В избранное'}
              </Button>
              <Button
                variant="filled"
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
            <div key={film.documentId} ref={isLastElement ? lastFilmRef : null}>
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
