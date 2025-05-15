import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL_API_GESTION_METADATA;

// Récupérer toutes les métadonnées
export const getAllMetadatas = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/metadonnees`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Créer une nouvelle métadonnée
export const createMetadata = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/metadonnees`, data);
        return response.data;
    } catch (error) {
        return error.response ?  error.response.data :  error;
    }
};

// Mettre à jour une métadonnée existante
export const updateMetadata = async (id, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/metadonnees/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Supprimer une métadonnée
export const deleteMetadata = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/metadonnees/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
