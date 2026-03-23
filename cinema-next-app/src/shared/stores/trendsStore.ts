import { create } from 'zustand';

export interface TrendFilm {
  id: number;
  documentId: string;
  title: string;
  shortDescription: string;
  trailerUrl: string;
  posterUrl: string;
  gallery: string[];
}

interface TrendsState {
  items: TrendFilm[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  activeIndex: number;
  fetchNextPage: () => Promise<void>;
  setActiveIndex: (index: number) => void;
}

export const useTrendsStore = create<TrendsState>((set, get) => ({
  items: [],
  page: 0,
  hasMore: true,
  loading: false,
  activeIndex: 0,

  fetchNextPage: async () => {
    const { loading, hasMore, page } = get();
    if (loading || !hasMore) return;

    set({ loading: true });

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/trends?page=${nextPage}`);
      if (!res.ok) throw new Error('Failed to fetch trends');

      const data: { items: TrendFilm[]; hasMore: boolean } = await res.json();

      set(state => ({
        items: [...state.items, ...data.items],
        page: nextPage,
        hasMore: data.hasMore,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  setActiveIndex: (index: number) => set({ activeIndex: index }),
}));
