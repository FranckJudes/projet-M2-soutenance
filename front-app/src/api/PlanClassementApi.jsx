import axios from 'axios';
import API_URL from '../config/urls';

// Récupérer toutes les PlanClassement
export const getAllPlanClassement = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(`${API_URL.BPMN}/plan-classements`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Créer une nouveau plan-classements
export const createPlanClassement = async (data) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post(`${API_URL.BPMN}/plan-classements`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ?  error.response.data :  error;
    }
};

// Mettre à jour un plan-classements existante
export const updatePlanClassement = async (id, data) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.put(`${API_URL.BPMN}/plan-classements/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Supprimer un plan-classements
export const deletePlanClassement = async (id) => {
    try {
        const response = await axios.delete(`${API_URL.BPMN}/plan-classements/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};