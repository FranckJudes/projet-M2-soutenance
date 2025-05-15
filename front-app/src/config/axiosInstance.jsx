import axios from 'axios';
import { API_URL } from '../config/urls.jsx';
import { authService } from '../api/authService';

let isRefreshing = false;
let subscribers = [];

function subscribeTokenRefresh(callback) {
  subscribers.push(callback);
}

function onRefreshed(newToken) {
  subscribers.forEach((callback) => callback(newToken));
  subscribers = [];
}

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Intercepteur de requête pour ajouter automatiquement le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer le rafraîchissement du token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response && response.status === 401 && !config._retry) {
      config._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = sessionStorage.getItem('refreshToken');
          const data = await authService.refreshToken(refreshToken);
          const newToken = data.token;
          sessionStorage.setItem('token', newToken);
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      const retryOriginalRequest = new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          config.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(axiosInstance(config));
        });
      });
      return retryOriginalRequest;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;