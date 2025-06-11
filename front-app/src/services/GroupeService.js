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
    
    // Récupérer tous les utilisateurs d'un groupe
    getUsersInGroup(groupId) {
        return axios.get(`${API_URL}/groupe/${groupId}/users`, {
            headers: this.getAuthHeaders()
        });
    }
    
    // Récupérer tous les utilisateurs sans groupe
    getUsersWithoutGroup() {
        return axios.get(`${API_URL}/groupe/users/without-group`, {
            headers: this.getAuthHeaders()
        });
    }
    
    // Ajouter des utilisateurs à un groupe
    addUsersToGroup(groupId, userIds) {
        return axios.post(`${API_URL}/groupe/${groupId}/users`, userIds, {
            headers: this.getAuthHeaders()
        });
    }
    
    // Retirer un utilisateur d'un groupe
    removeUserFromGroup(groupId, userId) {
        return axios.delete(`${API_URL}/groupe/${groupId}/users/${userId}`, {
            headers: this.getAuthHeaders()
        });
    }
    
    // Créer un groupe avec des utilisateurs
    createGroupWithUsers(groupData, userIds) {
        const request = {
            groupId: null, // Nouveau groupe
            userIds: userIds
        };
        if (groupData) {
            request.name = groupData.name;
            request.description = groupData.description;
            request.type = groupData.type;
        }
        return axios.post(`${API_URL}/groupe/with-users`, request, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new GroupeService();
