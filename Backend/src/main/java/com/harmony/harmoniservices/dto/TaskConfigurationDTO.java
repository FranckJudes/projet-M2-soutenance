package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskConfigurationDTO {
    private Long id;
    private String taskId;
    private String taskName;
    private String taskType;
    
    // Champs d'assignation
    private String assigneeUser;
    private String assigneeGroup;
    private String assigneeEntity;
    private String assigneeType;
    private Boolean returnAllowed;
    private String responsibleUser;
    private String interestedUser;
    
    // Champs d'information
    // private String board;
    // private String workInstructions;
    // private String expectedDeliverable;
    // private String category;
    
    // Champs existants
    private List<String> requiredRoles;
    private List<GroupeUtilisateurDTO> authorizedGroups;
    private Boolean needSupervisorValidation;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxDurationInMinutes;
    private String cronExpression;
    private Boolean isRecurring;
    private Integer minRequiredResources;
    private Integer maxRequiredResources;
    private List<String> requiredSkills;
    private String priority;
    private Boolean sendNotificationOnStart;
    private Boolean sendNotificationOnCompletion;
    private Boolean sendNotificationOnDelay;
    private List<String> notificationRecipients;
    private String notificationTemplate;
    private String executionStatus;
    private LocalDateTime lastExecutionDate;
    private String lastExecutionResult;
    private UserDTO assignedUser;  // Maintenu pour compatibilité
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Champs de planification étendus
    private Boolean viewHistoryEnabled;
    private Boolean kpiTasksProcessed;
    private Boolean kpiReturnRate;
    private Boolean kpiAvgInteractions;
    private Boolean kpiDeadlineCompliance;
    private Boolean kpiValidationWaitTime;
    private Boolean kpiPriorityCompliance;
    private Boolean kpiEmergencyManagement;
    private Boolean notifierSuperviseur;
    private Boolean reassignerTache;
    private Boolean envoyerRappel;
    private Boolean escaladeHierarchique;
    private Boolean changementPriorite;
    private Boolean bloquerWorkflow;
    private Boolean genererAlerteEquipe;
    private Boolean demanderJustification;
    private Boolean activerActionCorrective;
    private Boolean escaladeExterne;
    private Boolean cloturerDefaut;
    private Boolean suiviParKpi;
    private Boolean planBOuTacheAlternative;

    // Champs de ressources
    private Boolean attachmentsEnabled;
    private String attachmentType;
    private String securityLevel;
    private String externalTools;
    private String linkToOtherTask;
    private Boolean scriptBusinessRule;
    private Boolean addFormResource;
    private Boolean archiveAttachment;
    private Boolean shareArchivePdf;
    private Boolean describeFolderDoc;
    private Boolean deleteAttachmentDoc;
    private Boolean consultAttachmentDoc;
    private Boolean downloadZip;
    private Boolean importAttachment;
    private Boolean editAttachment;
    private Boolean annotateDocument;
    private Boolean verifyAttachmentDoc;
    private Boolean searchInDocument;
    private Boolean removeDocument;
    private Boolean addNewAttachment;
    private Boolean convertAttachmentPdf;
    private Boolean downloadAttachmentPdf;
    private Boolean downloadOriginalFormat;

    // Champs d'information étendus
    private String board;
    private String workInstructions;
    private String expectedDeliverable;
    private String category;
    
    // Champs de notification
    private Boolean notifyOnCreation;
    private Boolean notifyOnDeadline;
    private String notificationSensitivity;
    private Integer reminderBeforeDeadline;
    private String selectedReminders;
    
    // Configuration supplémentaire
    private String conditionConfig;
    private String extraConfig;
}
