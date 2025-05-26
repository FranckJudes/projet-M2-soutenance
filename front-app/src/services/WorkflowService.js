import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class WorkflowService {
  // Démarrer un processus BPMN
  async startProcess(processName, userId, variables = {}) {
    try {
      const response = await axios.post(
        `${API_URL}/workflows/start?processName=${encodeURIComponent(processName)}&userId=${userId}`, 
        variables
      );
      return response.data;
    } catch (error) {
      console.error('Error starting process:', error);
      throw error;
    }
  }

  // Récupérer toutes les instances de workflow actives
  async getActiveWorkflowInstances() {
    try {
      const response = await axios.get(`${API_URL}/workflows/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active workflow instances:', error);
      throw error;
    }
  }
  
  // Récupérer les instances de workflow actives d'un utilisateur
  async getActiveInstances(userId) {
    try {
      const response = await axios.get(`${API_URL}/workflows/user/${userId}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user active workflow instances:', error);
      throw error;
    }
  }

  // Récupérer une instance de workflow par son ID
  async getWorkflowInstance(instanceId) {
    try {
      const response = await axios.get(`${API_URL}/workflows/${instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow instance:', error);
      throw error;
    }
  }
}

// Créer une instance unique pour toute l'application
const workflowService = new WorkflowService();
export default workflowService;
