import axios from 'axios';
import qs from 'qs';

const STRAPI_BASE_URL = 'https://front-school-strapi.ktsdev.ru';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;

const POPULATE_CONFIG = { populate: ['category', 'poster', 'gallery'] };

const apiClient = axios.create({
  baseURL: STRAPI_URL,
  paramsSerializer: params => qs.stringify(params, { encode: false }),
});

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export interface Category {
  id: number;
  documentId: string;
  title: string;
  slug: string;
}

export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface Image {
  id: number;
  documentId: string;
  url: string;
  formats?: {
    small?: ImageFormat;
    thumbnail?: ImageFormat;
    large?: ImageFormat;
  };
}

export interface Film {
  id: number;
  documentId: string;
  title: string;
  description: string;
  shortDescription: string;
  releaseYear: number;
  duration: number;
  rating: number;
  ageLimit: number;
  category: Category;
  poster: Image;
  gallery: Image[];
  trailerUrl: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  };
}

export type FilmResponse = StrapiResponse<Film>;
export type FilmsResponse = StrapiResponse<Film[]>;

export interface FilmsQueryParams {
  search?: string;
  categoryIds?: number[];
  page?: number;
  pageSize?: number;
}

export const getFilmById = async (documentId: string): Promise<FilmResponse> => {
  const cacheKey = `film-${documentId}`;
  const cached = getCached(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await apiClient.get(`/films/${documentId}`, { 
      params: POPULATE_CONFIG 
    });
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching film ${documentId}:`, error);
    throw error;
  }
};

export const getFilms = async (params: FilmsQueryParams = {}): Promise<FilmsResponse> => {
  try {
    const queryParams: any = {
      ...POPULATE_CONFIG,
    };

    if (params.page || params.pageSize) {
      queryParams.pagination = {
        page: params.page || 1,
        pageSize: params.pageSize || 12,
      };
    }

    const filters: any = {};

    if (params.search) {
      filters.title = {
        $contains: params.search
      };
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
      filters.category = {
        id: {
          $in: params.categoryIds
        }
      };
    }

    if (Object.keys(filters).length > 0) {
      queryParams.filters = filters;
    }
    
    const response = await apiClient.get('/films', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching films:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<StrapiResponse<Category[]>> => {
  const cacheKey = 'categories';
  const cached = getCached(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await apiClient.get('/film-categories');
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
