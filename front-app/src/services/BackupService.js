import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class BackupService {
    /**
     * Get all backups
     * @returns {Promise} Promise object representing the API response
     */
    getBackups() {
        return axios.get(`${API_URL}/api/backups`);
    }

    /**
     * Create a new backup
     * @returns {Promise} Promise object representing the API response
     */
    createBackup() {
        return axios.post(`${API_URL}/api/backups`);
    }

    /**
     * Restore a backup by ID
     * @param {number} id - The backup ID
     * @returns {Promise} Promise object representing the API response
     */
    restoreBackup(id) {
        return axios.post(`${API_URL}/api/backups/${id}/restore`);
    }

    /**
     * Delete a backup by ID
     * @param {number} id - The backup ID
     * @returns {Promise} Promise object representing the API response
     */
    deleteBackup(id) {
        return axios.delete(`${API_URL}/api/backups/${id}`);
    }

    /**
     * Update backup configuration
     * @param {Object} config - The backup configuration
     * @returns {Promise} Promise object representing the API response
     */
    updateBackupConfig(config) {
        return axios.put(`${API_URL}/api/backups/config`, config);
    }

    /**
     * Get backup configuration
     * @returns {Promise} Promise object representing the API response
     */
    getBackupConfig() {
        return axios.get(`${API_URL}/api/backups/config`);
    }
}

export default new BackupService();
