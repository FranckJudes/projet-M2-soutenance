import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class TypeEntiteService {
    getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    getAllTypeEntites() {
        return axios.get(`${API_URL}/api/type-entites`, {
            headers: this.getAuthHeaders()
        });
    }

    getTypeEntiteById(id) {
        return axios.get(`${API_URL}/api/type-entites/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    createTypeEntite(typeEntiteData) {
        return axios.post(`${API_URL}/api/type-entites`, typeEntiteData, {
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
    }

    updateTypeEntite(id, typeEntiteData) {
        return axios.put(`${API_URL}/api/type-entites/${id}`, typeEntiteData, {
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
    }

    deleteTypeEntite(id) {
        return axios.delete(`${API_URL}/api/type-entites/${id}`, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new TypeEntiteService();
