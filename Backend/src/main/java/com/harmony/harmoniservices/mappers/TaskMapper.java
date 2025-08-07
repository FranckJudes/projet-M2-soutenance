package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.TaskDTO;
import org.camunda.bpm.engine.task.Task;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

public class TaskMapper {
    
    public static TaskDTO toDTO(Task task) {
        if (task == null) {
            return null;
        }
        
        return TaskDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .assignee(task.getAssignee())
                .createTime(task.getCreateTime() != null ? 
                    LocalDateTime.ofInstant(task.getCreateTime().toInstant(), ZoneId.systemDefault()) : null)
                .dueDate(task.getDueDate() != null ? 
                    LocalDateTime.ofInstant(task.getDueDate().toInstant(), ZoneId.systemDefault()) : null)
                .processInstanceId(task.getProcessInstanceId())
                .processDefinitionId(task.getProcessDefinitionId())
                .taskDefinitionKey(task.getTaskDefinitionKey())
                .priority(task.getPriority())
                .owner(task.getOwner())
                .delegationState(task.getDelegationState() != null ? task.getDelegationState().toString() : null)
                .parentTaskId(task.getParentTaskId())
                .tenantId(task.getTenantId())
                .suspended(task.isSuspended())
                .build();
    }
    
    public static List<TaskDTO> toDTOList(List<Task> tasks) {
        if (tasks == null) {
            return null;
        }
        
        return tasks.stream()
                .map(TaskMapper::toDTO)
                .collect(Collectors.toList());
    }
}
