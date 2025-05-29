import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

class BpmnModelService {

  getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
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
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeaders()
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
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeaders()
      }
    });
  }

  /**
   * Récupère un modèle BPMN avec ses configurations de tâches
   * @param {String} bpmnId - L'identifiant du modèle BPMN
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  getBpmnModel(bpmnId) {
    return axios.get(`${API_URL}/bpmn/${bpmnId}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  /**
   * Récupère tous les modèles BPMN
   * @returns {Promise} - Promesse avec la réponse de l'API contenant la liste des modèles BPMN
   */
  getAllBpmnModels() {
    return axios.get(`${API_URL}/bpmn/all`, {
      headers: this.getAuthHeaders()
    });
  }
  
  /**
   * Supprime un modèle BPMN
   * @param {String} bpmnId - L'identifiant du modèle BPMN à supprimer
   * @returns {Promise} - Promesse avec la réponse de l'API
   */
  deleteBpmnModel(bpmnId) {
    return axios.delete(`${API_URL}/bpmn/${bpmnId}`, {
      headers: this.getAuthHeaders()
    });
  }

    /**
       * Sauvegarde et déploie automatiquement un modèle BPMN
       */
    async saveBpmnModelAndDeploy(completeData, allTaskConfigurations) {
      try {
          // 1. Sauvegarder le modèle
          const saveResponse = await this.saveBpmnModel(completeData, allTaskConfigurations);
          
          // 2. Déployer automatiquement
          if (saveResponse.data && saveResponse.data.id) {
              const deployResponse = await this.deployBpmnModel(saveResponse.data.id);
              
              return {
                  ...saveResponse,
                  deployment: deployResponse.data
              };
          }
          
          return saveResponse;
      } catch (error) {
          console.error('Erreur lors de la sauvegarde et du déploiement:', error);
          throw error;
      }
  }

  /**
   * Met à jour et redéploie automatiquement un modèle BPMN
   */
  async updateBpmnModelAndDeploy(bpmnId, completeData, allTaskConfigurations) {
      try {
          // 1. Mettre à jour le modèle
          const updateResponse = await this.updateBpmnModel(bpmnId, completeData, allTaskConfigurations);
          
          // 2. Redéployer automatiquement
          const deployResponse = await this.deployBpmnModel(bpmnId);
          
          return {
              ...updateResponse,
              deployment: deployResponse.data
          };
      } catch (error) {
          console.error('Erreur lors de la mise à jour et du redéploiement:', error);
          throw error;
      }
  }

  /**
   * Déploie un modèle BPMN dans Camunda
   */
  async deployBpmnModel(bpmnId) {
      try {
          console.log(`Déploiement du modèle BPMN ID: ${bpmnId}`);
          
          const response = await axios.post(
              `${this.API_BASE_URL}/api/camunda/deploy/${bpmnId}`,
              {},
              {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${this.getAuthToken()}`
                  }
              }
          );
          
          console.log('Modèle déployé avec succès:', response.data);
          return response;
      } catch (error) {
          console.error('Erreur lors du déploiement:', error);
          throw error;
      }
  }

  /**
   * Obtient le statut de déploiement d'un modèle
   */
  async getDeploymentStatus(bpmnId) {
      try {
          const response = await axios.get(
              `${this.API_BASE_URL}/api/camunda/deployment-status/${bpmnId}`,
              {
                  headers: {
                      'Authorization': `Bearer ${this.getAuthToken()}`
                  }
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération du statut:', error);
          throw error;
      }
  }

  /**
   * Annule le déploiement d'un modèle
   */
  async undeployBpmnModel(bpmnId) {
      try {
          const response = await axios.delete(
              `${this.API_BASE_URL}/api/camunda/undeploy/${bpmnId}`,
              {
                  headers: {
                      'Authorization': `Bearer ${this.getAuthToken()}`
                  }
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de l\'annulation du déploiement:', error);
          throw error;
      }
  }

  /**
   * Obtient la liste des processus déployés
   */
  async getDeployedProcesses() {
      try {
          const response = await axios.get(
              `${this.API_BASE_URL}/api/camunda/deployed-processes`,
              {
                  headers: {
                      'Authorization': `Bearer ${this.getAuthToken()}`
                  }
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des processus déployés:', error);
          throw error;
      }
  }

  /**
   * Obtient les statistiques d'un processus déployé
   */
  async getProcessStatistics(processDefinitionKey) {
      try {
          const response = await axios.get(
              `${this.API_BASE_URL}/api/camunda/process-statistics/${processDefinitionKey}`,
              {
                  headers: {
                      'Authorization': `Bearer ${this.getAuthToken()}`
                  }
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des statistiques:', error);
          throw error;
      }
  }

  /**
   * Active/Désactive un processus déployé
   */
  async toggleProcessStatus(processDefinitionKey, activate = true) {
      try {
          const action = activate ? 'activate' : 'suspend';
          const response = await axios.post(
              `${this.API_BASE_URL}/api/camunda/process/${processDefinitionKey}/${action}`,
              {},
              {
                  headers: {
                      'Authorization': `Bearer ${this.getAuthToken()}`
                  }
              }
          );
          
          return response.data;
      } catch (error) {
          console.error(`Erreur lors de l'${activate ? 'activation' : 'suspension'}:`, error);
          throw error;
      }
  }

  // Méthode utilitaire pour obtenir le token d'authentification
  getAuthToken() {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
}

export default new BpmnModelService();
