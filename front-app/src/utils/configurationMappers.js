/**
 * Utilitaires pour mapper les données de configuration entre le frontend et le backend
 */

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données de planification (pas de mapping nécessaire)
 * Les données sont déjà dans le bon format depuis le composant Planification
 * @param {Object} planificationData - Données au format correct
 * @returns {Object} - Données dans le même format
 */
export const mapPlanificationToBackend = (planificationData) => {
  // Les données viennent déjà dans le bon format depuis getPlanificationData()
  // Pas besoin de mapping, juste validation
  if (!planificationData) return null;

  return {
    // Champs de base
    allDay: planificationData.allDay || false,
    durationValue: planificationData.durationValue || null,
    durationUnit: planificationData.durationUnit || 'Minutes',
    criticality: planificationData.criticality || '1',
    priority: planificationData.priority || '1',
    viewHistoryEnabled: planificationData.viewHistoryEnabled || false,
    
    // KPIs
    kpiTasksProcessed: planificationData.kpiTasksProcessed || false,
    kpiReturnRate: planificationData.kpiReturnRate || false,
    kpiAvgInteractions: planificationData.kpiAvgInteractions || false,
    kpiDeadlineCompliance: planificationData.kpiDeadlineCompliance || false,
    kpiValidationWaitTime: planificationData.kpiValidationWaitTime || false,
    kpiPriorityCompliance: planificationData.kpiPriorityCompliance || false,
    kpiEmergencyManagement: planificationData.kpiEmergencyManagement || false,
    
    // Actions alternatives
    notifierSuperviseur: planificationData.notifierSuperviseur || false,
    reassignerTache: planificationData.reassignerTache || false,
    envoyerRappel: planificationData.envoyerRappel || false,
    escaladeHierarchique: planificationData.escaladeHierarchique || false,
    changementPriorite: planificationData.changementPriorite || false,
    bloquerWorkflow: planificationData.bloquerWorkflow || false,
    genererAlerteEquipe: planificationData.genererAlerteEquipe || false,
    demanderJustification: planificationData.demanderJustification || false,
    activerActionCorrective: planificationData.activerActionCorrective || false,
    escaladeExterne: planificationData.escaladeExterne || false,
    cloturerDefaut: planificationData.cloturerDefaut || false,
    suiviParKpi: planificationData.suiviParKpi || false,
    planBOuTacheAlternative: planificationData.planBOuTacheAlternative || false
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données de planification du backend vers le frontend
 * @param {Object} backendConfig - Configuration au format backend
 * @returns {Object} - Configuration au format frontend pour le composant
 */
export const mapPlanificationToFrontend = (backendConfig) => {
  if (!backendConfig) return null;

  return {
    // Mapping pour le localStorage du composant Planification
    taskId: backendConfig.taskId || null,
    taskName: backendConfig.taskName || '',
    taskType: backendConfig.taskType || 'task',
    toutJournee: backendConfig.allDay || false,
    delayValue: backendConfig.durationValue ? backendConfig.durationValue.toString() : '',
    delayUnit: backendConfig.durationUnit || 'Minutes',
    criticite: backendConfig.criticality || '1',
    priority: backendConfig.priority || '1',
    consultationHistorique: backendConfig.viewHistoryEnabled || false,
    
    // KPIs
    nombreTachesTraitees: backendConfig.kpiTasksProcessed || false,
    tauxRetourTachesTraitees: backendConfig.kpiReturnRate || false,
    nombreInteractionsMoyensTachesTraitees: backendConfig.kpiAvgInteractions || false,
    respectDelais: backendConfig.kpiDeadlineCompliance || false,
    tempsAttenteValidation: backendConfig.kpiValidationWaitTime || false,
    respectPriorites: backendConfig.kpiPriorityCompliance || false,
    gestionUrgences: backendConfig.kpiEmergencyManagement || false,
    
    // Actions alternatives
    notifier_superviseur: backendConfig.notifierSuperviseur || false,
    reassigner_tache: backendConfig.reassignerTache || false,
    envoyerRappel: backendConfig.envoyerRappel || false,
    escaladeHierarchique: backendConfig.escaladeHierarchique || false,
    changementPriorite: backendConfig.changementPriorite || false,
    bloquerWorkflow: backendConfig.bloquerWorkflow || false,
    genererAlerteEquipe: backendConfig.genererAlerteEquipe || false,
    demanderJustification: backendConfig.demanderJustification || false,
    activerActionCorrective: backendConfig.activerActionCorrective || false,
    escaladeExterne: backendConfig.escaladeExterne || false,
    cloturerDefaut: backendConfig.cloturerDefaut || false,
    suiviParKpi: backendConfig.suiviParKpi || false,
    planBOuTacheAlternative: backendConfig.planBOuTacheAlternative || false
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données d'habilitation (pas de mapping nécessaire)
 * Les données sont déjà dans le bon format depuis le composant Habilitation
 * @param {Object} habilitationData - Données au format correct
 * @returns {Object} - Données dans le même format
 */
export const mapHabilitationToBackend = (habilitationData) => {
  // Les données viennent déjà dans le bon format depuis getHabilitationData()
  // Pas besoin de mapping, juste validation
  if (!habilitationData) return null;

  return {
    assignedEntity: habilitationData.assignedEntity || null,
    returnAllowed: habilitationData.returnAllowed || false,
    assignedUser: habilitationData.assignedUser || null,
    assignedGroup: habilitationData.assignedGroup || null,
    responsibleUser: habilitationData.responsibleUser || null,
    interestedUser: habilitationData.interestedUser || null,
    assigneeType: habilitationData.assigneeType || null
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données d'habilitation du backend vers le frontend
 * @param {Object} backendConfig - Configuration au format backend
 * @returns {Object} - Configuration au format frontend pour le composant
 */
export const mapHabilitationToFrontend = (backendConfig) => {
  if (!backendConfig) return null;

  return {
    // Mapping pour le localStorage du composant Habilitation
    taskId: backendConfig.taskId || null,
    taskName: backendConfig.taskName || '',
    taskType: backendConfig.taskType || 'task',
    isChecked: backendConfig.assignedUser !== null && backendConfig.assignedUser !== undefined,
    selectPointControl: backendConfig.responsibleUser !== null && backendConfig.responsibleUser !== undefined,
    persInteress: backendConfig.interestedUser !== null && backendConfig.interestedUser !== undefined,
    entity: backendConfig.assignedEntity !== null && backendConfig.assignedEntity !== undefined,
    groupUser: backendConfig.assignedGroup !== null && backendConfig.assignedGroup !== undefined,
    possReturn: backendConfig.returnAllowed || false,
    selectedUser: backendConfig.assignedUser || null,
    selectedInterestedUser: backendConfig.interestedUser || null,
    selectedEntity: backendConfig.assignedEntity || null,
    selectedGroup: backendConfig.assignedGroup || null,
    checkPointDetails: backendConfig.responsibleUser || ''
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données de notification (pas de mapping nécessaire)
 * Les données sont déjà dans le bon format depuis le composant Notifications
 * @param {Object} notificationData - Données au format correct
 * @returns {Object} - Données dans le même format
 */
export const mapNotificationToBackend = (notificationData) => {
  // Les données viennent déjà dans le bon format depuis getNotificationData()
  // Pas besoin de mapping, juste validation
  if (!notificationData) return null;

  return {
    notifyOnCreation: notificationData.notifyOnCreation || false,
    notifyOnDeadline: notificationData.notifyOnDeadline || false,
    reminderBeforeDeadline: notificationData.reminderBeforeDeadline || null,
    notificationSensitivity: notificationData.notificationSensitivity || 'public',
    selectedReminders: notificationData.selectedReminders || []
  };
};

/**
 * Mappe les données de notification du format backend vers le format frontend
 * @param {Object} backendConfig - Configuration au format backend
 * @returns {Object} - Configuration au format frontend
 */
export const mapNotificationToFrontend = (backendConfig) => {
  if (!backendConfig) return null;

  return {
    typeNotification: backendConfig.notificationType,
    destinatairesNotification: backendConfig.notificationRecipients || [],
    modeleNotification: backendConfig.notificationTemplate,
    canalNotification: backendConfig.notificationChannel,
    rappelActive: backendConfig.reminderEnabled,
    frequenceRappel: backendConfig.reminderFrequency ? backendConfig.reminderFrequency.toString() : '',
    uniteRappel: backendConfig.reminderUnit
  };
};

/**
 * Mappe les données de condition du format frontend vers le format backend
 * @param {Object} frontendConfig - Configuration au format frontend
 * @returns {Object} - Configuration au format backend
 */
export const mapConditionToBackend = (frontendConfig) => {
  if (!frontendConfig) return null;

  return {
    conditionType: frontendConfig.typeCondition,
    conditionExpression: frontendConfig.expressionCondition,
    conditionVariables: frontendConfig.variablesCondition || [],
    conditionScript: frontendConfig.scriptCondition,
    conditionResult: frontendConfig.resultatCondition
  };
};

/**
 * Mappe les données de condition du format backend vers le format frontend
 * @param {Object} backendConfig - Configuration au format backend
 * @returns {Object} - Configuration au format frontend
 */
export const mapConditionToFrontend = (backendConfig) => {
  if (!backendConfig) return null;

  return {
    typeCondition: backendConfig.conditionType,
    expressionCondition: backendConfig.conditionExpression,
    variablesCondition: backendConfig.conditionVariables || [],
    scriptCondition: backendConfig.conditionScript,
    resultatCondition: backendConfig.conditionResult
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données de ressource (pas de mapping nécessaire)
 * Les données sont déjà dans le bon format depuis le composant Ressource
 * @param {Object} resourceData - Données au format correct
 * @returns {Object} - Données dans le même format
 */
export const mapResourceToBackend = (resourceData) => {
  // Les données viennent déjà dans le bon format depuis getResourceData()
  // Pas besoin de mapping, juste validation
  if (!resourceData) return null;

  return {
    attachmentsEnabled: resourceData.attachmentsEnabled || false,
    attachmentType: resourceData.attachmentType || null,
    securityLevel: resourceData.securityLevel || null,
    externalTools: resourceData.externalTools || null,
    linkToOtherTask: resourceData.linkToOtherTask || null,
    scriptBusinessRule: resourceData.scriptBusinessRule || false,
    addFormResource: resourceData.addFormResource || false,
    
    // Actions communes
    archiveAttachment: resourceData.archiveAttachment || false,
    shareArchivePdf: resourceData.shareArchivePdf || false,
    describeFolderDoc: resourceData.describeFolderDoc || false,
    deleteAttachmentDoc: resourceData.deleteAttachmentDoc || false,
    consultAttachmentDoc: resourceData.consultAttachmentDoc || false,
    downloadZip: resourceData.downloadZip || false,
    
    // Actions spécifiques aux documents
    importAttachment: resourceData.importAttachment || false,
    editAttachment: resourceData.editAttachment || false,
    annotateDocument: resourceData.annotateDocument || false,
    verifyAttachmentDoc: resourceData.verifyAttachmentDoc || false,
    searchInDocument: resourceData.searchInDocument || false,
    removeDocument: resourceData.removeDocument || false,
    addNewAttachment: resourceData.addNewAttachment || false,
    convertAttachmentPdf: resourceData.convertAttachmentPdf || false,
    downloadAttachmentPdf: resourceData.downloadAttachmentPdf || false,
    downloadOriginalFormat: resourceData.downloadOriginalFormat || false
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données de ressource du backend vers le frontend
 * @param {Object} backendConfig - Configuration au format backend
 * @returns {Object} - Configuration au format frontend pour le composant
 */
export const mapResourceToFrontend = (backendConfig) => {
  if (!backendConfig) return null;

  return {
    // Mapping pour le localStorage du composant Ressource
    taskId: backendConfig.taskId || null,
    taskName: backendConfig.taskName || '',
    taskType: backendConfig.taskType || 'task',
    hasAttachement: backendConfig.attachmentsEnabled || false,
    selectedNode: backendConfig.attachmentType ? { id: backendConfig.attachmentType } : null,
    securityLevel: backendConfig.securityLevel || null,
    externalTools: backendConfig.externalTools || '',
    linkToOtherTask: backendConfig.linkToOtherTask || '',
    scriptRegleMetier: backendConfig.scriptBusinessRule || false,
    addFormResource: backendConfig.addFormResource || false,
    
    // Actions communes
    archiv_attach: backendConfig.archiveAttachment || false,
    share_achiv_pdf: backendConfig.shareArchivePdf || false,
    decribe_fol_doc: backendConfig.describeFolderDoc || false,
    delete_attach_doc: backendConfig.deleteAttachmentDoc || false,
    consulter_attach_doc: backendConfig.consultAttachmentDoc || false,
    download_zip: backendConfig.downloadZip || false,
    
    // Actions spécifiques aux documents
    import_attach: backendConfig.importAttachment || false,
    edit_attach: backendConfig.editAttachment || false,
    annoter_doc: backendConfig.annotateDocument || false,
    verif_attach_doc: backendConfig.verifyAttachmentDoc || false,
    rechercher_un_doc: backendConfig.searchInDocument || false,
    retirer_un_doc: backendConfig.removeDocument || false,
    add_new_attach: backendConfig.addNewAttachment || false,
    conver_attach_pdf: backendConfig.convertAttachmentPdf || false,
    download_attach_pdf: backendConfig.downloadAttachmentPdf || false,
    download_original_format: backendConfig.downloadOriginalFormat || false
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données d'information (pas de mapping nécessaire)
 * Les données sont déjà dans le bon format depuis le composant InformationGeneral
 * @param {Object} informationData - Données au format correct
 * @returns {Object} - Données dans le même format
 */
export const mapInformationToBackend = (informationData) => {
  // Les données viennent déjà dans le bon format depuis getInformationData()
  // Pas besoin de mapping, juste validation
  if (!informationData) return null;

  return {
    board: informationData.board || '',
    workInstructions: informationData.workInstructions || '',
    expectedDeliverable: informationData.expectedDeliverable || '',
    category: informationData.category || null
  };
};

/**
 * NOUVELLE FONCTION SIMPLIFIÉE - Mappe les données d'information du backend vers le frontend
 * @param {Object} backendConfig - Configuration au format backend
 * @returns {Object} - Configuration au format frontend pour le composant
 */
export const mapInformationToFrontend = (backendConfig) => {
  if (!backendConfig) return null;

  return {
    // Mapping pour le localStorage du composant InformationGeneral
    taskId: backendConfig.taskId || null,
    taskName: backendConfig.taskName || '',
    taskType: backendConfig.taskType || 'task',
    category: backendConfig.category || null,
    board: backendConfig.board || '',
    instructions: backendConfig.workInstructions || '',
    results: backendConfig.expectedDeliverable || ''
  };
};

/**
 * FONCTION UTILITAIRE - Valider les données d'information
 * @param {Object} informationData - Données à valider
 * @returns {Object} - Résultat de la validation
 */
export const validateInformationData = (informationData) => {
  const errors = [];
  
  if (!informationData) {
    return {
      isValid: false,
      errors: ['Information data is required']
    };
  }
  
  if (!informationData.board || informationData.board.trim() === '') {
    errors.push('Board is required');
  }
  
  if (!informationData.workInstructions || informationData.workInstructions.trim() === '') {
    errors.push('Work instructions are required');
  }
  
  if (!informationData.expectedDeliverable || informationData.expectedDeliverable.trim() === '') {
    errors.push('Expected deliverable is required');
  }
  
  if (!informationData.category) {
    errors.push('Category is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: informationData
  };
};

/**
 * FONCTION UTILITAIRE - Valider les données d'habilitation (VALIDATION OPTIONNELLE)
 * @param {Object} habilitationData - Données à valider
 * @returns {Object} - Résultat de la validation
 */
export const validateHabilitationData = (habilitationData) => {
  const errors = [];
  
  if (!habilitationData) {
    // Même si pas de données, c'est valide (optionnel)
    return {
      isValid: true,
      errors: [],
      data: null
    };
  }
  
  // SUPPRIMÉ: Validation obligatoire d'au moins une assignation
  // Tous les champs d'habilitation sont maintenant optionnels
  
  // Validation uniquement pour la cohérence des données
  // (par exemple, si un point de contrôle est activé, il faut des détails)
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: habilitationData
  };
};

/**
 * FONCTION UTILITAIRE - Convertir les données du localStorage vers le format backend
 * @param {Object} localStorageConfig - Configuration depuis localStorage
 * @returns {Object} - Configuration au format backend
 */
export const convertLocalStorageInformationToBackend = (localStorageConfig) => {
  if (!localStorageConfig) return null;

  return {
    board: localStorageConfig.board || '',
    workInstructions: localStorageConfig.instructions || '',
    expectedDeliverable: localStorageConfig.results || '',
    category: localStorageConfig.category || null
  };
};

/**
 * FONCTION UTILITAIRE - Convertir les données du localStorage vers le format backend pour habilitation
 * @param {Object} localStorageConfig - Configuration depuis localStorage
 * @returns {Object} - Configuration au format backend
 */
export const convertLocalStorageHabilitationToBackend = (localStorageConfig) => {
  if (!localStorageConfig) return null;

  // Déterminer le type d'assigné
  let assigneeType = null;
  let assignedUser = null;
  let assignedEntity = null;
  let assignedGroup = null;
  let interestedUser = null;
  let responsibleUser = null;

  // Assignation utilisateur principal
  if (localStorageConfig.isChecked && localStorageConfig.selectedUser) {
    assignedUser = localStorageConfig.selectedUser;
    assigneeType = 'user';
  }

  // Assignation entité
  if (localStorageConfig.entity && localStorageConfig.selectedEntity) {
    assignedEntity = localStorageConfig.selectedEntity;
    if (!assigneeType) assigneeType = 'entity';
  }

  // Assignation groupe
  if (localStorageConfig.groupUser && localStorageConfig.selectedGroup) {
    assignedGroup = localStorageConfig.selectedGroup;
    if (!assigneeType) assigneeType = 'group';
  }

  // Personne intéressée
  if (localStorageConfig.persInteress && localStorageConfig.selectedInterestedUser) {
    interestedUser = localStorageConfig.selectedInterestedUser;
  }

  // Responsable pour point de contrôle
  if (localStorageConfig.selectPointControl && localStorageConfig.checkPointDetails) {
    responsibleUser = localStorageConfig.checkPointDetails;
  }

  return {
    assignedEntity: assignedEntity,
    returnAllowed: localStorageConfig.possReturn || false,
    assignedUser: assignedUser,
    assignedGroup: assignedGroup,
    responsibleUser: responsibleUser,
    interestedUser: interestedUser,
    assigneeType: assigneeType
  };
};

/**
 * FONCTION UTILITAIRE - Valider les données de planification (VALIDATION OPTIONNELLE)
 * @param {Object} planificationData - Données à valider
 * @returns {Object} - Résultat de la validation
 */
export const validatePlanificationData = (planificationData) => {
  const errors = [];
  
  if (!planificationData) {
    // Même si pas de données, c'est valide (optionnel)
    return {
      isValid: true,
      errors: [],
      data: null
    };
  }
  
  // Validation uniquement pour la cohérence des données
  if (planificationData.durationValue && isNaN(parseInt(planificationData.durationValue, 10))) {
    errors.push('Duration value must be a valid number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: planificationData
  };
};

/**
 * FONCTION UTILITAIRE - Convertir les données du localStorage vers le format backend pour planification
 * @param {Object} localStorageConfig - Configuration depuis localStorage
 * @returns {Object} - Configuration au format backend
 */
export const convertLocalStoragePlanificationToBackend = (localStorageConfig) => {
  if (!localStorageConfig) return null;

  return {
    allDay: localStorageConfig.toutJournee || false,
    durationValue: localStorageConfig.delayValue ? parseInt(localStorageConfig.delayValue, 10) : null,
    durationUnit: localStorageConfig.delayUnit || 'Minutes',
    criticality: localStorageConfig.criticite || '1',
    priority: localStorageConfig.priority || '1',
    viewHistoryEnabled: localStorageConfig.consultationHistorique || false,
    
    // KPIs
    kpiTasksProcessed: localStorageConfig.nombreTachesTraitees || false,
    kpiReturnRate: localStorageConfig.tauxRetourTachesTraitees || false,
    kpiAvgInteractions: localStorageConfig.nombreInteractionsMoyensTachesTraitees || false,
    kpiDeadlineCompliance: localStorageConfig.respectDelais || false,
    kpiValidationWaitTime: localStorageConfig.tempsAttenteValidation || false,
    kpiPriorityCompliance: localStorageConfig.respectPriorites || false,
    kpiEmergencyManagement: localStorageConfig.gestionUrgences || false,
    
    // Actions alternatives
    notifierSuperviseur: localStorageConfig.notifier_superviseur || false,
    reassignerTache: localStorageConfig.reassigner_tache || false,
    envoyerRappel: localStorageConfig.envoyerRappel || false,
    escaladeHierarchique: localStorageConfig.escaladeHierarchique || false,
    changementPriorite: localStorageConfig.changementPriorite || false,
    bloquerWorkflow: localStorageConfig.bloquerWorkflow || false,
    genererAlerteEquipe: localStorageConfig.genererAlerteEquipe || false,
    demanderJustification: localStorageConfig.demanderJustification || false,
    activerActionCorrective: localStorageConfig.activerActionCorrective || false,
    escaladeExterne: localStorageConfig.escaladeExterne || false,
    cloturerDefaut: localStorageConfig.cloturerDefaut || false,
    suiviParKpi: localStorageConfig.suiviParKpi || false,
    planBOuTacheAlternative: localStorageConfig.planBOuTacheAlternative || false
  };
};

/**
 * FONCTION UTILITAIRE - Valider les données de ressource (VALIDATION OPTIONNELLE)
 * @param {Object} resourceData - Données à valider
 * @returns {Object} - Résultat de la validation
 */
export const validateResourceData = (resourceData) => {
  const errors = [];
  
  if (!resourceData) {
    // Même si pas de données, c'est valide (optionnel)
    return {
      isValid: true,
      errors: [],
      data: null
    };
  }
  
  // Validation uniquement pour la cohérence des données
  if (resourceData.externalTools && resourceData.externalTools.trim()) {
    try {
      new URL(resourceData.externalTools);
    } catch {
      errors.push('External tools URL must be a valid URL');
    }
  }
  
  if (resourceData.linkToOtherTask && resourceData.linkToOtherTask.trim()) {
    if (resourceData.linkToOtherTask.length < 3) {
      errors.push('Link to other task must be at least 3 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: resourceData
  };
};

/**
 * FONCTION UTILITAIRE - Convertir les données du localStorage vers le format backend pour ressource
 * @param {Object} localStorageConfig - Configuration depuis localStorage
 * @returns {Object} - Configuration au format backend
 */
export const convertLocalStorageResourceToBackend = (localStorageConfig) => {
  if (!localStorageConfig) return null;

  return {
    attachmentsEnabled: localStorageConfig.hasAttachement || false,
    attachmentType: localStorageConfig.selectedNode ? localStorageConfig.selectedNode.id : null,
    securityLevel: localStorageConfig.securityLevel || null,
    externalTools: localStorageConfig.externalTools || null,
    linkToOtherTask: localStorageConfig.linkToOtherTask || null,
    scriptBusinessRule: localStorageConfig.scriptRegleMetier || false,
    addFormResource: localStorageConfig.addFormResource || false,
    
    // Actions communes
    archiveAttachment: localStorageConfig.archiv_attach || false,
    shareArchivePdf: localStorageConfig.share_achiv_pdf || false,
    describeFolderDoc: localStorageConfig.decribe_fol_doc || false,
    deleteAttachmentDoc: localStorageConfig.delete_attach_doc || false,
    consultAttachmentDoc: localStorageConfig.consulter_attach_doc || false,
    downloadZip: localStorageConfig.download_zip || false,
    
    // Actions spécifiques aux documents
    importAttachment: localStorageConfig.import_attach || false,
    editAttachment: localStorageConfig.edit_attach || false,
    annotateDocument: localStorageConfig.annoter_doc || false,
    verifyAttachmentDoc: localStorageConfig.verif_attach_doc || false,
    searchInDocument: localStorageConfig.rechercher_un_doc || false,
    removeDocument: localStorageConfig.retirer_un_doc || false,
    addNewAttachment: localStorageConfig.add_new_attach || false,
    convertAttachmentPdf: localStorageConfig.conver_attach_pdf || false,
    downloadAttachmentPdf: localStorageConfig.download_attach_pdf || false,
    downloadOriginalFormat: localStorageConfig.download_original_format || false
  };
};

/**
 * FONCTION UTILITAIRE - Valider les données de notification (VALIDATION OPTIONNELLE)
 * @param {Object} notificationData - Données à valider
 * @returns {Object} - Résultat de la validation
 */
export const validateNotificationData = (notificationData) => {
  const errors = [];
  
  if (!notificationData) {
    // Même si pas de données, c'est valide (optionnel)
    return {
      isValid: true,
      errors: [],
      data: null
    };
  }
  
  // Validation uniquement pour la cohérence des données
  if (notificationData.reminderBeforeDeadline && 
      (isNaN(notificationData.reminderBeforeDeadline) || notificationData.reminderBeforeDeadline < 0)) {
    errors.push('Reminder before deadline must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: notificationData
  };
};

/**
 * FONCTION UTILITAIRE - Convertir les données du localStorage vers le format backend pour notification
 * @param {Object} localStorageConfig - Configuration depuis localStorage
 * @returns {Object} - Configuration au format backend
 */
export const convertLocalStorageNotificationToBackend = (localStorageConfig) => {
  if (!localStorageConfig) return null;

  // Mapper la priorité vers la sensibilité
  let sensitivity = 'public';
  if (localStorageConfig.selectedPriority === 2) {
    sensitivity = 'confidential';
  }

  // Extraire le premier rappel comme reminderBeforeDeadline
  let reminderBeforeDeadline = null;
  if (localStorageConfig.selectedReminders && localStorageConfig.selectedReminders.length > 0) {
    const firstReminder = localStorageConfig.selectedReminders[0];
    // Mapping des valeurs vers des minutes (fonction utilitaire)
    const reminderMapping = {
      "15 minutes before": 15,
      "1 hour before": 60,
      "2 hours before": 120,
      "3 hours before": 180,
      "4 hours before": 240,
      "1 day before": 1440,
      "2 days before": 2880,
      "3 days before": 4320,
      "1 week before": 10080,
      "2 weeks before": 20160,
      "1 month before": 43200
    };
    reminderBeforeDeadline = reminderMapping[firstReminder.value] || null;
  }

  return {
    notifyOnCreation: localStorageConfig.notificationByAttribution || false,
    notifyOnDeadline: localStorageConfig.alertEscalade || false,
    reminderBeforeDeadline: reminderBeforeDeadline,
    notificationSensitivity: sensitivity,
    selectedReminders: localStorageConfig.selectedReminders || []
  };
};