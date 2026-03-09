import { type RouteProps } from 'react-router-dom';
import MoviesContent from 'App/pages/MoviesContent/MoviesContent';
import FilmPage from 'App/pages/FilmPage/FilmPage';
import RegisterPage from 'App/pages/RegisterPage/RegisterPage';
import LoginPage from 'App/pages/LoginPage/LoginPage';
import ProtectedRoute from 'components/ProtectedRoute/ProtectedRoute';
import PublicRoute from 'components/PublicRoute/PublicRoute';
import Header from 'components/Header/Header';
import FavoritesPage from 'App/pages/FavoritesPage/FavoritesPage';

type Category = 'home' | 'new_films' | 'recomendations';

export const ROUTES = {
  HOME: '/',
  NEW_FILMS: '/new_films',
  RECOMENDATIONS: '/recomendations',
  FILM: '/film/:documentId',
  REGISTER: '/register',
  LOGIN: '/login',
  FAVORITES: '/favorites',
} as const;

export type RoutesType = typeof ROUTES;

interface RouteConfig extends Omit<RouteProps, 'element'> {
  element: React.ReactNode;
  title?: string;
  category?: Category;
  isPublic?: boolean;
}

export const ROUTES_CONFIG: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <Header />
        <MoviesContent title="Фильмы" category="home" />
      </ProtectedRoute>
    ),
    title: 'Фильмы',
    category: 'home',
  },
  {
    path: ROUTES.NEW_FILMS,
    element: (
      <ProtectedRoute>
        <Header />
        <MoviesContent title="Новинки" category="new_films" />
      </ProtectedRoute>
    ),
    title: 'Новинки',
    category: 'new_films',
  },
  {
    path: ROUTES.RECOMENDATIONS,
    element: (
      <ProtectedRoute>
        <Header />
        <MoviesContent title="Подборки" category="recomendations" />
      </ProtectedRoute>
    ),
    title: 'Подборки',
    category: 'recomendations',
  },
  {
    path: ROUTES.FILM,
    element: (
      <ProtectedRoute>
        <Header />
        <FilmPage />
      </ProtectedRoute>
    ),
    title: 'Фильм',
  },
  {
  path: ROUTES.FAVORITES,
  element: (
      <ProtectedRoute>
        <Header/>
        <FavoritesPage />
      </ProtectedRoute>
    ),
    title: 'Избранное',
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
    title: 'Регистрация',
    isPublic: true,
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
    title: 'Вход',
    isPublic: true,
  },
];

export const getRouteTitle = (pathname: string): string | undefined => {
  const route = ROUTES_CONFIG.find(route => route.path === pathname);
  return route?.title;
};

export const isPublicRoute = (pathname: string): boolean => {
  const route = ROUTES_CONFIG.find(route => route.path === pathname);
  return route?.isPublic || false;
};