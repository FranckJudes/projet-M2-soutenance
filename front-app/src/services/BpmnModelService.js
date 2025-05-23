import axios from 'axios';

const API_URL = 'http://localhost:8200';

class BpmnModelService {
  /**
   * Sauvegarde un modèle BPMN avec ses configurations de tâches et les informations du processus
   * @param {Object} completeData - Les données complètes (XML, informations du processus)
   * @param {Object} taskConfigurations - Les configurations des tâches
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  saveBpmnModel(completeData, taskConfigurations) {
    const formData = new FormData();
    
    // Ajout du fichier BPMN
    if (completeData.xml) {
      const bpmnBlob = new Blob([completeData.xml], { type: 'application/xml' });
      formData.append('bpmnFile', bpmnBlob, 'process.bpmn');
    }
    
    // Ajout des informations du processus
    if (completeData.processInfo) {
      formData.append('processInfo', JSON.stringify(completeData.processInfo));
    }
    
    // Ajout de l'image si elle existe
    if (completeData.imageFormData) {
      const imageFile = completeData.imageFormData.get('image');
      if (imageFile) {
        formData.append('processImage', imageFile);
      }
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
   * Met à jour un modèle BPMN existant avec ses configurations de tâches et les informations du processus
   * @param {String} bpmnId - L'identifiant du modèle BPMN
   * @param {Object} completeData - Les données complètes (XML, informations du processus)
   * @param {Object} taskConfigurations - Les configurations des tâches
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  updateBpmnModel(bpmnId, completeData, taskConfigurations) {
    const formData = new FormData();
    
    // Ajout du fichier BPMN
    if (completeData.xml) {
      const bpmnBlob = new Blob([completeData.xml], { type: 'application/xml' });
      formData.append('bpmnFile', bpmnBlob, 'process.bpmn');
    }
    
    // Ajout des informations du processus
    if (completeData.processInfo) {
      formData.append('processInfo', JSON.stringify(completeData.processInfo));
    }
    
    // Ajout de l'image si elle existe
    if (completeData.imageFormData) {
      const imageFile = completeData.imageFormData.get('image');
      if (imageFile) {
        formData.append('processImage', imageFile);
      }
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
