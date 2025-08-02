import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

class ProcessEngineService {
  getHeaders() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  getMultipartHeaders() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'multipart/form-data'
    };
  }

  /**
   * Deploy a BPMN process with task configurations
   * @param {File} bpmnFile - The BPMN file to deploy
   * @param {Array} taskConfigurations - Array of task configuration objects
   * @param {boolean} deployToEngine - Whether to deploy to Camunda engine or just save metadata
   * @returns {Promise} - Process definition response
   */
  async deployProcess(bpmnFile, taskConfigurations, deployToEngine = true) {
    try {
      const formData = new FormData();
      formData.append('file', bpmnFile);
      formData.append('configurations', JSON.stringify(taskConfigurations));
      formData.append('deployToEngine', deployToEngine);

      console.log('Deploying BPMN process:', {
        fileName: bpmnFile.name,
        fileSize: bpmnFile.size,
        configurationsCount: taskConfigurations.length,
        deployToEngine: deployToEngine
      });

      const response = await axios.post(`${API_URL}/api/process-engine/deploy`, formData, {
        headers: this.getMultipartHeaders(),
      });

      console.log('Process deployed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deploying process:', error);
      throw error;
    }
  }

  /**
   * Start a process instance
   * @param {string} processDefinitionKey - The process definition key
   * @param {Object} variables - Process variables
   * @returns {Promise} - Process instance response
   */
  async startProcess(processDefinitionKey, variables = {}) {
    try {
      console.log('Starting process:', processDefinitionKey, 'with variables:', variables);

      const response = await axios.post(
        `${API_URL}/api/process-engine/start/${processDefinitionKey}`,
        variables,
        { headers: this.getHeaders() }
      );

      console.log('Process started successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting process:', error);
      throw error;
    }
  }

  /**
   * Get tasks assigned to current user
   * @returns {Promise} - User tasks response
   */
  async getMyTasks() {
    try {
      const response = await axios.get(`${API_URL}/api/process-engine/tasks/my-tasks`, {
        headers: this.getHeaders(),
      });

      console.log('Retrieved user tasks:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  /**
   * Get task details
   * @param {string} taskId - The task ID
   * @returns {Promise} - Task details response
   */
  async getTaskDetails(taskId) {
    try {
      const response = await axios.get(`${API_URL}/api/process-engine/tasks/${taskId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  }

  /**
   * Complete a task
   * @param {string} taskId - The task ID
   * @param {Object} variables - Task completion variables
   * @returns {Promise} - Task completion response
   */
  async completeTask(taskId, variables = {}) {
    try {
      console.log('Completing task:', taskId, 'with variables:', variables);

      const response = await axios.post(
        `${API_URL}/api/process-engine/tasks/${taskId}/complete`,
        variables,
        { headers: this.getHeaders() }
      );

      console.log('Task completed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Get active process instances
   * @returns {Promise} - Active processes response
   */
  async getActiveProcesses() {
    try {
      const response = await axios.get(`${API_URL}/api/process-engine/processes`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching active processes:', error);
      throw error;
    }
  }

  /**
   * Get process definition details
   * @param {string} processDefinitionKey - The process definition key
   * @returns {Promise} - Process definition response
   */
  async getProcessDefinition(processDefinitionKey) {
    try {
      const response = await axios.get(
        `${API_URL}/api/process-engine/definitions/${processDefinitionKey}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching process definition:', error);
      throw error;
    }
  }

  /**
   * Transform task configurations from frontend format to backend format
   * @param {Array} frontendConfigurations - Frontend task configurations
   * @returns {Array} - Backend formatted configurations
   */
  transformTaskConfigurations(frontendConfigurations) {
    // Log la structure complète des configurations pour débogage
    console.log('Structure complète des configurations:', JSON.stringify(frontendConfigurations, null, 2));
    
    // Récupérer l'ID utilisateur courant comme valeur par défaut
    const currentUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || 'admin';
    console.log('ID utilisateur courant pour assignation par défaut:', currentUserId);
    
    return frontendConfigurations.map(config => {
      // Log détaillé de chaque configuration
      console.log('Configuration de tâche:', {
        taskId: config.taskId,
        habilitation: config.habilitation
      });
      
      // Extraire directement les champs d'habilitation avec les bons noms
      const habilitationData = config.habilitation || {};
      
      // Déterminer les valeurs d'assignation avec garantie de non-null
      let assigneeUser = habilitationData.assignedUser;
      let assigneeGroup = habilitationData.assignedGroup;
      let assigneeEntity = habilitationData.assignedEntity;
      let assigneeType = habilitationData.assigneeType;
      
      // Vérifier si au moins un type d'assignation est présent
      if (!assigneeUser && !assigneeGroup && !assigneeEntity) {
        console.log(`Aucune assignation définie pour la tâche ${config.taskId}, utilisation de l'utilisateur courant par défaut`);
        assigneeUser = currentUserId;
        assigneeType = 'user';
      }
      
      // Créer la configuration backend avec les noms de champs corrects
      const backendConfig = {
        taskId: config.taskId,
        taskName: config.taskName,
        taskType: config.taskType || 'userTask',
        
        // Assignation - Mapper directement les champs avec les noms attendus par le backend
        // et garantir des valeurs non-nulles
        assigneeUser: assigneeUser,
        assigneeGroup: assigneeGroup,
        assigneeEntity: assigneeEntity,
        assigneeType: assigneeType,
        returnAllowed: habilitationData.returnAllowed || false,
        responsibleUser: habilitationData.responsibleUser || null,
        interestedUser: habilitationData.interestedUser || null,
      
        // Information générale
        board: config.information?.board,
        workInstructions: config.information?.workInstructions,
        expectedDeliverable: config.information?.expectedDeliverable,
        category: config.information?.category,
        
        // Planification
        allDay: config.planification?.allDay,
        durationValue: config.planification?.durationValue,
        durationUnit: config.planification?.durationUnit,
        criticality: config.planification?.criticality,
        priority: config.planification?.priority || 1,
        
        // Condition
        conditionConfig: config.condition?.conditionConfig || JSON.stringify({conditionVariables: []}),
        
        // KPIs et métriques
        viewHistoryEnabled: config.kpis?.viewHistoryEnabled,
        kpiTasksProcessed: config.kpis?.tasksProcessed,
        kpiReturnRate: config.kpis?.returnRate,
        kpiAvgInteractions: config.kpis?.avgInteractions,
        kpiDeadlineCompliance: config.kpis?.deadlineCompliance,
        kpiValidationWaitTime: config.kpis?.validationWaitTime,
        kpiPriorityCompliance: config.kpis?.priorityCompliance,
        kpiEmergencyManagement: config.kpis?.emergencyManagement,
        
        // Escalades et actions
        notifierSuperviseur: config.escalades?.notifierSuperviseur,
        reassignerTache: config.escalades?.reassignerTache,
        envoyerRappel: config.escalades?.envoyerRappel,
        escaladeHierarchique: config.escalades?.escaladeHierarchique,
        changementPriorite: config.escalades?.changementPriorite,
        bloquerWorkflow: config.escalades?.bloquerWorkflow,
        genererAlerteEquipe: config.escalades?.genererAlerteEquipe,
        demanderJustification: config.escalades?.demanderJustification,
        activerActionCorrective: config.escalades?.activerActionCorrective,
        escaladeExterne: config.escalades?.escaladeExterne,
        cloturerDefaut: config.escalades?.cloturerDefaut,
        suiviParKpi: config.escalades?.suiviParKpi,
        planBOuTacheAlternative: config.escalades?.planBOuTacheAlternative,
        
        // Pièces jointes et documents
        attachmentsEnabled: config.attachments?.enabled,
        attachmentType: config.attachments?.type,
        securityLevel: config.attachments?.securityLevel,
        externalTools: config.attachments?.externalTools,
        linkToOtherTask: config.attachments?.linkToOtherTask,
        scriptBusinessRule: config.attachments?.scriptBusinessRule,
        addFormResource: config.attachments?.addFormResource,
        archiveAttachment: config.attachments?.archiveAttachment,
        shareArchivePdf: config.attachments?.shareArchivePdf,
        describeFolderDoc: config.attachments?.describeFolderDoc,
        deleteAttachmentDoc: config.attachments?.deleteAttachmentDoc,
        consultAttachmentDoc: config.attachments?.consultAttachmentDoc,
        downloadZip: config.attachments?.downloadZip,
        importAttachment: config.attachments?.importAttachment,
        editAttachment: config.attachments?.editAttachment,
        annotateDocument: config.attachments?.annotateDocument,
        verifyAttachmentDoc: config.attachments?.verifyAttachmentDoc,
        searchInDocument: config.attachments?.searchInDocument,
        removeDocument: config.attachments?.removeDocument,
        addNewAttachment: config.attachments?.addNewAttachment,
        convertAttachmentPdf: config.attachments?.convertAttachmentPdf,
        downloadAttachmentPdf: config.attachments?.downloadAttachmentPdf,
        downloadOriginalFormat: config.attachments?.downloadOriginalFormat,
        
        // Notifications
        notifyOnCreation: config.notifications?.notifyOnCreation,
        notifyOnDeadline: config.notifications?.notifyOnDeadline,
        reminderBeforeDeadline: config.notifications?.reminderBeforeDeadline,
        notificationSensitivity: config.notifications?.sensitivity,
        notificationType: config.notifications?.type,
        selectedReminders: config.notifications?.selectedReminders ? 
          JSON.stringify(config.notifications.selectedReminders) : null,
        
        // Condition et extension
        extraConfig: config.extraConfig ? JSON.stringify(config.extraConfig) : null
      };
      
      // Log de la configuration transformée pour débogage
      console.log('Configuration transformée:', {
        taskId: backendConfig.taskId,
        assigneeUser: backendConfig.assigneeUser,
        assigneeGroup: backendConfig.assigneeGroup,
        assigneeEntity: backendConfig.assigneeEntity
      });
      
      return backendConfig;
    });
  }
}

// Créer une instance unique pour toute l'application
const processEngineService = new ProcessEngineService();
export default processEngineService;
