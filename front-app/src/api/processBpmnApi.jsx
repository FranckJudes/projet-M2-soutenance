import axios from 'axios';

// URL de base de l'API 
const BASE_URL = import.meta.env.VITE_BASE_URL_API;


/**
 * Fonction pour créer un ProcessBpmn
 * @param {Object} formData - Les données du formulaire (FormData)
 * @returns {Promise} - La réponse de l'API
 */
export const createProcessBpmn = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/processbpmns`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

/**
 * Autres fonctions API pour ProcessBpmn (exemple)
 */

// Liste tous les ProcessBpmns
export const getAllProcessBpmns = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/processbpmns`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Obtenir un ProcessBpmn par ID
export const getProcessBpmnById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/processbpmns/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Mettre à jour un ProcessBpmn
export const updateProcessBpmn = async (id, formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/processbpmns/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            method: 'PUT',
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Supprimer un ProcessBpmn
export const deleteProcessBpmn = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/processbpmns/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
