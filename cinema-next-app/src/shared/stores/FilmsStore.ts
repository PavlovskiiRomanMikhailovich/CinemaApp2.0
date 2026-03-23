import { makeAutoObservable, runInAction } from 'mobx';
import { getFilms, type Film, type FilmsQueryParams } from 'api/filmsApi';
import type { RootStore } from './RootStore';

export class FilmsStore {
  rootStore: RootStore;
  
  films: Film[] = [];
  loading = false;
  loadingMore = false;
  error: string | null = null;
  total = 0;
  currentPage = 1;
  hasMore = true;
  pageSize = 12;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this, { 
      rootStore: false,
      setFilms: false,
      addFilms: false,
      setLoading: false,
      setLoadingMore: false,
      setError: false,
      setTotal: false,
      setCurrentPage: false,
      setHasMore: false,
      reset: false
    });
    this.rootStore = rootStore;
  }

  setFilms(films: Film[]) {
    this.films = films;
  }

  addFilms(films: Film[]) {
    this.films = [...this.films, ...films];
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setLoadingMore(loadingMore: boolean) {
    this.loadingMore = loadingMore;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setTotal(total: number) {
    this.total = total;
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  setHasMore(hasMore: boolean) {
    this.hasMore = hasMore;
  }

  reset() {
    this.films = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.error = null;
  }

  async fetchFilms(params: Omit<FilmsQueryParams, 'pageSize'> = {}) {
    const { page = 1, ...rest } = params;

    if (page === 1) {
      this.setLoading(true);
    } else {
      this.setLoadingMore(true);
    }

    this.setError(null);

    try {
      const queryParams: FilmsQueryParams = {
        ...rest,
        page,
        pageSize: this.pageSize,
      };

      const response = await getFilms(queryParams);
      
      runInAction(() => {
        if (page === 1) {
          this.setFilms(response.data);
        } else {
          this.addFilms(response.data);
        }
        
        this.setTotal(response.meta.pagination.total);
        this.setHasMore(page < response.meta.pagination.pageCount);
        this.setCurrentPage(page);
      });
      
    } catch (err) {
      runInAction(() => {
        this.setError(err instanceof Error ? err.message : 'Failed to fetch films');
      });
    } finally {
      runInAction(() => {
        if (page === 1) {
          this.setLoading(false);
        } else {
          this.setLoadingMore(false);
        }
      });
    }
  }

  loadMore(params: Omit<FilmsQueryParams, 'page' | 'pageSize'>) {
    if (!this.hasMore || this.loadingMore || this.loading) return;
    this.fetchFilms({ ...params, page: this.currentPage + 1 });
  }

  async searchFilms(search: string, categoryIds: number[]) {
    this.reset();
    await this.fetchFilms({ search, categoryIds, page: 1 });
  }

  get filmsCount() {
    return this.films.length;
  }

  get hasFilters() {
    return this.rootStore.categoriesStore.selectedCategories.length > 0;
  }
}
