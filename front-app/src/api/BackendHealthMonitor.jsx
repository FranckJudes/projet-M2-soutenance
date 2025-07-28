import axios from 'axios';
import { API_URL } from '../config/urls.jsx';
import { toast } from 'react-hot-toast';
import { authService } from './authService';

class BackendHealthMonitor {
  constructor() {
    this.isMonitoring = false;
    this.healthCheckInterval = null;
    this.consecutiveFailures = 0;
    this.maxFailures = 2; 
    this.checkIntervalMs = 10000;
    this.healthCheckTimeout = 3000; 
    this.isBackendDown = false;
  }

  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    this.consecutiveFailures = 0;
    this.isBackendDown = false;
    
    this.checkBackendHealth();
    
    this.healthCheckInterval = setInterval(() => {
      this.checkBackendHealth();
    }, this.checkIntervalMs);
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async checkBackendHealth() {
    if (!authService.isAuthenticated()) {
      this.stopMonitoring();
      return;
    }

    try {
      const response = await axios.get(`${API_URL.SERVICE_HARMONI}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        timeout: this.healthCheckTimeout
      });

      if (response.data && response.data.success) {
        this.onBackendAvailable();
        return;
      }

      this.handleBackendUnavailable();
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.handleInvalidToken();
        return;
      }
      
      this.onBackendError(error);
    }
  }

  onBackendAvailable() {
    if (this.isBackendDown) {
      toast.success('Connexion au serveur rétablie');
    }
    
    this.consecutiveFailures = 0;
    this.isBackendDown = false;
  }

  onBackendError(error) {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= this.maxFailures && !this.isBackendDown) {
      this.isBackendDown = true;
      this.handleBackendUnavailable();
    }
  }

  handleInvalidToken() {
    this.clearAuthDataAndRedirect('Votre session a expiré. Veuillez vous reconnecter.');
  }

  handleBackendUnavailable() {
    this.clearAuthDataAndRedirect('Le serveur est indisponible. Vous avez été déconnecté automatiquement.');
  }

  clearAuthDataAndRedirect(message) {
    this.stopMonitoring();
    authService.logout();
    toast.error(message);
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }

  setCheckInterval(intervalMs) {
    this.checkIntervalMs = intervalMs;
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  setMaxFailures(maxFailures) {
    this.maxFailures = maxFailures;
  }

  setHealthCheckTimeout(timeoutMs) {
    this.healthCheckTimeout = timeoutMs;
  }

  forceHealthCheck() {
    this.checkBackendHealth();
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      consecutiveFailures: this.consecutiveFailures,
      maxFailures: this.maxFailures,
      isBackendDown: this.isBackendDown,
      checkInterval: this.checkIntervalMs
    };
  }
}

const backendHealthMonitor = new BackendHealthMonitor();

if (typeof window !== 'undefined') {
  window.backendHealthMonitor = backendHealthMonitor;
}

export { backendHealthMonitor };