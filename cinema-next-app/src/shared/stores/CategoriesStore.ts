import { makeAutoObservable, runInAction } from 'mobx';
import { getCategories, type Category } from 'api/filmsApi';
import type { RootStore } from './RootStore';

export class CategoriesStore {
  rootStore: RootStore;
  
  categories: Category[] = [];
  selectedCategories: string[] = [];
  tempSelectedCategories: string[] = [];
  loading = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
  makeAutoObservable(this, { 
    rootStore: false
  });
    this.rootStore = rootStore;
  }

  setCategories(categories: Category[]) {
    this.categories = categories;
  }

  setSelectedCategories(selected: string[]) {
    this.selectedCategories = selected;
  }

  setTempSelectedCategories(temp: string[]) {
    this.tempSelectedCategories = temp;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  resetSelection() {
    this.selectedCategories = [];
    this.tempSelectedCategories = [];
  }

  applySelection() {
    this.selectedCategories = [...this.tempSelectedCategories];
  }

  async fetchCategories() {
    this.setLoading(true);
    this.setError(null);
    
    try {
      const response = await getCategories();
      runInAction(() => {
        this.setCategories(response.data);
      });
    } catch (err) {
      runInAction(() => {
        this.setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  get categoryOptions() {
    return this.categories.map(cat => ({
      value: cat.id.toString(),
      label: cat.title
    }));
  }

  get selectedCategoryIds() {
    return this.selectedCategories.map(id => Number(id));
  }

  get tempCategoryIds() {
    return this.tempSelectedCategories.map(id => Number(id));
  }
}
