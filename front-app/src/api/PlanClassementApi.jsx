import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL_API;

// Récupérer toutes les PlanClassement
export const getAllPlanClassement = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/plan-classements`);
        return response.data
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Créer une nouveau plan-classements
export const createPlanClassement = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/plan-classements`, data);
        return response.data;
    } catch (error) {
        throw error.response ?  error.response.data :  error;
    }
};

// Mettre à jour un plan-classements existante
export const updatePlanClassement = async (id, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/plan-classements/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Supprimer un plan-classements
export const deletePlanClassement = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/plan-classements/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};