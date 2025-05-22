import axios from 'axios';

const API_URL = 'http://localhost:8200/api';

class BpmnModelService {
  /**
   * Sauvegarde un modèle BPMN avec ses configurations de tâches
   * @param {Object} bpmnData - Les données du modèle BPMN (XML)
   * @param {Object} taskConfigurations - Les configurations des tâches
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  saveBpmnModel(bpmnData, taskConfigurations) {
    const formData = new FormData();
    
    // Ajout du fichier BPMN
    if (bpmnData.xml) {
      const bpmnBlob = new Blob([bpmnData.xml], { type: 'application/xml' });
      formData.append('bpmnFile', bpmnBlob, 'process.bpmn');
    }
    
    // Ajout des configurations de tâches
    formData.append('taskConfigurations', JSON.stringify(taskConfigurations));
    
    return axios.post(`${API_URL}/bpmn`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Met à jour un modèle BPMN existant avec ses configurations de tâches
   * @param {String} bpmnId - L'identifiant du modèle BPMN
   * @param {Object} bpmnData - Les données du modèle BPMN (XML)
   * @param {Object} taskConfigurations - Les configurations des tâches
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  updateBpmnModel(bpmnId, bpmnData, taskConfigurations) {
    const formData = new FormData();
    
    // Ajout du fichier BPMN
    if (bpmnData.xml) {
      const bpmnBlob = new Blob([bpmnData.xml], { type: 'application/xml' });
      formData.append('bpmnFile', bpmnBlob, 'process.bpmn');
    }
    
    // Ajout des configurations de tâches
    formData.append('taskConfigurations', JSON.stringify(taskConfigurations));
    
    return axios.put(`${API_URL}/bpmn/${bpmnId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Récupère un modèle BPMN avec ses configurations de tâches
   * @param {String} bpmnId - L'identifiant du modèle BPMN
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  getBpmnModel(bpmnId) {
    return axios.get(`${API_URL}/bpmn/${bpmnId}`);
  }
  
  /**
   * Récupère tous les modèles BPMN
   * @returns {Promise} - Promesse avec la réponse de l'API contenant la liste des modèles BPMN
   */
  getAllBpmnModels() {
    return axios.get(`${API_URL}/bpmn/all`);
  }
  
  /**
   * Supprime un modèle BPMN
   * @param {String} bpmnId - L'identifiant du modèle BPMN à supprimer
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  deleteBpmnModel(bpmnId) {
    return axios.delete(`${API_URL}/bpmn/${bpmnId}`);
  }
}

export default new BpmnModelService();
