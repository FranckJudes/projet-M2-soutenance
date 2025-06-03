import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class EntiteOrganisationService {
    getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    getAllEntites() {
        return axios.get(`${API_URL}/api/entites-organisation`, {
            headers: this.getAuthHeaders()
        });
    }

    getEntiteById(id) {
        return axios.get(`${API_URL}/api/entites-organisation/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    getRootEntities() {
        return axios.get(`${API_URL}/api/entites-organisation/root`, {
            headers: this.getAuthHeaders()
        });
    }

    getChildEntities(parentId) {
        return axios.get(`${API_URL}/api/entites-organisation/parent/${parentId}`, {
            headers: this.getAuthHeaders()
        });
    }

    searchEntitesByName(name) {
        return axios.get(`${API_URL}/api/entites-organisation/search?name=${name}`, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new EntiteOrganisationService();
