import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class DefaultPasswordService {
    getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
      }
    getAllDefaultPasswords() {
        return axios.get(`${API_URL}/api/default-passwords`, {
            headers: this.getAuthHeaders()
          });
    }

    getDefaultPassword(id) {
        return axios.get(`${API_URL}/api/default-passwords/${id}`, {
            headers: this.getAuthHeaders()
          });
    }

    getActiveDefaultPassword() {
        return axios.get(`${API_URL}/api/default-passwords/active`, {
            headers: this.getAuthHeaders()
          });
    }

    createDefaultPassword(passwordData) {
        return axios.post(`${API_URL}/api/default-passwords`, passwordData, {
            headers: this.getAuthHeaders()
          });
    }

    updateDefaultPassword(id, passwordData) {
        return axios.put(`${API_URL}/api/default-passwords/${id}`, passwordData, {
            headers: this.getAuthHeaders()
          });
    }

    deleteDefaultPassword(id) {
        return axios.delete(`${API_URL}/api/default-passwords/${id}`, {
            headers: this.getAuthHeaders()
          });
    }

    activateDefaultPassword(id) {
        return axios.put(`${API_URL}/api/default-passwords/${id}/activate`, {
            headers: this.getAuthHeaders()
          });
    }
}

export default new DefaultPasswordService();
