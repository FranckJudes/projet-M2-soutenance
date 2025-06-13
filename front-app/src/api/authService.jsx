import axiosInstance from '../config/axiosInstance';
import axios from 'axios';
import { API_URL } from '../config/urls.jsx';
import CryptoJS from 'crypto-js';

const AUTH_LOGIN = API_URL.AUTH_LOGIN;
const AUTH_REGISTER = API_URL.AUTH_REGISTER;
const AUTH_REFRESH_TOKEN = API_URL.AUTH_REFRESH_TOKEN;
const AUTH_LOGOUT = API_URL.AUTH_LOGOUT;

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const createSecurityFingerprint = (token) => {
  if (!token) return null;
  const userAgent = navigator.userAgent;
  const fingerprint = CryptoJS.SHA256(token + userAgent + SECRET_KEY).toString();
  return fingerprint;
};

const verifySecurityFingerprint = (token) => {
  if (!token) return false;
  const storedFingerprint = sessionStorage.getItem('security_fingerprint') || localStorage.getItem('security_fingerprint');
  const currentFingerprint = createSecurityFingerprint(token);
  return storedFingerprint === currentFingerprint;
};

// Fonction utilitaire pour stocker les données d'authentification
const storeAuthData = (data) => {
  if (!data) return;
  
  // Extraire les données avec les bons noms de champs
  const { accessToken, refreshToken, userId, email, role } = data;
  
  console.log('Données d\'authentification reçues:', { accessToken, refreshToken, userId, email, role });
  
  // Stocker dans sessionStorage pour la session actuelle
  sessionStorage.setItem('token', accessToken);
  sessionStorage.setItem('refreshToken', refreshToken);
  sessionStorage.setItem('userId', userId);
  sessionStorage.setItem('email', email);
  sessionStorage.setItem('role', role);
  
  // Stocker aussi dans localStorage pour la persistance
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userId', userId);
  localStorage.setItem('email', email);
  localStorage.setItem('role', role);
  
  // Créer et stocker l'empreinte de sécurité
  const fingerprint = createSecurityFingerprint(accessToken);
  sessionStorage.setItem('security_fingerprint', fingerprint);
  localStorage.setItem('security_fingerprint', fingerprint);
  
  // Stocker la date d'expiration (1 heure)
  const expiresAt = new Date().getTime() + 3600000;
  sessionStorage.setItem('expires_at', expiresAt.toString());
  localStorage.setItem('expires_at', expiresAt.toString());
};

// Fonction utilitaire pour effacer les données d'authentification
const clearAuthData = () => {
  // Effacer de sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('email');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('security_fingerprint');
  sessionStorage.removeItem('expires_at');
  
  // Effacer de localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('security_fingerprint');
  localStorage.removeItem('expires_at');
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
        sessionStorage.setItem('role', response.data.data.role);
      }
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(AUTH_REFRESH_TOKEN, {
        token: refreshToken
      });
      
      if (response.data && response.data.data) {
        storeAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  async getCurrentUser() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch user error:', error);
      throw new Error(error.response?.data?.message || 'Fetch user failed');
    }
  },

  async logout() {
    try {
      let token = sessionStorage.getItem('token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      
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
    // Vérifier d'abord dans sessionStorage
    let token = sessionStorage.getItem('token');
    let expiresAt = parseInt(sessionStorage.getItem('expires_at') || '0', 10);
    let fingerprint = sessionStorage.getItem('security_fingerprint');
    
    // Si pas de token dans sessionStorage, vérifier localStorage
    if (!token) {
      token = localStorage.getItem('token');
      expiresAt = parseInt(localStorage.getItem('expires_at') || '0', 10);
      fingerprint = localStorage.getItem('security_fingerprint');
      
      // Si trouvé dans localStorage, copier dans sessionStorage pour utilisation future
      if (token) {
        console.log('Token trouvé dans localStorage, synchronisation avec sessionStorage');
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', localStorage.getItem('refreshToken'));
        sessionStorage.setItem('userId', localStorage.getItem('userId'));
        sessionStorage.setItem('email', localStorage.getItem('email'));
        sessionStorage.setItem('role', localStorage.getItem('role'));
        sessionStorage.setItem('security_fingerprint', fingerprint);
        sessionStorage.setItem('expires_at', expiresAt.toString());
      }
    }
    
    // Si toujours pas de token, l'utilisateur n'est pas authentifié
    if (!token) return false;
    
    // Vérifier l'expiration
    if (expiresAt && new Date().getTime() > expiresAt) {
      console.log('Token expiré selon l\'horloge locale');
      this.logout();
      return false;
    }
    
    // Vérifier l'empreinte de sécurité si disponible
    if (fingerprint && !verifySecurityFingerprint(token)) {
      console.error('Security fingerprint verification failed. Possible token tampering detected.');
      this.logout();
      return false;
    }
    
    return true;
  },
  
  getToken() {
    // Vérifier l'authentification (cela synchronisera aussi localStorage et sessionStorage)
    if (!this.isAuthenticated()) {
      return null;
    }
    
    // À ce stade, le token est garanti d'être dans sessionStorage
    return sessionStorage.getItem('token');
  },
  
  getRefreshToken() {
    // Vérifier l'authentification (cela synchronisera aussi localStorage et sessionStorage)
    if (!this.isAuthenticated()) {
      return null;
    }
    
    // À ce stade, le refreshToken est garanti d'être dans sessionStorage
    return sessionStorage.getItem('refreshToken');
  },
  
  getUserRole() {
    return sessionStorage.getItem('role');
  }
};