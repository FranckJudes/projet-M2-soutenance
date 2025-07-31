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
    return frontendConfigurations.map(config => ({
      taskId: config.taskId,
      taskName: config.taskName,
      taskType: config.taskType || 'userTask',
      
      // Assignation
      assigneeUser: config.assignation?.assigneeUser,
      assigneeGroup: config.assignation?.assigneeGroup,
      assigneeEntity: config.assignation?.assigneeEntity,
      assigneeType: config.assignation?.assigneeType,
      returnAllowed: config.assignation?.returnAllowed,
      responsibleUser: config.assignation?.responsibleUser,
      interestedUser: config.assignation?.interestedUser,
      
      // Information générale
      board: config.informationGeneral?.board,
      workInstructions: config.informationGeneral?.workInstructions,
      expectedDeliverable: config.informationGeneral?.expectedDeliverable,
      category: config.informationGeneral?.category,
      
      // Planification
      allDay: config.planification?.allDay,
      durationValue: config.planification?.durationValue,
      durationUnit: config.planification?.durationUnit,
      criticality: config.planification?.criticality,
      priority: config.planification?.priority,
      viewHistoryEnabled: config.planification?.viewHistoryEnabled,
      
      // KPIs
      kpiTasksProcessed: config.planification?.kpiTasksProcessed,
      kpiReturnRate: config.planification?.kpiReturnRate,
      kpiAvgInteractions: config.planification?.kpiAvgInteractions,
      kpiDeadlineCompliance: config.planification?.kpiDeadlineCompliance,
      kpiValidationWaitTime: config.planification?.kpiValidationWaitTime,
      kpiPriorityCompliance: config.planification?.kpiPriorityCompliance,
      kpiEmergencyManagement: config.planification?.kpiEmergencyManagement,
      
      // Actions d'escalade
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
      
      // Ressources
      attachmentsEnabled: config.ressources?.attachmentsEnabled,
      attachmentType: config.ressources?.attachmentType,
      securityLevel: config.ressources?.securityLevel,
      externalTools: config.ressources?.externalTools,
      linkToOtherTask: config.ressources?.linkToOtherTask,
      scriptBusinessRule: config.ressources?.scriptBusinessRule,
      addFormResource: config.ressources?.addFormResource,
      archiveAttachment: config.ressources?.archiveAttachment,
      shareArchivePdf: config.ressources?.shareArchivePdf,
      describeFolderDoc: config.ressources?.describeFolderDoc,
      deleteAttachmentDoc: config.ressources?.deleteAttachmentDoc,
      consultAttachmentDoc: config.ressources?.consultAttachmentDoc,
      downloadZip: config.ressources?.downloadZip,
      importAttachment: config.ressources?.importAttachment,
      editAttachment: config.ressources?.editAttachment,
      annotateDocument: config.ressources?.annotateDocument,
      verifyAttachmentDoc: config.ressources?.verifyAttachmentDoc,
      searchInDocument: config.ressources?.searchInDocument,
      removeDocument: config.ressources?.removeDocument,
      addNewAttachment: config.ressources?.addNewAttachment,
      convertAttachmentPdf: config.ressources?.convertAttachmentPdf,
      downloadAttachmentPdf: config.ressources?.downloadAttachmentPdf,
      downloadOriginalFormat: config.ressources?.downloadOriginalFormat,
      
      // Notifications
      notifyOnCreation: config.notifications?.notifyOnCreation,
      notifyOnDeadline: config.notifications?.notifyOnDeadline,
      reminderBeforeDeadline: config.notifications?.reminderBeforeDeadline,
      notificationSensitivity: config.notifications?.notificationSensitivity,
      notificationType: config.notifications?.notificationType,
      selectedReminders: config.notifications?.selectedReminders ? 
        JSON.stringify(config.notifications.selectedReminders) : null,
      
      // Condition et extension
      conditionConfig: config.condition ? JSON.stringify(config.condition) : null,
      extraConfig: config.extraConfig ? JSON.stringify(config.extraConfig) : null
    }));
  }
}

// Créer une instance unique pour toute l'application
const processEngineService = new ProcessEngineService();
export default processEngineService;
