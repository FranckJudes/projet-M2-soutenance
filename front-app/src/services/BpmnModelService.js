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
      // Générer un ID de processus unique pour éviter les conflits
      let xmlContent = completeData.xml;
      const timestamp = new Date().getTime();
      const uniqueProcessId = `Process_${timestamp}`;
      
      // Remplacer l'ID du processus par défaut par un ID unique
      if (xmlContent.includes('id="Process_1"')) {
        xmlContent = xmlContent.replace('id="Process_1"', `id="${uniqueProcessId}"`);
        console.log(`ID de processus modifié en ${uniqueProcessId}`);
      } else if (xmlContent.includes('id="Process_')) {
        // Regex pour trouver les ID de processus existants
        const processIdRegex = /id="(Process_[^"]+)"/;
        const match = xmlContent.match(processIdRegex);
        if (match && match[1]) {
          xmlContent = xmlContent.replace(`id="${match[1]}"`, `id="${uniqueProcessId}"`);
          console.log(`ID de processus modifié de ${match[1]} en ${uniqueProcessId}`);
        }
      }
      
      const bpmnBlob = new Blob([xmlContent], { type: 'application/xml' });
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
       * Télécharge un modèle BPMN pour analyse sans sauvegarde
       * @param {FormData} formData - Le FormData contenant le fichier BPMN
       * @returns {Promise} - Promesse avec les éléments du processus
       */
    async uploadBpmnModel(formData) {
      try {
        const response = await axios.post(
          `${API_URL}/bpmn/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...this.getAuthHeaders()
            }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Erreur lors de l\'upload du modèle BPMN:', error);
        throw error;
      }
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
              `${API_URL}/bpmn/undeploy/${bpmnId}`,
              {
                  headers: this.getAuthHeaders()
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
          // Utiliser la route exacte du contrôleur backend
          const response = await axios.get(
              `${API_URL}/bpmn/deployed-processes`,
              {
                  headers: this.getAuthHeaders()
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
              `${API_URL}/bpmn/process-statistics/${processDefinitionKey}`,
              {
                  headers: this.getAuthHeaders()
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
              `${API_URL}/bpmn/process/${processDefinitionKey}/${action}`,
              {},
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error(`Erreur lors de l'${activate ? 'activation' : 'suspension'}:`, error);
          throw error;
      }
  }
  
  /**
   * Vérifie si un processus est déployé et actif
   * @param {String} processKey - La clé du processus à vérifier
   * @returns {Promise} - Promesse avec le statut du déploiement
   */
  async checkDeploymentStatus(processKey) {
      try {
          // Utiliser la route exacte du contrôleur backend
          const response = await axios.get(
              `${API_URL}/bpmn/check-deployment/${processKey}`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la vérification du déploiement:', error);
          throw error;
      }
  }
  
  /**
   * Démarre une instance d'un processus
   * @param {String} processKey - La clé du processus à démarrer
   * @returns {Promise} - Promesse avec les informations de l'instance démarrée
   */
  async startProcessInstance(processKey) {
      try {
          // Utiliser la route exacte du contrôleur backend
          const response = await axios.post(
              `${API_URL}/bpmn/start-process/${processKey}`,
              {},
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors du démarrage du processus:', error);
          throw error;
      }
  }

  // Méthode utilitaire pour obtenir le token d'authentification
  getAuthToken() {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  /**
   * Récupère les processus déployés par l'utilisateur actuel
   * @returns {Promise} - Liste des processus déployés par l'utilisateur
   */
  async getMyDeployedProcesses() {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/my-deployed-processes`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des processus déployés:', error);
          throw error;
      }
  }

  /**
   * Récupère les processus déployés avec informations détaillées par l'utilisateur actuel
   * @returns {Promise} - Liste des processus avec informations complètes
   */
  async getMyDeployedProcessesWithInfo() {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/deployed-processes-with-info`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des processus avec informations:', error);
          throw error;
      }
  }

  /**
   * Récupère les informations détaillées d'une définition de processus
   * @param {String} processDefinitionKey - Clé de la définition de processus
   * @returns {Promise} - Informations détaillées du processus
   */
  async getProcessDefinitionInfo(processDefinitionKey) {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/definitions/${processDefinitionKey}`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des informations du processus:', error);
          throw error;
      }
  }

  /**
   * Récupère les instances de processus de l'utilisateur actuel
   * @returns {Promise} - Liste des instances de processus de l'utilisateur
   */
  async getMyProcessInstances() {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/my-process-instances`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des instances de processus:', error);
          throw error;
      }
  }

  /**
   * Démarre une instance de processus via le ProcessEngine
   * @param {String} processDefinitionKey - Clé de la définition de processus
   * @param {Object} variables - Variables à passer au processus
   * @returns {Promise} - Informations de l'instance créée
   */
  async startProcessInstanceViaEngine(processDefinitionKey, variables = {}) {
      try {
          const response = await axios.post(
              `${API_URL}/process-engine/start/${processDefinitionKey}`,
              variables,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors du démarrage du processus via engine:', error);
          throw error;
      }
  }

  /**
   * Récupère les tâches assignées à l'utilisateur actuel
   * @returns {Promise} - Liste des tâches assignées
   */
  async getMyTasks() {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/tasks/my-tasks`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des tâches:', error);
          throw error;
      }
  }

  /**
   * Complète une tâche
   * @param {String} taskId - ID de la tâche
   * @param {Object} variables - Variables à passer lors de la complétion
   * @returns {Promise} - Confirmation de complétion
   */
  async completeTask(taskId, variables = {}) {
      try {
          const response = await axios.post(
              `${API_URL}/process-engine/tasks/${taskId}/complete`,
              variables,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la complétion de la tâche:', error);
          throw error;
      }
  }

  /**
   * Récupère les détails d'une tâche
   * @param {String} taskId - ID de la tâche
   * @returns {Promise} - Détails de la tâche
   */
  async getTaskDetails(taskId) {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/tasks/${taskId}`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des détails de la tâche:', error);
          throw error;
      }
  }

  /**
   * Récupère les processus actifs
   * @returns {Promise} - Liste des processus actifs
   */
  async getActiveProcesses() {
      try {
          const response = await axios.get(
              `${API_URL}/process-engine/processes`,
              {
                  headers: this.getAuthHeaders()
              }
          );
          
          return response.data;
      } catch (error) {
          console.error('Erreur lors de la récupération des processus actifs:', error);
          throw error;
      }
  }
}

export default new BpmnModelService();
