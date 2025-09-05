package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private String id;
    private String name;
    private String description;
    private String assignee;
    private LocalDateTime createTime;
    private LocalDateTime dueDate;
    private String processInstanceId;
    private String processDefinitionId;
    private String taskDefinitionKey;
    private int priority;
    private String owner;
    private String delegationState;
    private String parentTaskId;
    private String tenantId;
    private Map<String, Object> variables;
    private String formKey;
    private boolean suspended;
    // Enriched configuration coming from TaskConfiguration
    private TaskConfigurationDTO taskConfiguration;
}
