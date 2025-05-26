import axios from 'axios';
import { API_URL } from '../config/urls.jsx';
import { toast } from 'react-hot-toast';

let isRefreshing = false;
let subscribers = [];
let backendUnavailableTimeout = null;
let consecutiveFailures = 0;
let isBackendUnavailable = false;

function subscribeTokenRefresh(callback) {
  subscribers.push(callback);
}

function onRefreshed(newToken) {
  subscribers.forEach((callback) => callback(newToken));
  subscribers = [];
}

function clearAllAuthData() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('email');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('security_fingerprint');
  sessionStorage.removeItem('expires_at');
}

function handleBackendUnavailable() {
  if (isBackendUnavailable) return;
  
  isBackendUnavailable = true;
  clearAllAuthData();
  toast.error('Le serveur est indisponible. Vous avez été déconnecté automatiquement.');
  
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

const axiosInstance = axios.create({
  baseURL: API_URL.SERVICE_HARMONI,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosInstance.interceptors.response.use(
  (response) => {
    consecutiveFailures = 0;
    if (backendUnavailableTimeout) {
      clearTimeout(backendUnavailableTimeout);
      backendUnavailableTimeout = null;
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    if (response && response.status === 401 && !config._retry) {
      config._retry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshToken = sessionStorage.getItem('refreshToken');
          if (!refreshToken) {
            clearAllAuthData();
            window.location.href = '/login';
            return Promise.reject(error);
          }
          
          const refreshResponse = await axios.post(
            `${API_URL.AUTH_REFRESH_TOKEN}`,
            { token: refreshToken },
            { timeout: 5000 }
          );
          
          const { accessToken } = refreshResponse.data.data;
          sessionStorage.setItem('token', accessToken);
          
          isRefreshing = false;
          onRefreshed(accessToken);
          
          return axiosInstance({
            ...config,
            headers: {
              ...config.headers,
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
        } catch (refreshError) {
          isRefreshing = false;
          clearAllAuthData();
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(config));
          });
        });
      }
    }
    
    if (error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'NETWORK_ERROR' ||
        !error.response) {
      
      consecutiveFailures++;
      
      if (consecutiveFailures >= 2) {
        if (backendUnavailableTimeout) {
          clearTimeout(backendUnavailableTimeout);
        }
        
        backendUnavailableTimeout = setTimeout(() => {
          handleBackendUnavailable();
        }, 3000);
      }
    }
    
    if (response && (response.status >= 500 || response.status === 503)) {
      consecutiveFailures++;
      
      if (consecutiveFailures >= 3) {
        handleBackendUnavailable();
      }
    }
    
    return Promise.reject(error);
  }
);

window.addEventListener('online', () => {
  consecutiveFailures = 0;
  isBackendUnavailable = false;
  if (backendUnavailableTimeout) {
    clearTimeout(backendUnavailableTimeout);
    backendUnavailableTimeout = null;
  }
});

window.addEventListener('offline', () => {
  handleBackendUnavailable();
});

export default axiosInstance;