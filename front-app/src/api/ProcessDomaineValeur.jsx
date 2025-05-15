import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL_API_GESTION_METADATA;

// Récupérer toutes les domaine
export const getAllDomaine = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/domaines`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Créer une nouvelle domaine
export const createDomaine = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/domaines`, data);
        return response.data;
    } catch (error) {
        throw error.response ?  error.response.data :  error;
    }
};

// Mettre à jour une domaine existante
export const updateDomaine = async (id, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/domaines/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Supprimer une Domaine
export const deleteDomaine = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/domaines/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
