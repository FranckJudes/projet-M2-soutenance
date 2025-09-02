import axios from 'axios';
const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';


const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getAllPlanClassement = async () => {
    try {
        const response = await axios.get(`${API_URL}/plan-classements`, {
            headers: getAuthHeaders()
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching plan classement:', error);
        throw error;
    }
};

export const createPlanClassement = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/plan-classements`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating plan classement:', error);
        throw error;
    }
};

export const updatePlanClassement = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/plan-classements/${id}`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating plan classement:', error);
        throw error;
    }
};

export const deletePlanClassement = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/plan-classements/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting plan classement:', error);
        throw error;
    }
};

export const getChildrenByParentId = async (parentId) => {
    try {
        const response = await axios.get(`${API_URL}/plan-classements/children/${parentId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching children:', error);
        throw error;
    }
};
