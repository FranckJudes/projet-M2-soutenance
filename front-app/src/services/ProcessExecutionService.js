import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

class ProcessExecutionService {
    
    /**
     * Démarre une nouvelle instance de processus
     */
    async startProcess(processDefinitionKey, variables = {}, businessKey = null) {
        try {
            const url = businessKey 
                ? `/api/process-execution/start/${processDefinitionKey}/business-key/${businessKey}`
                : `/api/process-execution/start/${processDefinitionKey}`;
                
            const response = await axios.post(`${API_BASE_URL}${url}`, {
                variables: variables
            });
            
            return response.data;
        } catch (error) {
            console.error('Erreur lors du démarrage du processus:', error);
            throw error;
        }
    }

    /**
     * Obtient les tâches assignées à l'utilisateur connecté
     */
    async getMyTasks() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks/my-tasks`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            throw error;
        }
    }

    /**
     * Obtient les tâches candidates pour l'utilisateur connecté
     */
    async getCandidateTasks() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks/candidate-tasks`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches candidates:', error);
            throw error;
        }
    }

    /**
     * Assigne une tâche à l'utilisateur connecté
     */
    async claimTask(taskId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tasks/${taskId}/claim`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'assignation de la tâche:', error);
            throw error;
        }
    }

    /**
     * Complète une tâche avec des variables
     */
    async completeTask(taskId, variables = {}) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
                variables: variables
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la completion de la tâche:', error);
            throw error;
        }
    }

    /**
     * Obtient les détails d'une tâche
     */
    async getTaskDetails(taskId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de la tâche:', error);
            throw error;
        }
    }

    /**
     * Obtient les instances de processus actives
     */
    async getActiveProcessInstances(processDefinitionKey = null) {
        try {
            const url = processDefinitionKey 
                ? `/api/process-execution/active-instances/${processDefinitionKey}`
                : `/api/process-execution/active-instances`;
                
            const response = await axios.get(`${API_BASE_URL}${url}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des instances:', error);
            throw error;
        }
    }

    /**
     * Arrête une instance de processus
     */
    async terminateProcessInstance(processInstanceId, reason) {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/process-execution/instances/${processInstanceId}`,
                { data: { reason } }
            );
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'arrêt de l\'instance:', error);
            throw error;
        }
    }

    /**
     * Réassigne une tâche à un autre utilisateur
     */
    async reassignTask(taskId, newAssigneeId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tasks/${taskId}/reassign`, {
                newAssigneeId: newAssigneeId
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la réassignation:', error);
            throw error;
        }
    }

    /**
     * Libère une tâche vers la pool
     */
    async releaseTask(taskId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tasks/${taskId}/release`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la libération de la tâche:', error);
            throw error;
        }
    }

    /**
     * Obtient l'historique d'une tâche
     */
    async getTaskHistory(taskId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/history`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            throw error;
        }
    }

    /**
     * Obtient les processus déployés et disponibles
     */
    async getAvailableProcesses() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/process-execution/available-processes`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des processus:', error);
            throw error;
        }
    }
}

export default new ProcessExecutionService();