import axios from 'axios';
import { authService } from '../api/authService';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 et le refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenter de rafraîchir le token
        await authService.refreshToken();
        
        // Récupérer le nouveau token
        const newToken = authService.getToken();
        if (newToken) {
          // Mettre à jour le header de la requête originale
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retenter la requête originale
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;