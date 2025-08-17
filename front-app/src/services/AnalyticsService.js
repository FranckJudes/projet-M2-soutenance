import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

// Configuration d'axios avec intercepteur pour l'authentification
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
  (response) => {
    // Extraire les données de la réponse API standardisée
    if (response.data && response.data.success && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion si non autorisé
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Service pour les analytics BPMN
 */
export const AnalyticsService = {
  // Endpoints pour les données de base
  
  /**
   * Récupérer tous les logs d'événements
   */
  getAllEventLogs: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get('/api/analytics/logs', { params });
    return response.data;
  },

  /**
   * Récupérer les définitions de processus
   */
  getProcessDefinitions: async () => {
    const response = await apiClient.get('/api/analytics/process-definitions');
    return response.data;
  },

  /**
   * Récupérer les métriques d'un processus spécifique
   */
  getProcessMetrics: async (processDefinitionId) => {
    const response = await apiClient.get(`/api/analytics/metrics/${processDefinitionId}`);
    return response.data;
  },

  /**
   * Récupérer les données de carte de processus
   */
  getProcessMapData: async (processDefinitionId) => {
    const response = await apiClient.get(`/api/analytics/process-map/${processDefinitionId}`);
    return response.data;
  },

  /**
   * Récupérer les logs d'un processus spécifique
   */
  getProcessLogs: async (processDefinitionKey, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/api/analytics/process-logs/${processDefinitionKey}`, { params });
    return response.data;
  },

  // Endpoints pour les analyses avancées

  /**
   * Découverte de processus
   */
  processDiscovery: async (requestData) => {
    const response = await apiClient.post('/api/analytics/process-discovery', requestData);
    return response.data;
  },

  /**
   * Analyse des variantes de processus
   */
  processVariants: async (requestData) => {
    const response = await apiClient.post('/api/analytics/process-variants', requestData);
    return response.data;
  },

  /**
   * Analyse des goulots d'étranglement
   */
  bottleneckAnalysis: async (requestData) => {
    const response = await apiClient.post('/api/analytics/bottleneck-analysis', requestData);
    return response.data;
  },

  /**
   * Prédiction de performance
   */
  performancePrediction: async (requestData) => {
    const response = await apiClient.post('/api/analytics/performance-prediction', requestData);
    return response.data;
  },

  /**
   * Analyse de réseau social
   */
  socialNetworkAnalysis: async (requestData) => {
    const response = await apiClient.post('/api/analytics/social-network-analysis', requestData);
    return response.data;
  },

  // Utilitaires

  /**
   * Exporter les logs en CSV
   */
  exportLogsAsCsv: (processDefinitionId = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (processDefinitionId) params.append('processDefinitionId', processDefinitionId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const token = localStorage.getItem('token');
    const url = `${API_URL}/api/analytics/export/csv?${params.toString()}`;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'process_logs.csv');
    
    // Ajouter l'en-tête d'autorisation pour le téléchargement
    if (token) {
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading CSV:', error);
        throw error;
      });
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  /**
   * Obtenir l'URL d'export CSV (pour les composants CSVLink)
   */
  getCsvExportUrl: (processDefinitionId = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (processDefinitionId) params.append('processDefinitionId', processDefinitionId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return `${API_URL}/api/analytics/export/csv?${params.toString()}`;
  }
};

/**
 * Service pour les processus (depuis ProcessEngineController)
 */
export const ProcessService = {
  /**
   * Récupérer les processus actifs
   */
  getActiveProcesses: async () => {
    const response = await apiClient.get('/api/process-engine/processes');
    return response.data;
  },

  /**
   * Récupérer les tâches pour un utilisateur
   */
  getUserTasks: async (userId) => {
    const response = await apiClient.get(`/api/process-engine/tasks/user/${userId}`);
    return response.data;
  },

  /**
   * Récupérer les tâches pour un groupe
   */
  getGroupTasks: async (groupId) => {
    const response = await apiClient.get(`/api/process-engine/tasks/group/${groupId}`);
    return response.data;
  },

  /**
   * Récupérer les détails d'une tâche
   */
  getTaskDetails: async (taskId) => {
    const response = await apiClient.get(`/api/process-engine/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Compléter une tâche
   */
  completeTask: async (taskId, variables = {}) => {
    const response = await apiClient.post(`/api/process-engine/tasks/${taskId}/complete`, variables);
    return response.data;
  },

  /**
   * Déployer un processus
   */
  deployProcess: async (bpmnFile, configurations, deployToEngine = true) => {
    const formData = new FormData();
    formData.append('file', bpmnFile);
    formData.append('configurations', JSON.stringify(configurations));
    formData.append('deployToEngine', deployToEngine);

    const response = await apiClient.post('/api/process-engine/deploy', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default AnalyticsService;
