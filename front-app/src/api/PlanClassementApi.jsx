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
        // S'assurer que les données sont dans le bon format
        console.log('Données envoyées au backend:', JSON.stringify(data));
        
        // Créer un objet propre avec uniquement les champs attendus par le backend
        const cleanData = {
            "codePlanClassement": data.codePlanClassement || "",
            "libellePlanClassement": data.libellePlanClassement || "",
            "descriptionPlanClassement": data.descriptionPlanClassement || "",
            "parentId": data.parentId || null,
            "numeroOrdre": data.numeroOrdre || 1
        };
        
        // Convertir en JSON valide
        const jsonData = JSON.stringify(cleanData);
        console.log('JSON envoyé:', jsonData);
        
        const response = await axios.post(`${API_URL.BPMN}/plan-classements`, jsonData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du plan de classement:', error);
        throw error.response ?  error.response.data :  error;
    }
};

// Mettre à jour un plan-classements existante
export const updatePlanClassement = async (id, data) => {
    const token = localStorage.getItem("token");
    try {
        // S'assurer que les données sont dans le bon format
        console.log('Données de mise à jour envoyées au backend:', JSON.stringify(data));
        
        // Créer un objet propre avec uniquement les champs attendus par le backend
        const cleanData = {
            "codePlanClassement": data.codePlanClassement || "",
            "libellePlanClassement": data.libellePlanClassement || "",
            "descriptionPlanClassement": data.descriptionPlanClassement || "",
            "parentId": data.parentId || null,
            "numeroOrdre": data.numeroOrdre || 1
        };
        
        // Convertir en JSON valide
        const jsonData = JSON.stringify(cleanData);
        console.log('JSON de mise à jour envoyé:', jsonData);
        
        const response = await axios.put(`${API_URL.BPMN}/plan-classements/${id}`, jsonData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du plan de classement:', error);
        throw error.response ? error.response.data : error;
    }
};

// Supprimer un plan-classements
export const deletePlanClassement = async (id) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.delete(`${API_URL.BPMN}/plan-classements/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};