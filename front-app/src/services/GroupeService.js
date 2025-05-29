import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class GroupeService {
    getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    getAllGroups() {
        return axios.get(`${API_URL}/groupe`, {
            headers: this.getAuthHeaders()
        });
    }

    getGroupById(id) {
        return axios.get(`${API_URL}/groupe/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    createGroup(groupData) {
        return axios.post(`${API_URL}/groupe`, groupData, {
            headers: this.getAuthHeaders()
        });
    }

    updateGroup(id, groupData) {
        return axios.put(`${API_URL}/groupe/${id}`, groupData, {
            headers: this.getAuthHeaders()
        });
    }

    deleteGroup(id) {
        return axios.delete(`${API_URL}/groupe/${id}`, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new GroupeService();
