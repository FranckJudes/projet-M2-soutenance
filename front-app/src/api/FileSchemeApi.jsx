import axios from 'axios';
import API_URL from '../config/urls';

// Récupérer tous les FileScheme
export const getAllFileSchemes = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(`${API_URL.BPMN}/api/file-schemes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Créer un nouveau file-scheme
export const createFileScheme = async (data) => {
    const token = localStorage.getItem("token");
    try {
        // S'assurer que les données sont dans le bon format
        console.log('Données envoyées au backend:', JSON.stringify(data));
        
        // Créer un objet propre avec uniquement les champs attendus par le backend
        const cleanData = {
            "label": data.name || "",
            "description": data.description || "",
            "parentId": data.parentId || null,
            "colorSeries": data.colorSeries || "#3498db",
            "iconSeries": data.isDirectory ? "folder" : "file",
            "type": data.type || "1",
            "planId": data.planId || null,
            "documentId": data.documentId || null,
            "workflowId": data.workflowId || null
        };
        
        // Convertir en JSON valide
        const jsonData = JSON.stringify(cleanData);
        console.log('JSON envoyé:', jsonData);
        
        const response = await axios.post(`${API_URL.BPMN}/api/file-schemes`, jsonData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du file scheme:', error);
        throw error.response ? error.response.data : error;
    }
};

// Mettre à jour un file-scheme existant
export const updateFileScheme = async (id, data) => {
    const token = localStorage.getItem("token");
    try {
        // S'assurer que les données sont dans le bon format
        console.log('Données de mise à jour envoyées au backend:', JSON.stringify(data));
        
        // Créer un objet propre avec uniquement les champs attendus par le backend
        const cleanData = {
            "label": data.name || "",
            "description": data.description || "",
            "parentId": data.parentId || null,
            "colorSeries": data.colorSeries || "#3498db",
            "iconSeries": data.isDirectory ? "folder" : "file",
            "type": data.type || "1",
            "planId": data.planId || null,
            "documentId": data.documentId || null,
            "workflowId": data.workflowId || null
        };
        
        // Convertir en JSON valide
        const jsonData = JSON.stringify(cleanData);
        console.log('JSON de mise à jour envoyé:', jsonData);
        
        const response = await axios.put(`${API_URL.BPMN}/api/file-schemes/${id}`, jsonData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du file scheme:', error);
        throw error.response ? error.response.data : error;
    }
};

// Supprimer un file-scheme
export const deleteFileScheme = async (id) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.delete(`${API_URL.BPMN}/api/file-schemes/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression du file scheme:', error);
        throw error.response ? error.response.data : error;
    }
};
