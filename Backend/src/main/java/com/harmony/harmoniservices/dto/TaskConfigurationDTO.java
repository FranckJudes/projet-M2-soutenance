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
    private String board;
    private String workInstructions;
    private String expectedDeliverable;
    private String category;
    
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
    
    // Champs de planification
    private Boolean allDay;
    private Integer durationValue;
    private String durationUnit;
    private String criticality;
    
    // Champs de notification
    private Boolean notifyOnCreation;
    private Boolean notifyOnDeadline;
    private Integer reminderBeforeDeadline;
    private String notificationSensitivity;
    private List<String> selectedReminders;
    
    // Configuration supplémentaire
    private String conditionConfig;
    private String extraConfig;
}
