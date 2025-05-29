import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class UserService {
    getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    getAllUsers() {
        return axios.get(`${API_URL}/api/users`, {
            headers: this.getAuthHeaders()
        });
    }

    getUserById(id) {
        return axios.get(`${API_URL}/api/users/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    createUser(userData) {
        return axios.post(`${API_URL}/api/users`, userData, {
            headers: this.getAuthHeaders()
        });
    }

    updateUser(id, userData) {
        return axios.put(`${API_URL}/api/users/${id}`, userData, {
            headers: this.getAuthHeaders()
        });
    }

    deleteUser(id) {
        return axios.delete(`${API_URL}/api/users/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    // Méthodes supplémentaires selon les besoins
    getUsersByRole(role) {
        return axios.get(`${API_URL}/api/users/role/${role}`, {
            headers: this.getAuthHeaders()
        });
    }

    changeUserStatus(id, status) {
        return axios.put(`${API_URL}/api/users/${id}/status`, { status }, {
            headers: this.getAuthHeaders()
        });
    }

    resetUserPassword(id) {
        return axios.post(`${API_URL}/api/users/${id}/reset-password`, {}, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new UserService();