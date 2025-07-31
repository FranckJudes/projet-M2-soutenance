package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.TaskConfiguration;
import com.harmony.harmoniservices.repository.TaskConfigurationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.task.Task;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;
    private final TaskConfigurationRepository taskConfigurationRepository;

    /**
     * Send WebSocket notification for task assignment
     */
    public void sendTaskAssignmentNotification(Task task) {
        try {
            TaskConfiguration config = getTaskConfiguration(task);
            
            if (config != null && config.getNotifyOnCreation() != null && config.getNotifyOnCreation()) {
                Map<String, Object> notification = createTaskNotification(task, "TASK_ASSIGNED", config);
                
                // Send to specific user if assigned
                if (task.getAssignee() != null) {
                    messagingTemplate.convertAndSendToUser(
                        task.getAssignee(), 
                        "/queue/notifications", 
                        notification
                    );
                    
                    // Send email notification if configured
                    if (shouldSendEmailNotification(config)) {
                        sendEmailNotification(task.getAssignee(), "Task Assigned", 
                            "You have been assigned a new task: " + task.getName());
                    }
                }
                
                // Send to candidate groups - using TaskService to get candidate groups
                // Note: In a real implementation, you would query TaskService for candidate groups
                // For now, we'll send a general group notification if no specific assignee
                if (task.getAssignee() == null) {
                    messagingTemplate.convertAndSend("/topic/group-notifications", notification);
                }
                
                log.info("Sent task assignment notification for task: {}", task.getId());
            }
        } catch (Exception e) {
            log.error("Error sending task assignment notification", e);
        }
    }

    /**
     * Send WebSocket notification for task completion
     */
    public void sendTaskCompletionNotification(String taskId, String userId) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "TASK_COMPLETED");
            notification.put("taskId", taskId);
            notification.put("completedBy", userId);
            notification.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            notification.put("message", "Task has been completed");

            // Broadcast to all users (supervisors, interested parties)
            messagingTemplate.convertAndSend("/topic/task-updates", notification);
            
            log.info("Sent task completion notification for task: {}", taskId);
        } catch (Exception e) {
            log.error("Error sending task completion notification", e);
        }
    }

    /**
     * Send deadline reminder notifications
     */
    public void sendDeadlineReminder(Task task) {
        try {
            TaskConfiguration config = getTaskConfiguration(task);
            
            if (config != null && config.getNotifyOnDeadline() != null && config.getNotifyOnDeadline()) {
                Map<String, Object> notification = createTaskNotification(task, "DEADLINE_REMINDER", config);
                
                if (task.getAssignee() != null) {
                    messagingTemplate.convertAndSendToUser(
                        task.getAssignee(), 
                        "/queue/notifications", 
                        notification
                    );
                    
                    // Send email reminder
                    if (shouldSendEmailNotification(config)) {
                        sendEmailNotification(task.getAssignee(), "Task Deadline Reminder", 
                            "Reminder: Task '" + task.getName() + "' is approaching its deadline.");
                    }
                }
                
                log.info("Sent deadline reminder for task: {}", task.getId());
            }
        } catch (Exception e) {
            log.error("Error sending deadline reminder", e);
        }
    }

    /**
     * Send process start notification
     */
    public void sendProcessStartNotification(String processDefinitionKey, String processInstanceId, String startedBy) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "PROCESS_STARTED");
            notification.put("processDefinitionKey", processDefinitionKey);
            notification.put("processInstanceId", processInstanceId);
            notification.put("startedBy", startedBy);
            notification.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            notification.put("message", "New process instance started");

            // Broadcast to supervisors and interested parties
            messagingTemplate.convertAndSend("/topic/process-updates", notification);
            
            log.info("Sent process start notification for: {}", processInstanceId);
        } catch (Exception e) {
            log.error("Error sending process start notification", e);
        }
    }

    private Map<String, Object> createTaskNotification(Task task, String type, TaskConfiguration config) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", type);
        notification.put("taskId", task.getId());
        notification.put("taskName", task.getName());
        notification.put("processInstanceId", task.getProcessInstanceId());
        notification.put("assignee", task.getAssignee());
        notification.put("dueDate", task.getDueDate());
        notification.put("priority", task.getPriority());
        notification.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        // Add configuration-specific information
        if (config != null) {
            notification.put("category", config.getCategory());
            notification.put("criticality", config.getCriticality());
            notification.put("workInstructions", config.getWorkInstructions());
        }
        
        return notification;
    }

    private TaskConfiguration getTaskConfiguration(Task task) {
        // Extract process definition key from task
        String processDefinitionKey = extractProcessDefinitionKey(task.getProcessDefinitionId());
        
        return taskConfigurationRepository
                .findByProcessDefinitionKeyAndTaskId(processDefinitionKey, task.getTaskDefinitionKey())
                .orElse(null);
    }

    private String extractProcessDefinitionKey(String processDefinitionId) {
        // Process definition ID format: "processKey:version:deploymentId"
        if (processDefinitionId != null && processDefinitionId.contains(":")) {
            return processDefinitionId.split(":")[0];
        }
        return processDefinitionId;
    }

    private boolean shouldSendEmailNotification(TaskConfiguration config) {
        return config.getNotificationType() != null && 
               (config.getNotificationType().contains("email") || config.getNotificationType().contains("both"));
    }

    private void sendEmailNotification(String recipient, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(recipient + "@company.com"); // Adjust email domain as needed
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            mailMessage.setFrom("noreply@harmony-services.com");
            
            mailSender.send(mailMessage);
            log.info("Email notification sent to: {}", recipient);
        } catch (Exception e) {
            log.error("Error sending email notification to: " + recipient, e);
        }
    }
}
