import { FilmsStore } from './FilmsStore';
import { CategoriesStore } from './CategoriesStore';
import { AuthStore } from './AuthStore';
import { FavoritesStore } from './FavoritesStore';

export class RootStore {
  filmsStore: FilmsStore;
  categoriesStore: CategoriesStore;
  authStore: AuthStore;
  favoritesStore: FavoritesStore;

  constructor() {
    this.filmsStore = new FilmsStore(this);
    this.categoriesStore = new CategoriesStore(this);
    this.authStore = new AuthStore(this);
    this.favoritesStore = new FavoritesStore(this);
  }
}
