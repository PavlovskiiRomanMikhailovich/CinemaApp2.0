'use client';

import React from 'react';
import { RootStore } from 'stores/RootStore';

const StoresContext = React.createContext<RootStore | null>(null);

export const StoreProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [rootStore] = React.useState(() => new RootStore());
  
  return (
    <StoresContext.Provider value={rootStore}>
      {children}
    </StoresContext.Provider>
  );
};

export const useStores = () => {
  const stores = React.useContext(StoresContext);
  if (!stores) {
    throw new Error('useStores must be used within StoreProvider');
  }
  return stores;
};

export const useAuthStore = () => useStores().authStore;
export const useFilmsStore = () => useStores().filmsStore;
export const useCategoriesStore = () => useStores().categoriesStore;
export const useFavoritesStore = () => useStores().favoritesStore;