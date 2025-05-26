import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class TaskService {
  // Récupérer toutes les tâches assignées à un utilisateur
  async getUserTasks(userId) {
    try {
      const response = await axios.get(`${API_URL}/tasks/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  // Récupérer toutes les tâches d'une instance de workflow
  async getWorkflowTasks(instanceId) {
    try {
      const response = await axios.get(`${API_URL}/tasks/workflow/${instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow tasks:', error);
      throw error;
    }
  }

  // Récupérer une tâche par son ID
  async getTask(taskId) {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Compléter une tâche
  async completeTask(taskId, userId, variables = {}) {
    try {
      const response = await axios.post(
        `${API_URL}/tasks/${taskId}/complete?userId=${userId}`, 
        variables
      );
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  // Assigner une tâche à un utilisateur
  async assignTask(taskId, userId) {
    try {
      const response = await axios.post(`${API_URL}/tasks/${taskId}/assign/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }
}

// Créer une instance unique pour toute l'application
const taskService = new TaskService();
export default taskService;
