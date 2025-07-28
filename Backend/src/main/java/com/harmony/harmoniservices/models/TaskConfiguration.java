package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity for task configurations with all parameters from frontend
 */
@Entity
@Table(name = "task_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class TaskConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Reference to BPMN task
    @Column(name = "task_id", nullable = false)
    private String taskId;
    
    @Column(name = "task_name")
    private String taskName;
    
    @Column(name = "task_type")
    private String taskType;
    
    // Information General parameters
    @Column(name = "board")
    private String board;
    
    @Column(name = "work_instructions", columnDefinition = "TEXT")
    private String workInstructions;
    
    @Column(name = "expected_deliverable", columnDefinition = "TEXT")
    private String expectedDeliverable;
    
    @Column(name = "category")
    private String category;
    
    // Resource parameters
    @Column(name = "attachments_enabled")
    private Boolean attachmentsEnabled;
    
    @Column(name = "attachment_type")
    private String attachmentType;
    
    @Column(name = "security_level")
    private String securityLevel;
    
    @Column(name = "external_tools")
    private String externalTools;
    
    @Column(name = "link_to_other_task")
    private String linkToOtherTask;
    
    @Column(name = "script_business_rule")
    private Boolean scriptBusinessRule;
    
    @Column(name = "add_form_resource")
    private Boolean addFormResource;
    
    // Resource actions - common
    @Column(name = "archive_attachment")
    private Boolean archiveAttachment;
    
    @Column(name = "share_archive_pdf")
    private Boolean shareArchivePdf;
    
    @Column(name = "describe_folder_doc")
    private Boolean describeFolderDoc;
    
    @Column(name = "delete_attachment_doc")
    private Boolean deleteAttachmentDoc;
    
    @Column(name = "consult_attachment_doc")
    private Boolean consultAttachmentDoc;
    
    @Column(name = "download_zip")
    private Boolean downloadZip;
    
    // Resource actions - documents specific
    @Column(name = "import_attachment")
    private Boolean importAttachment;
    
    @Column(name = "edit_attachment")
    private Boolean editAttachment;
    
    @Column(name = "annotate_document")
    private Boolean annotateDocument;
    
    @Column(name = "verify_attachment_doc")
    private Boolean verifyAttachmentDoc;
    
    @Column(name = "search_in_document")
    private Boolean searchInDocument;
    
    @Column(name = "remove_document")
    private Boolean removeDocument;
    
    @Column(name = "add_new_attachment")
    private Boolean addNewAttachment;
    
    @Column(name = "convert_attachment_pdf")
    private Boolean convertAttachmentPdf;
    
    @Column(name = "download_attachment_pdf")
    private Boolean downloadAttachmentPdf;
    
    @Column(name = "download_original_format")
    private Boolean downloadOriginalFormat;
    
    // Habilitation parameters
    @ManyToOne
    @JoinColumn(name = "assigned_entity_id")
    private EntiteOrganisation assignedEntity;
    
    @Column(name = "return_allowed")
    private Boolean returnAllowed;
    
    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private UserEntity assignedUser;
    
    @ManyToOne
    @JoinColumn(name = "assigned_group_id")
    private GroupeEntity assignedGroup;
    
    @ManyToOne
    @JoinColumn(name = "responsible_user_id")
    private UserEntity responsibleUser;
    
    @ManyToOne
    @JoinColumn(name = "interested_user_id")
    private UserEntity interestedUser;
    
    @Column(name = "assignee_type")
    private String assigneeType; // user, entity, or group
    
    // Planification parameters
    @Column(name = "all_day")
    private Boolean allDay;
    
    @Column(name = "duration_value")
    private Integer durationValue;
    
    @Column(name = "duration_unit")
    private String durationUnit; // Minutes, Days, Weeks, Months
    
    @Column(name = "criticality")
    private String criticality; // 1-4
    
    @Column(name = "priority")
    private String priority; // 1-3
    
    @Column(name = "view_history_enabled")
    private Boolean viewHistoryEnabled;
    
    // KPIs
    @Column(name = "kpi_tasks_processed")
    private Boolean kpiTasksProcessed;
    
    @Column(name = "kpi_return_rate")
    private Boolean kpiReturnRate;
    
    @Column(name = "kpi_avg_interactions")
    private Boolean kpiAvgInteractions;
    
    @Column(name = "kpi_deadline_compliance")
    private Boolean kpiDeadlineCompliance;
    
    @Column(name = "kpi_validation_wait_time")
    private Boolean kpiValidationWaitTime;
    
    @Column(name = "kpi_priority_compliance")
    private Boolean kpiPriorityCompliance;
    
    @Column(name = "kpi_emergency_management")
    private Boolean kpiEmergencyManagement;
    
    // Alternative actions
    @Column(name = "notify_supervisor")
    private Boolean notifySupervisor;
    
    @Column(name = "reassign_task")
    private Boolean reassignTask;
    
    @Column(name = "send_reminder")
    private Boolean sendReminder;
    
    @Column(name = "hierarchical_escalation")
    private Boolean hierarchicalEscalation;
    
    @Column(name = "change_priority")
    private Boolean changePriority;
    
    @Column(name = "block_workflow")
    private Boolean blockWorkflow;
    
    @Column(name = "generate_team_alert")
    private Boolean generateTeamAlert;
    
    @Column(name = "request_justification")
    private Boolean requestJustification;
    
    @Column(name = "activate_corrective_action")
    private Boolean activateCorrectiveAction;
    
    @Column(name = "external_escalation")
    private Boolean externalEscalation;
    
    @Column(name = "close_default")
    private Boolean closeDefault;
    
    @Column(name = "kpi_monitoring")
    private Boolean kpiMonitoring;
    
    @Column(name = "plan_b_or_alternative_task")
    private Boolean planBOrAlternativeTask;
    
    // Condition parameters
    @Column(name = "entry_conditions_enabled")
    private Boolean entryConditionsEnabled;
    
    @Column(name = "output_conditions_enabled")
    private Boolean outputConditionsEnabled;
    
    @ElementCollection
    @CollectionTable(name = "task_entry_conditions", joinColumns = @JoinColumn(name = "task_configuration_id"))
    private List<ConditionEntry> entryConditions;
    
    @ElementCollection
    @CollectionTable(name = "task_output_conditions", joinColumns = @JoinColumn(name = "task_configuration_id"))
    private List<ConditionEntry> outputConditions;
    
    // Notification parameters
    @Column(name = "notify_on_creation")
    private Boolean notifyOnCreation;
    
    @Column(name = "notify_on_deadline")
    private Boolean notifyOnDeadline;
    
    @Column(name = "reminder_before_deadline")
    private Integer reminderBeforeDeadline;
    
    @Column(name = "notification_sensitivity")
    private String notificationSensitivity; // public, confidential
    
    @ElementCollection
    @CollectionTable(name = "task_reminders", joinColumns = @JoinColumn(name = "task_configuration_id"))
    @Column(name = "reminder")
    private List<String> selectedReminders;
    
    // Metadata
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper class for conditions
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConditionEntry {
        @Column(name = "condition_type")
        private String type;
        
        @Column(name = "condition_value")
        private String condition;
        
        @Column(name = "result_value")
        private String result;
    }
}
