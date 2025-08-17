import axios from 'axios';
import API_URL from '../config/urls';

// Configuration de base pour les types de documents
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const DocumentTypeService = {
    
    /**
     * Obtenir tous les types de documents actifs
     * @returns {Promise} Liste des types de documents actifs
     */
    getAllActiveDocumentTypes: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des types de documents actifs:', error);
            throw error;
        }
    },

    /**
     * Obtenir tous les types de documents (actifs et inactifs)
     * @returns {Promise} Liste de tous les types de documents
     */
    getAllDocumentTypes: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types/all`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de tous les types de documents:', error);
            throw error;
        }
    },

    /**
     * Obtenir les types de documents simplifiés pour les sélections
     * @returns {Promise} Liste des types de documents simplifiés
     */
    getSimpleDocumentTypes: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types/simple`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des types de documents simplifiés:', error);
            throw error;
        }
    },

    /**
     * Obtenir un type de document par son ID
     * @param {number} id ID du type de document
     * @returns {Promise} Le type de document
     */
    getDocumentTypeById: async (id) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du type de document ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtenir un type de document par son code
     * @param {string} code Code du type de document
     * @returns {Promise} Le type de document
     */
    getDocumentTypeByCode: async (code) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types/code/${code}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du type de document par code ${code}:`, error);
            throw error;
        }
    },

    /**
     * Créer un nouveau type de document
     * @param {Object} documentTypeData Données du type de document
     * @returns {Promise} Le type de document créé
     */
    createDocumentType: async (documentTypeData) => {
        try {
            const response = await axios.post(`${API_URL.BPMN}/api/document-types`, documentTypeData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du type de document:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un type de document
     * @param {number} id ID du type de document
     * @param {Object} documentTypeData Nouvelles données du type de document
     * @returns {Promise} Le type de document mis à jour
     */
    updateDocumentType: async (id, documentTypeData) => {
        try {
            const response = await axios.put(`${API_URL.BPMN}/api/document-types/${id}`, documentTypeData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du type de document ${id}:`, error);
            throw error;
        }
    },

    /**
     * Supprimer un type de document
     * @param {number} id ID du type de document
     * @returns {Promise} Confirmation de suppression
     */
    deleteDocumentType: async (id) => {
        try {
            const response = await axios.delete(`${API_URL.BPMN}/api/document-types/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression du type de document ${id}:`, error);
            throw error;
        }
    },

    /**
     * Changer le statut d'activation d'un type de document
     * @param {number} id ID du type de document
     * @param {boolean} isActive Nouveau statut d'activation
     * @returns {Promise} Le type de document mis à jour
     */
    toggleDocumentTypeStatus: async (id, isActive) => {
        try {
            const response = await axios.patch(`${API_URL.BPMN}/api/document-types/${id}/status?isActive=${isActive}`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du changement de statut du type de document ${id}:`, error);
            throw error;
        }
    },

    /**
     * Rechercher des types de documents
     * @param {string} searchTerm Terme de recherche
     * @returns {Promise} Liste des types de documents correspondants
     */
    searchDocumentTypes: async (searchTerm) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la recherche de types de documents:', error);
            throw error;
        }
    },

    /**
     * Obtenir des types de documents par extension de fichier
     * @param {string} extension Extension de fichier
     * @returns {Promise} Liste des types de documents correspondants
     */
    getDocumentTypesByFileExtension: async (extension) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/document-types/extension/${extension}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des types de documents pour l'extension ${extension}:`, error);
            throw error;
        }
    },

    /**
     * Initialiser les types de documents par défaut
     * @returns {Promise} Confirmation d'initialisation
     */
    initializeDefaultDocumentTypes: async () => {
        try {
            const response = await axios.post(`${API_URL.BPMN}/api/document-types/initialize`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des types de documents par défaut:', error);
            throw error;
        }
    }
};

export default DocumentTypeService;
