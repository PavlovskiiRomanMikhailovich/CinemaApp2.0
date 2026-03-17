'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Film, StrapiResponse } from 'api/filmsApi';
import { getFilms, getFilmById } from 'api/filmsApi';
import Text from 'components/Text/Text';
import Button from 'components/Button/Button';
import Card from 'components/Card/Card';
import Badge from 'components/Badge/Badge';
import styles from './FilmPage.module.scss';
import classNames from 'classnames';
import { formatAgeLimit, formatDuration, isTruthy } from 'utils/dataFromat';

const FilmPage = () => {
  const params = useParams<{ documentId: string }>();
  const documentId = params?.documentId;
  const router = useRouter();
  
  const [film, setFilm] = useState<Film | null>(null);
  const [recommendations, setRecommendations] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilmAndRecommendations = async () => {
      if (!documentId) return;
      
      setLoading(true);
      setError(null);
      try {
        const filmResponse: StrapiResponse<Film> = await getFilmById(documentId);
        setFilm(filmResponse.data);
        
        const allFilmsResponse: StrapiResponse<Film[]> = await getFilms();
        const otherFilms = allFilmsResponse.data
          .filter(f => f.documentId !== documentId)
          .slice(0, 6);
        setRecommendations(otherFilms);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch film');
      } finally {
        setLoading(false);
      }
    };

    fetchFilmAndRecommendations();
  }, [documentId]);

  const handleCardClick = (id: string) => {
    router.push(`/film/${id}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) return (
    <div className={styles['skeleton-page']}>
      <div className={styles['skeleton-back']} />

      <div className={styles['skeleton-content']}>
        <div className={styles['skeleton-video']} />

        <div className={styles['skeleton-info']}>
          <div className={`${styles['skeleton-line']} ${styles['skeleton-line--title']}`} />
          <div className={`${styles['skeleton-line']} ${styles['skeleton-line--meta']}`} />
          <div className={styles['skeleton-desc']}>
            <div className={`${styles['skeleton-line']} ${styles['skeleton-line--desc-1']}`} />
            <div className={`${styles['skeleton-line']} ${styles['skeleton-line--desc-2']}`} />
            <div className={`${styles['skeleton-line']} ${styles['skeleton-line--desc-3']}`} />
            <div className={`${styles['skeleton-line']} ${styles['skeleton-line--desc-4']}`} />
          </div>
        </div>
      </div>

      <div className={styles['skeleton-recs']}>
        <div className={styles['skeleton-recs-title']} />
        <div className={styles['skeleton-recs-track']}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles['skeleton-card']} style={{ '--i': i } as React.CSSProperties}>
              <div className={styles['skeleton-card-image']} />
              <div className={`${styles['skeleton-card-line']}`} />
              <div className={`${styles['skeleton-card-line']} ${styles['skeleton-card-line--short']}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  if (error) throw error;
  if (!film) throw new Error('Фильм не найден');

  const posterUrl = film.poster?.formats?.large?.url || film.poster?.url || '';
  const infoString = [
    film.releaseYear,
    film.category?.title,
    formatAgeLimit(film.ageLimit)
  ].filter(isTruthy).join(' • ');

  const fullPosterUrl = posterUrl.startsWith('http') 
    ? posterUrl 
    : `https://front-school-strapi.ktsdev.ru${posterUrl}`;

  return (
    <div className={styles['film-page']}>
      <Button 
        variant="outline" 
        onClick={handleGoBack}
        className={styles['back-button']}
      >
        <img src="/images/arrow-left.svg" alt="Назад"/>
        <div>Назад</div>
      </Button>

      <div className={styles['film-page__content']}>
        <div className={styles['film-page__trailer']}>
          <iframe
            src={`${film.trailerUrl}&autoplay=0&hd=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
            title={`${film.title} trailer`}
            className={styles['film-page__video']}
          />
        </div>

        <div className={styles['film-page__info']}>
          <div className={styles['film-page__title-wrapper']}>
            <Text weight="medium" view="title" color="primary">
              {film.title}
            </Text>
            {film.rating && <Badge type="rating" value={film.rating.toFixed(1)} className={styles['title-badge']}/>}
          </div>
          
          <Text view="p-20" color="primary" className={styles['film-page__meta']}>
            {infoString + " • " + formatDuration(film.duration)}
          </Text>

          <Text view="p-20" className={styles['film-page__description']}>
            {film.description}
          </Text>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className={styles['film-page__recommendations']}>
          <Text tag='h2' color="primary" weight='normal' className={styles['recommendations-title']}>
            Рекомендации
          </Text>
          
          <div className={styles['recommendations-carousel']}>
            <button 
              className={classNames(
                styles['carousel-arrow'],
                styles['carousel-arrow--left']
              )}
              onClick={() => {
                const container = document.querySelector(`.${styles['recommendations-track']}`);
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <img src="/images/arrow-left.svg" alt="Назад" />
            </button>
            
            <div className={styles['recommendations-track']}>
              {recommendations.map(film => {
                const posterUrl = film.poster?.formats?.small?.url || film.poster?.url || '';
                const fullPosterUrl = posterUrl.startsWith('http') 
                  ? posterUrl 
                  : `https://front-school-strapi.ktsdev.ru${posterUrl}`;
                  
                const infoString = [
                  film.releaseYear,
                  film.category?.title,
                  formatAgeLimit(film.ageLimit)
                ].filter(isTruthy).join(' • ');

                return (
                  <div key={film.documentId} className={styles['recommendations-item']}>
                    <Card
                      image={fullPosterUrl}
                      captionSlot={infoString}
                      title={film.title}
                      rating={film.rating}
                      duration={film.duration}
                      subtitle={film.shortDescription || film.description}
                      onClick={() => handleCardClick(film.documentId)}
                    />
                  </div>
                );
              })}
            </div>

            <button 
              className={classNames(
                styles['carousel-arrow'],
                styles['carousel-arrow--right']
              )}
              onClick={() => {
                const container = document.querySelector(`.${styles['recommendations-track']}`);
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <img src="/images/arrow-right.svg" alt="Вперед" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmPage;
