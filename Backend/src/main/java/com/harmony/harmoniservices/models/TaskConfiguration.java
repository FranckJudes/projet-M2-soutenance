package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"processDefinitionKey", "taskId"}, name = "uk_process_task")
})
public class TaskConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String processDefinitionKey;
    private String taskId; // ID BPMN
    private String taskName;
    private String taskType;

    // Assignation
    private String assigneeUser;
    private String assigneeGroup;
    private String assigneeEntity;
    private String assigneeType;
    private Boolean returnAllowed;
    private String responsibleUser;
    private String interestedUser;

    // Information générale
    @Column(columnDefinition = "TEXT")
    private String board;
    @Column(columnDefinition = "TEXT")
    private String workInstructions;
    @Column(columnDefinition = "TEXT")
    private String expectedDeliverable;
    private String category;

    // Planification
    private Boolean allDay;
    private Integer durationValue;
    private String durationUnit;
    private String criticality;
    private String priority;
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

    // Ressources
    private Boolean attachmentsEnabled;
    private String attachmentType;
    private String securityLevel;
    @Column(columnDefinition = "TEXT")
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

    // Notifications
    private Boolean notifyOnCreation;
    private Boolean notifyOnDeadline;
    private Integer reminderBeforeDeadline;
    private String notificationSensitivity;
    private String notificationType; // Ajouté pour corriger l'erreur getNotificationType()
    @Column(columnDefinition = "TEXT")
    private String selectedReminders; // JSON array

    // Condition (optionnel, à adapter selon besoin)
    @Column(columnDefinition = "TEXT")
    private String conditionConfig;

    // Pour extension future
    @Column(columnDefinition = "TEXT")
    private String extraConfig;
} 