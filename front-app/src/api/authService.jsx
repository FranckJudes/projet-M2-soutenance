import axiosInstance from '../config/axiosInstance';
import axios from 'axios';
import { API_URL } from '../config/urls.jsx';

const AUTH_LOGIN = API_URL.AUTH_LOGIN;
const AUTH_REGISTER = API_URL.AUTH_REGISTER;
const AUTH_REFRESH_TOKEN = API_URL.AUTH_REFRESH_TOKEN;
const AUTH_LOGOUT = API_URL.AUTH_LOGOUT;

// Fonction utilitaire pour stocker les données d'authentification
const storeAuthData = (data) => {
  if (!data) return;
  
  // Extraire les données avec les bons noms de champs
  const { accessToken, refreshToken, userId, email, role } = data;
  
  console.log('Données d\'authentification reçues:', { accessToken, refreshToken, userId, email, role });
  
  // Stocker seulement le token d'accès dans sessionStorage
  sessionStorage.setItem('token', accessToken);
  sessionStorage.setItem('refreshToken', refreshToken);
  sessionStorage.setItem('userId', userId);
  sessionStorage.setItem('email', email);
  sessionStorage.setItem('role', role);
  
  // Stocker la date d'expiration (1 heure)
  const expiresAt = new Date().getTime() + 3600000;
  sessionStorage.setItem('expires_at', expiresAt.toString());

  console.log('Token stocké:', sessionStorage.getItem('token'));
};

// Fonction utilitaire pour effacer les données d'authentification
const clearAuthData = () => {
  // Effacer de sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('email');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('expires_at');
};

export const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(AUTH_LOGIN, {
        email,
        password
      });
      
      if (response.data && response.data.data) {
        storeAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  async register(registerData) {
    try {
      const response = await axios.post(AUTH_REGISTER, registerData);
      
      if (response.data && response.data.data) {
        storeAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async refreshToken() {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(AUTH_REFRESH_TOKEN, {
        token: refreshToken
      });
      
      if (response.data && response.data.data) {
        storeAuthData(response.data.data);
        return response.data.data.accessToken;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw new Error('Token refresh failed');
    }
  },

  async getCurrentUser() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await axiosInstance.get(`${API_URL.SERVICE_HARMONI}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch user error:', error);
      throw new Error(error.response?.data?.message || 'Fetch user failed');
    }
  },

  async logout() {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          await axiosInstance.post(AUTH_LOGOUT);
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    } finally {
      clearAuthData();
    }
  },
  
  isAuthenticated() {
    const token = sessionStorage.getItem('token');
    const expiresAt = parseInt(sessionStorage.getItem('expires_at') || '0', 10);
    
    if (!token) return false;
    
    // Vérifier l'expiration
    if (expiresAt && new Date().getTime() > expiresAt) {
      console.log('Token expiré selon l\'horloge locale');
      this.logout();
      return false;
    }
    
    return true;
  },
  
  getToken() {
    if (!this.isAuthenticated()) {
      return null;
    }
    return sessionStorage.getItem('token');
  },
  
  getRefreshToken() {
    return sessionStorage.getItem('refreshToken');
  },
  
  getUserRole() {
    return sessionStorage.getItem('role');
  }
};