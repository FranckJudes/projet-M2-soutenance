import axios from 'axios';
import { getToken } from '../utils/auth';

// Configuration de base pour axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8200';

// Création d'une instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service pour l'analyse des processus BPMN
const BpmnAnalyticsService = {
  // Récupérer tous les logs d'événements
  getAllEventLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.processDefinitionId) params.append('processDefinitionId', filters.processDefinitionId);
      if (filters.userId) params.append('userId', filters.userId);
      
      const response = await apiClient.get(`/api/bpmn/analytics/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      throw error;
    }
  },
  
  // Récupérer toutes les définitions de processus
  getProcessDefinitions: async () => {
    try {
      const response = await apiClient.get('/api/bpmn/analytics/process-definitions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des définitions de processus:', error);
      throw error;
    }
  },
  
  // Récupérer les métriques d'un processus
  getProcessMetrics: async (processDefinitionId, timeframe = 'all') => {
    try {
      const response = await apiClient.get(`/api/bpmn/analytics/metrics/${processDefinitionId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  },
  
  // Récupérer les données pour la carte du processus
  getProcessMapData: async (processDefinitionId, options = {}) => {
    try {
      const response = await apiClient.get(`/api/bpmn/analytics/process-map/${processDefinitionId}`, {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de la carte du processus:', error);
      throw error;
    }
  },
  
  // Exporter les logs au format CSV
  exportLogsAsCsv: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.processDefinitionId) params.append('processDefinitionId', filters.processDefinitionId);
    if (filters.userId) params.append('userId', filters.userId);
    
    return `${API_URL}/api/bpmn/analytics/export/csv?${params.toString()}`;
  },
  
  // Récupérer les prédictions de durée pour les processus en cours
  getProcessPredictions: async (processInstanceId) => {
    try {
      const response = await apiClient.get(`/api/bpmn/analytics/predictions/${processInstanceId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des prédictions:', error);
      throw error;
    }
  },
  
  // Récupérer les goulots d'étranglement dans les processus
  getProcessBottlenecks: async (processDefinitionId) => {
    try {
      const response = await apiClient.get(`/api/bpmn/analytics/bottlenecks/${processDefinitionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des goulots d\'étranglement:', error);
      throw error;
    }
  },
  
  // Récupérer les alertes pour les tâches qui prennent trop de temps
  getTaskAlerts: async (threshold = 'auto') => {
    try {
      const response = await apiClient.get('/api/bpmn/analytics/alerts', {
        params: { threshold }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },
  
  // Exécuter une analyse avancée avec PM4Py
  runPm4pyAnalysis: async (processDefinitionId, analysisType, options = {}) => {
    try {
      const response = await apiClient.post('/api/bpmn/analytics/pm4py', {
        processDefinitionId,
        analysisType,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'analyse PM4Py:', error);
      throw error;
    }
  }
};

export default BpmnAnalyticsService;
