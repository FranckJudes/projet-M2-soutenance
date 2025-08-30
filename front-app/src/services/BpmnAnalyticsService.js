import axios from 'axios';

// Configuration de base pour axios - utiliser le backend Spring Boot
const API_URL = import.meta.env.VITE_API_BASE_URL;


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
    const token = sessionStorage.getItem('token');
   
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer l'authentification et déballer ApiResponse si nécessaire
apiClient.interceptors.response.use(
  (response) => {
    // Vérifier si la réponse est wrappée dans ApiResponse
    if (response?.data && typeof response.data === 'object' && 
        'success' in response.data && response.data.success === true && 'data' in response.data) {
      // Déballer seulement si success = true
      return { ...response, data: response.data.data };
    }
    // Sinon retourner la réponse telle quelle
    return response;
  },
  (error) => {
 
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
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
      
      const response = await apiClient.get(`/api/analytics/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      throw error;
    }
  },
  
  // Méthode de test pour diagnostiquer la connectivité
  testConnection: async () => {
    try {
      const response = await apiClient.get('/api/analytics/test');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer toutes les définitions de processus
  getProcessDefinitions: async () => {
    try {
      const response = await apiClient.get('/api/analytics/process-definitions');
      
      const result = response.data || [];
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des définitions de processus:', error);
      throw error;
    }
  },
  
  // Récupérer les métriques d'un processus
  getProcessMetrics: async (processDefinitionId, timeframe = 'all') => {
    try {
      const response = await apiClient.get(`/api/analytics/metrics/${processDefinitionId}`, {
        params: { timeframe }
      });
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  },
  
  // Récupérer les données pour la carte du processus
  getProcessMapData: async (processDefinitionId, options = {}) => {
    try {
      const response = await apiClient.get(`/api/analytics/process-map/${processDefinitionId}`, {
        params: options
      });
      return response.data || {};
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
    
    return `${API_URL}/api/analytics/export/csv?${params.toString()}`;
  },
  
  // Récupérer les prédictions de durée pour les processus en cours
  getProcessPredictions: async (processInstanceId) => {
    try {
      const response = await apiClient.get(`/api/bpmn/analytics/predictions/${processInstanceId}`);
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des prédictions:', error);
      throw error;
    }
  },
  
  // Récupérer les goulots d'étranglement dans les processus
  getProcessBottlenecks: async (processDefinitionId) => {
    try {
      const response = await apiClient.get(`/api/bpmn/analytics/bottlenecks/${processDefinitionId}`);
      return response.data || [];
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
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },
  
  // Exécuter une analyse avancée avec PM4Py
  runPm4pyAnalysis: async (processDefinitionId, analysisType, options = {}) => {
    try {
      const response = await apiClient.post('/api/pm4py/analyze', {
        processDefinitionId,
        analysisType,
        options
      });
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de l\'analyse PM4Py:', error);
      throw error;
    }
  },

  // === NOUVELLES MÉTHODES POUR LES ANALYTICS INTÉGRÉS ===

  // Découverte de processus
  processDiscovery: async (logs, algorithm = 'alpha') => {
    try {
      const response = await apiClient.post('/api/analytics/process-discovery', {
        logs,
        algorithm
      });
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de la découverte de processus:', error);
      throw error;
    }
  },

  // Analyse des variantes de processus
  processVariants: async (logs, maxVariants = 10) => {
    try {
      const response = await apiClient.post('/api/analytics/process-variants', {
        logs,
        maxVariants
      });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de l\'analyse des variantes:', error);
      throw error;
    }
  },

  // Analyse des goulots d'étranglement
  bottleneckAnalysis: async (logs, analysisType = 'waiting_time') => {
    try {
      const response = await apiClient.post('/api/analytics/bottleneck-analysis', {
        logs,
        analysisType
      });
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de l\'analyse des goulots d\'étranglement:', error);
      throw error;
    }
  },

  // Prédiction de performance
  performancePrediction: async (logs, predictionType = 'completion_time', parameters = {}) => {
    try {
      const response = await apiClient.post('/api/analytics/performance-prediction', {
        logs,
        predictionType,
        parameters
      });
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de la prédiction de performance:', error);
      throw error;
    }
  },

  // Analyse de réseau social
  socialNetworkAnalysis: async (logs, analysisType = 'handover_of_work') => {
    try {
      const response = await apiClient.post('/api/analytics/social-network-analysis', {
        logs,
        analysisType
      });
      return response.data || {};
    } catch (error) {
      console.error('Erreur lors de l\'analyse de réseau social:', error);
      throw error;
    }
  },

  // Récupérer les logs de processus pour analytics
  getProcessLogsForAnalytics: async (processDefinitionKey, startDate = null, endDate = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiClient.get(`/api/analytics/process-logs/${processDefinitionKey}?${params.toString()}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des logs de processus:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  // Méthode utilitaire pour exécuter une analyse complète
  runCompleteAnalysis: async (processDefinitionKey, analysisTypes = ['process-discovery', 'process-variants', 'bottleneck-analysis']) => {
    try {
      // Récupérer les logs
      const logs = await BpmnAnalyticsService.getProcessLogsForAnalytics(processDefinitionKey);
      
      if (!logs || logs.length === 0) {
        throw new Error('Aucun log disponible pour l\'analyse');
      }

      const results = {};
      
      // Exécuter les analyses demandées
      for (const analysisType of analysisTypes) {
        switch (analysisType) {
          case 'process-discovery':
            results.processDiscovery = await BpmnAnalyticsService.processDiscovery(logs);
            break;
          case 'process-variants':
            results.processVariants = await BpmnAnalyticsService.processVariants(logs);
            break;
          case 'bottleneck-analysis':
            results.bottleneckAnalysis = await BpmnAnalyticsService.bottleneckAnalysis(logs);
            break;
          case 'performance-prediction':
            results.performancePrediction = await BpmnAnalyticsService.performancePrediction(logs);
            break;
          case 'social-network-analysis':
            results.socialNetworkAnalysis = await BpmnAnalyticsService.socialNetworkAnalysis(logs);
            break;
        }
      }
      
      return {
        success: true,
        data: results,
        logsCount: logs.length
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse complète:', error);
      throw error;
    }
  }
};

export default BpmnAnalyticsService;
