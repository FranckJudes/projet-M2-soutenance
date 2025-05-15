import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

/**
 * Service pour interagir avec les API de processus du backend
 */
class ProcessService {
  /**
   * Récupère la liste des instances de processus
   * @param {Object} params - Paramètres de pagination et filtrage
   * @returns {Promise} - Promise contenant les données de réponse
   */
  getProcesses(params = {}) {
    return axios.get(`${API_URL}/processes`, { params });
  }

  /**
   * Récupère les détails d'une instance de processus
   * @param {string} id - ID de l'instance de processus
   * @returns {Promise} - Promise contenant les données de réponse
   */
  getProcessById(id) {
    return axios.get(`${API_URL}/processes/${id}`);
  }

  /**
   * Démarre une nouvelle instance de processus
   * @param {Object} processData - Données pour démarrer le processus
   * @returns {Promise} - Promise contenant les données de réponse
   */
  startProcess(processData) {
    return axios.post(`${API_URL}/processes`, processData);
  }

  /**
   * Termine une instance de processus
   * @param {string} id - ID de l'instance de processus
   * @param {Object} data - Données pour terminer le processus
   * @returns {Promise} - Promise contenant les données de réponse
   */
  terminateProcess(id, data) {
    return axios.put(`${API_URL}/processes/${id}/terminate`, data);
  }

  /**
   * Récupère les tâches d'une instance de processus
   * @param {string} id - ID de l'instance de processus
   * @returns {Promise} - Promise contenant les données de réponse
   */
  getProcessTasks(id) {
    return axios.get(`${API_URL}/processes/${id}/tasks`);
  }

  /**
   * Récupère les définitions de processus disponibles
   * @returns {Promise} - Promise contenant les données de réponse
   */
  getProcessDefinitions() {
    return axios.get(`${API_URL}/process-definitions`);
  }

  /**
   * Récupère les statistiques d'un processus
   * @param {string} id - ID de l'instance de processus
   * @returns {Promise} - Promise contenant les données de réponse
   */
  getProcessStatistics(id) {
    return axios.get(`${API_URL}/processes/${id}/statistics`);
  }

  /**
   * Récupère l'historique d'exécution d'un processus
   * @param {string} id - ID de l'instance de processus
   * @returns {Promise} - Promise contenant les données de réponse
   */
  getProcessExecutionHistory(id) {
    return axios.get(`${API_URL}/processes/${id}/history`);
  }
}

export default new ProcessService();
