import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import type { RootStore } from './RootStore';
import type { Film } from 'api/filmsApi';

const STRAPI_URL = 'https://front-school-strapi.ktsdev.ru/api';

interface FavoriteResponse {
  id: number;
  documentId: string;
  originalFilmId: number;
  film: Film;
}

export class FavoritesStore {
  rootStore: RootStore;
  
  favorites: Film[] = [];
  loading = false;
  error: string | null = null;
  favoriteIds: Set<number> = new Set();

  constructor(rootStore: RootStore) {
  makeAutoObservable(this, { 
    rootStore: false  // ← добавляем это везде
  });
    this.rootStore = rootStore;
  }

  private get token() {
    return this.rootStore.authStore.token;
  }

  async fetchFavorites() {
    if (!this.token) return;
    
    this.loading = true;
    this.error = null;
    
    try {
      const response = await axios.get<FavoriteResponse[]>(`${STRAPI_URL}/film-favorites`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      runInAction(() => {
        this.favorites = response.data.map(item => item.film);
        this.favoriteIds = new Set(response.data.map(item => item.film.id));
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error?.message || 'Failed to load favorites';
        this.loading = false;
      });
    }
  }

  async addToFavorites(filmId: number) {
    if (!this.token) return;
    
    try {
      await axios.post(
        `${STRAPI_URL}/film-favorites/add`,
        { film: filmId },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      
      await this.fetchFavorites();
    } catch (err: any) {
      console.error('Failed to add to favorites:', err);
    }
  }

  async removeFromFavorites(filmId: number) {
    if (!this.token) return;
    
    try {
      await axios.post(
        `${STRAPI_URL}/film-favorites/remove`,
        { film: filmId },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      
      runInAction(() => {
        this.favoriteIds.delete(filmId);
        this.favorites = this.favorites.filter(f => f.id !== filmId);
      });
    } catch (err: any) {
      console.error('Failed to remove from favorites:', err);
    }
  }

  isFavorite(filmId: number): boolean {
    return this.favoriteIds.has(filmId);
  }

  get favoritesCount() {
    return this.favorites.length;
  }
}
