import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import type { RootStore } from './RootStore';

const STRAPI_URL = 'https://front-school-strapi.ktsdev.ru/api';

export interface User {
  id: number;
  username: string;
  email: string;
}

export class AuthStore {
  rootStore: RootStore;
  
  user: User | null = null;
  token: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
  makeAutoObservable(this, { 
    rootStore: false
  });
    this.rootStore = rootStore;
    
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      }
    } catch (error) {
      console.error('Failed to load auth data from localStorage:', error);
    }
  }

  saveToStorage(token: string, user: User) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.token = token;
      this.user = user;
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
    }
  }

  clearStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
    }
  }

  async register(username: string, email: string, password: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await axios.post(`${STRAPI_URL}/auth/local/register`, {
        username,
        email,
        password
      });
      
      runInAction(() => {
        this.saveToStorage(response.data.jwt, response.data.user);
        this.loading = false;
      });
      
      return response.data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error?.message || 'Registration failed';
        this.loading = false;
      });
      throw err;
    }
  }

  async login(identifier: string, password: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await axios.post(`${STRAPI_URL}/auth/local`, {
        identifier,
        password
      });
      
      runInAction(() => {
        this.saveToStorage(response.data.jwt, response.data.user);
        this.loading = false;
      });
      
      return response.data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error?.message || 'Login failed';
        this.loading = false;
      });
      throw err;
    }
  }

  logout() {
    this.clearStorage();
  }

  get isAuthenticated() {
    return !!this.token && !!this.user;
  }

  get authToken() {
    return this.token;
  }
}
