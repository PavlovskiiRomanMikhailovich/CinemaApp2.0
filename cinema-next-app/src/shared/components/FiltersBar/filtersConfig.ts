import type { FilmsQueryParams } from 'api/filmsApi';

export interface FiltersState {
  genres: string[];
  year: string;
  rating: string;
  duration: string;
  age: string[];
}

export const EMPTY_FILTERS: FiltersState = {
  genres: [],
  year: '',
  rating: '',
  duration: '',
  age: [],
};

export function countActiveFilters(filters: FiltersState): number {
  return (
    (filters.genres.length > 0 ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.duration ? 1 : 0) +
    (filters.age.length > 0 ? 1 : 0)
  );
}

const currentYear = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from({ length: currentYear - 1989 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

export const RATING_OPTIONS = [
  { value: '0-3', label: '0 – 3' },
  { value: '3-5', label: '3 – 5' },
  { value: '5-7', label: '5 – 7' },
  { value: '7-8', label: '7 – 8' },
  { value: '8-10', label: '8 – 10' },
];

export const DURATION_OPTIONS = [
  { value: '0-60', label: 'до 60 мин' },
  { value: '60-90', label: '60 – 90 мин' },
  { value: '90-120', label: '90 – 120 мин' },
  { value: '120-999', label: '120+ мин' },
];

export const AGE_OPTIONS = [
  { value: '0', label: '0+' },
  { value: '6', label: '6+' },
  { value: '12', label: '12+' },
  { value: '16', label: '16+' },
  { value: '18', label: '18+' },
];

interface SearchParamsLike {
  get(key: string): string | null;
  getAll(key: string): string[];
}

export function parseFiltersFromParams(params: SearchParamsLike): FiltersState {
  return {
    genres: params.getAll('category'),
    year: params.get('year') ?? '',
    rating: params.get('rating') ?? '',
    duration: params.get('duration') ?? '',
    age: params.getAll('age'),
  };
}

export function parseFiltersForApi(
  filters: FiltersState,
): Omit<FilmsQueryParams, 'search' | 'page' | 'pageSize'> {
  const result: ReturnType<typeof parseFiltersForApi> = {};

  if (filters.genres.length > 0) {
    result.categoryIds = filters.genres.map(Number);
  }

  if (filters.year) {
    result.releaseYear = Number(filters.year);
  }

  if (filters.rating) {
    const [min, max] = filters.rating.split('-').map(Number);
    result.ratingMin = min;
    result.ratingMax = max;
  }

  if (filters.duration) {
    const [min, max] = filters.duration.split('-').map(Number);
    result.durationMin = min;
    result.durationMax = max;
  }

  if (filters.age.length > 0) {
    result.ageLimits = filters.age.map(Number);
  }

  return result;
}
