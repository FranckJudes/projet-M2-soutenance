import axios from 'axios';
import API_URL from '../config/urls';

// Configuration de base pour les schémas de fichiers
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const FileSchemeApi = {
    
    /**
     * Obtenir tous les schémas de fichiers actifs
     * @returns {Promise} Liste des schémas actifs
     */
    getAllFileSchemes: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes`, {
                headers: getAuthHeaders()
            });
            console.log('FileSchemes récupérés:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des file schemes:', error);
            throw error;
        }
    },

    /**
     * Obtenir tous les schémas de fichiers (actifs et inactifs)
     * @returns {Promise} Liste de tous les schémas
     */
    getAllFileSchemesIncludeInactive: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/all`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de tous les file schemes:', error);
            throw error;
        }
    },

    /**
     * Obtenir l'arbre complet des schémas
     * @returns {Promise} Arbre des schémas
     */
    getFileSchemeTree: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/tree`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'arbre des file schemes:', error);
            throw error;
        }
    },

    /**
     * Obtenir un schéma de fichier par ID
     * @param {number} id ID du schéma
     * @returns {Promise} Le schéma de fichier
     */
    getFileSchemeById: async (id) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du file scheme ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtenir les enfants d'un schéma parent
     * @param {number} parentId ID du parent
     * @returns {Promise} Liste des enfants
     */
    getChildrenByParentId: async (parentId) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/${parentId}/children`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des enfants du parent ${parentId}:`, error);
            throw error;
        }
    },

    /**
     * Créer un nouveau schéma de fichier
     * @param {Object} data Données du schéma
     * @returns {Promise} Le schéma créé
     */
    createFileScheme: async (data) => {
        try {
            console.log('Données envoyées au backend:', data);
            
            // Adapter les données au format attendu par le backend
            const fileSchemeData = {
                label: data.name || data.label || '',
                description: data.description || '',
                parentId: data.parentId || null,
                colorSeries: data.colorSeries || '#3498db',
                iconSeries: data.iconSeries || (data.isDirectory ? 'folder' : 'file'),
                type: data.type || '1',
                documentTypeId: data.documentTypeId || null,
                planId: data.planId || null,
                documentId: data.documentId || null,
                workflowId: data.workflowId || null,
                isDirectory: data.isDirectory !== undefined ? data.isDirectory : true,
                isActive: data.isActive !== undefined ? data.isActive : true,
                sortOrder: data.sortOrder || 0
            };
            
            console.log('Données formatées pour le backend:', fileSchemeData);
            
            const response = await axios.post(`${API_URL.BPMN}/api/file-schemes`, fileSchemeData, {
                headers: getAuthHeaders()
            });
            
            console.log('Réponse de création:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du file scheme:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un schéma de fichier existant
     * @param {number} id ID du schéma
     * @param {Object} data Nouvelles données du schéma
     * @returns {Promise} Le schéma mis à jour
     */
    updateFileScheme: async (id, data) => {
        try {
            console.log('Données de mise à jour envoyées au backend:', data);
            
            // Adapter les données au format attendu par le backend
            const fileSchemeData = {
                label: data.name || data.label || '',
                description: data.description || '',
                parentId: data.parentId || null,
                colorSeries: data.colorSeries || '#3498db',
                iconSeries: data.iconSeries || (data.isDirectory ? 'folder' : 'file'),
                type: data.type || '1',
                documentTypeId: data.documentTypeId || null,
                planId: data.planId || null,
                documentId: data.documentId || null,
                workflowId: data.workflowId || null,
                isDirectory: data.isDirectory !== undefined ? data.isDirectory : true,
                isActive: data.isActive !== undefined ? data.isActive : true,
                sortOrder: data.sortOrder || 0
            };
            
            console.log('Données formatées pour mise à jour:', fileSchemeData);
            
            const response = await axios.put(`${API_URL.BPMN}/api/file-schemes/${id}`, fileSchemeData, {
                headers: getAuthHeaders()
            });
            
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du file scheme ${id}:`, error);
            throw error;
        }
    },

    /**
     * Supprimer un schéma de fichier
     * @param {number} id ID du schéma
     * @returns {Promise} Confirmation de suppression
     */
    deleteFileScheme: async (id) => {
        try {
            const response = await axios.delete(`${API_URL.BPMN}/api/file-schemes/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression du file scheme ${id}:`, error);
            throw error;
        }
    },

    /**
     * Changer le statut d'un schéma
     * @param {number} id ID du schéma
     * @param {boolean} isActive Nouveau statut
     * @returns {Promise} Le schéma mis à jour
     */
    toggleFileSchemeStatus: async (id, isActive) => {
        try {
            const response = await axios.patch(`${API_URL.BPMN}/api/file-schemes/${id}/status?isActive=${isActive}`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du changement de statut du file scheme ${id}:`, error);
            throw error;
        }
    },

    /**
     * Rechercher des schémas
     * @param {string} searchTerm Terme de recherche
     * @returns {Promise} Liste des schémas correspondants
     */
    searchFileSchemes: async (searchTerm) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la recherche de file schemes:', error);
            throw error;
        }
    },

    /**
     * Obtenir tous les dossiers
     * @returns {Promise} Liste des dossiers
     */
    getAllDirectories: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/directories`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des dossiers:', error);
            throw error;
        }
    },

    /**
     * Obtenir tous les fichiers
     * @returns {Promise} Liste des fichiers
     */
    getAllFiles: async () => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/files`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des fichiers:', error);
            throw error;
        }
    },

    /**
     * Obtenir les schémas par type de document
     * @param {number} documentTypeId ID du type de document
     * @returns {Promise} Liste des schémas correspondants
     */
    getFileSchemesByDocumentType: async (documentTypeId) => {
        try {
            const response = await axios.get(`${API_URL.BPMN}/api/file-schemes/by-document-type/${documentTypeId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des file schemes pour le type de document ${documentTypeId}:`, error);
            throw error;
        }
    },

    /**
     * Nettoyer les schémas orphelins
     * @returns {Promise} Nombre de schémas nettoyés
     */
    cleanupOrphanedSchemes: async () => {
        try {
            const response = await axios.post(`${API_URL.BPMN}/api/file-schemes/cleanup-orphaned`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors du nettoyage des schémas orphelins:', error);
            throw error;
        }
    },

    /**
     * Initialiser les schémas par défaut
     * @returns {Promise} Confirmation d'initialisation
     */
    initializeDefaultFileSchemes: async () => {
        try {
            const response = await axios.post(`${API_URL.BPMN}/api/file-schemes/initialize`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des schémas par défaut:', error);
            throw error;
        }
    }
};

// Export nommés pour compatibilité avec les imports existants
export const {
  getAllFileSchemes,
  getAllFileSchemesIncludeInactive,
  getFileSchemeTree,
  getFileSchemeById,
  getChildrenByParentId,
  createFileScheme,
  updateFileScheme,
  deleteFileScheme,
  toggleFileSchemeStatus,
  searchFileSchemes,
  getAllDirectories,
  getAllFiles,
  getFileSchemesByDocumentType,
  cleanupOrphanedSchemes,
  initializeDefaultFileSchemes,
} = FileSchemeApi;

// Export par défaut pour usage alternatif
export default FileSchemeApi;
