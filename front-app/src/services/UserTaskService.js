import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class UserTaskService {
    getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Récupère les tâches assignées à l'utilisateur courant
     * @returns {Promise} Promise contenant les tâches de l'utilisateur
     */
    getCurrentUserTasks() {
        return axios.get(`${API_URL}/bpmn/my-tasks`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Récupère les tâches avec configuration pour l'utilisateur courant
     * @returns {Promise} Promise contenant les tâches avec configuration
     */
    getCurrentUserTasksWithConfig() {
        return axios.get(`${API_URL}/bpmn/my-tasks-with-config`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Récupère les tâches avec configuration pour l'utilisateur courant avec pagination
     * @param {number} firstResult - Index du premier résultat
     * @param {number} maxResults - Nombre maximum de résultats
     * @returns {Promise} Promise contenant les tâches paginées
     */
    getCurrentUserTasksWithConfigPaginated(firstResult = 0, maxResults = 10) {
        return axios.get(`${API_URL}/bpmn/my-tasks-with-config/paginated`, {
            params: { firstResult, maxResults },
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Récupère les tâches pour un utilisateur spécifique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} groupId - Identifiant du groupe (optionnel)
     * @returns {Promise} Promise contenant les tâches de l'utilisateur
     */
    getUserTasks(userId, groupId = null) {
        return axios.get(`${API_URL}/bpmn/tasks`, {
            params: { userId, groupId },
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Récupère les tâches avec configuration pour un utilisateur spécifique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} groupId - Identifiant du groupe (optionnel)
     * @returns {Promise} Promise contenant les tâches avec configuration
     */
    getUserTasksWithConfig(userId, groupId = null) {
        return axios.get(`${API_URL}/bpmn/tasks-with-config`, {
            params: { userId, groupId },
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Récupère les tâches améliorées pour un utilisateur spécifique
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise} Promise contenant les tâches améliorées
     */
    getUserTasksImproved(userId) {
        return axios.get(`${API_URL}/bpmn/tasks-improved`, {
            params: { userId },
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Complète une tâche BPMN
     * @param {string} taskId - Identifiant de la tâche
     * @param {Object} variables - Variables à passer (optionnel)
     * @returns {Promise} Promise contenant la réponse de l'API
     */
    completeTask(taskId, variables = {}) {
        return axios.post(`${API_URL}/bpmn/tasks/${taskId}/complete`, variables, {
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Récupère les commentaires d'une tâche
     * @param {string} taskId - Identifiant de la tâche
     * @returns {Promise} Promise contenant les commentaires
     */
    getTaskComments(taskId) {
        return axios.get(`${API_URL}/bpmn/tasks/${taskId}/comments`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Ajoute un commentaire à une tâche
     * @param {string} taskId - Identifiant de la tâche
     * @param {string} comment - Contenu du commentaire
     * @returns {Promise} Promise contenant la réponse de l'API
     */
    addTaskComment(taskId, comment) {
        return axios.post(`${API_URL}/bpmn/tasks/${taskId}/comments`, { message: comment }, {
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Récupère les détails d'une tâche spécifique avec sa configuration
     * @param {string} taskId - Identifiant de la tâche
     * @returns {Promise} Promise contenant les détails de la tâche
     */
    getTaskWithConfig(taskId) {
        return axios.get(`${API_URL}/bpmn/tasks/${taskId}/with-config`, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new UserTaskService();
