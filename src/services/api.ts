import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Central Axios client: injects auth tokens and normalizes API errors.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;

  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser();
    }

    return Promise.reject({
      message: error.response?.data?.message ?? error.message ?? 'Une erreur est survenue',
      status: error.response?.status ?? 500
    });
  }
);
