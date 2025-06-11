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
    
    createEntite(entiteData) {
        return axios.post(`${API_URL}/api/entites-organisation`, entiteData, {
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
    }

    updateEntite(id, entiteData) {
        return axios.put(`${API_URL}/api/entites-organisation/${id}`, entiteData, {
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
    }

    deleteEntite(id) {
        return axios.delete(`${API_URL}/api/entites-organisation/${id}`, {
            headers: this.getAuthHeaders()
        });
    }
    
    getOrganigramme() {
        return axios.get(`${API_URL}/api/entites-organisation/organigramme`, {
            headers: this.getAuthHeaders()
        });
    }

    // User management methods
    getUsersByEntityId(entityId) {
        return axios.get(`${API_URL}/api/entites-organisation/${entityId}/users`, {
            headers: this.getAuthHeaders()
        });
    }

    getEntitiesByUserId(userId) {
        return axios.get(`${API_URL}/api/entites-organisation/user/${userId}`, {
            headers: this.getAuthHeaders()
        });
    }

    addUserToEntity(entityId, userId) {
        return axios.post(`${API_URL}/api/entites-organisation/${entityId}/users/${userId}`, {}, {
            headers: this.getAuthHeaders()
        });
    }

    removeUserFromEntity(entityId, userId) {
        return axios.delete(`${API_URL}/api/entites-organisation/${entityId}/users/${userId}`, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new EntiteOrganisationService();
