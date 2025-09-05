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
   * Deploy a BPMN process with task configurations and general metadata
   * @param {File} bpmnFile - The BPMN file to deploy
   * @param {Array} taskConfigurations - Array of task configuration objects
   * @param {Object} processMetadata - General process metadata (name, description, tags, images)
   * @param {boolean} deployToEngine - Whether to deploy to Camunda engine or just save metadata
   * @returns {Promise} - Process definition response
   */
  async deployProcess(bpmnFile, taskConfigurations, processMetadata = null, deployToEngine = true, forceCreate = false) {
    try {
      const formData = new FormData();
      formData.append('file', bpmnFile);
      formData.append('configurations', JSON.stringify(taskConfigurations));
      formData.append('deployToEngine', deployToEngine);
      formData.append('forceCreate', forceCreate);
      if (processMetadata) {
        formData.append('metadata', JSON.stringify(processMetadata));
      }

      const response = await axios.post(`${API_URL}/api/process-engine/deploy`, formData, {
        headers: this.getMultipartHeaders(),
      });

      return response.data;
    } catch (error) {
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
   * Get process image by path
   * @param {string} processKey - The process key
   * @param {string} fileName - The image file name
   * @returns {Promise} - Image URL or blob response
   */
  async getProcessImage(processKey, fileName) {
    try {
      const response = await axios.get(`${API_URL}/api/process-images/${processKey}/${fileName}`, {
        responseType: 'blob', // Pour récupérer l'image comme blob
        headers: this.getHeaders(),
      });

      // Créer une URL pour l'image blob
      const imageUrl = URL.createObjectURL(response.data);
      return imageUrl;
    } catch (error) {
      console.error('Error fetching process image:', error);
      throw error;
    }
  }
  transformTaskConfigurations(frontendConfigurations) {
    // Log la structure complète des configurations pour débogage
    console.log('Structure complète des configurations:', JSON.stringify(frontendConfigurations, null, 2));

    

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

      // Si le type est manquant mais qu'une assignation existe, le déduire
      if (!assigneeType) {
        if (assigneeUser) assigneeType = 'user';
        else if (assigneeGroup) assigneeType = 'group';
        else if (assigneeEntity) assigneeType = 'entity';
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

        // Planification - CORRECTION: Utiliser les bons noms de propriétés
        allDay: config.planification?.allDay,
        durationValue: config.planification?.durationValue,
        durationUnit: config.planification?.durationUnit,
        criticality: config.planification?.criticality,
        priority: config.planification?.priority || '1',

        // KPIs et métriques - CORRECTION: Utiliser les bons noms de propriétés
        viewHistoryEnabled: config.planification?.viewHistoryEnabled,
        kpiTasksProcessed: config.planification?.kpiTasksProcessed,
        kpiReturnRate: config.planification?.kpiReturnRate,
        kpiAvgInteractions: config.planification?.kpiAvgInteractions,
        kpiDeadlineCompliance: config.planification?.kpiDeadlineCompliance,
        kpiValidationWaitTime: config.planification?.kpiValidationWaitTime,
        kpiPriorityCompliance: config.planification?.kpiPriorityCompliance,
        kpiEmergencyManagement: config.planification?.kpiEmergencyManagement,

        // Escalades et actions - CORRECTION: Utiliser les bons noms de propriétés
        notifierSuperviseur: config.planification?.notifierSuperviseur,
        reassignerTache: config.planification?.reassignerTache,
        envoyerRappel: config.planification?.envoyerRappel,
        escaladeHierarchique: config.planification?.escaladeHierarchique,
        changementPriorite: config.planification?.changementPriorite,
        bloquerWorkflow: config.planification?.bloquerWorkflow,
        genererAlerteEquipe: config.planification?.genererAlerteEquipe,
        demanderJustification: config.planification?.demanderJustification,
        activerActionCorrective: config.planification?.activerActionCorrective,
        escaladeExterne: config.planification?.escaladeExterne,
        cloturerDefaut: config.planification?.cloturerDefaut,
        suiviParKpi: config.planification?.suiviParKpi,
        planBOuTacheAlternative: config.planification?.planBOuTacheAlternative,

        // Pièces jointes et documents - CORRECTION: Utiliser les bons noms de propriétés
        attachmentsEnabled: config.resource?.attachmentsEnabled,
        attachmentType: config.resource?.attachmentType,
        securityLevel: config.resource?.securityLevel,
        externalTools: config.resource?.externalTools,
        linkToOtherTask: config.resource?.linkToOtherTask,
        scriptBusinessRule: config.resource?.scriptBusinessRule,
        addFormResource: config.resource?.addFormResource,
        archiveAttachment: config.resource?.archiveAttachment,
        shareArchivePdf: config.resource?.shareArchivePdf,
        describeFolderDoc: config.resource?.describeFolderDoc,
        deleteAttachmentDoc: config.resource?.deleteAttachmentDoc,
        consultAttachmentDoc: config.resource?.consultAttachmentDoc,
        downloadZip: config.resource?.downloadZip,
        importAttachment: config.resource?.importAttachment,
        editAttachment: config.resource?.editAttachment,
        annotateDocument: config.resource?.annotateDocument,
        verifyAttachmentDoc: config.resource?.verifyAttachmentDoc,
        searchInDocument: config.resource?.searchInDocument,
        removeDocument: config.resource?.removeDocument,
        addNewAttachment: config.resource?.addNewAttachment,
        convertAttachmentPdf: config.resource?.convertAttachmentPdf,
        downloadAttachmentPdf: config.resource?.downloadAttachmentPdf,
        downloadOriginalFormat: config.resource?.downloadOriginalFormat,

        // Notifications - CORRECTION: Utiliser les bons noms de propriétés
        notifyOnCreation: config.notification?.notifyOnCreation,
        notifyOnDeadline: config.notification?.notifyOnDeadline,
        reminderBeforeDeadline: config.notification?.reminderBeforeDeadline,
        notificationSensitivity: config.notification?.notificationSensitivity,
        selectedReminders: config.notification?.selectedReminders ?
        JSON.stringify(config.notification.selectedReminders) : null,

        // Condition
        conditionConfig: config.condition?.conditionConfig || JSON.stringify({conditionVariables: []}),

        // Condition et extension
        extraConfig: config.extraConfig ? JSON.stringify(config.extraConfig) : null
      };

      return backendConfig;
    });
  }
}

// Créer une instance unique pour toute l'application
const processEngineService = new ProcessEngineService();
export default processEngineService;
