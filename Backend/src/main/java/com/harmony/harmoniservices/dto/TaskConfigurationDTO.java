package com.harmony.harmoniservices.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TaskConfigurationDTO {
    private Long id;
    private String taskId;
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
    private UserDTO assignedUser;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
