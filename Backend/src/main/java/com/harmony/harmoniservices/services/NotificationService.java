package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.enums.NotificationPriority;
import com.harmony.harmoniservices.enums.NotificationStatus;
import com.harmony.harmoniservices.enums.NotificationType;
import com.harmony.harmoniservices.models.CamundaIdMapping;
import com.harmony.harmoniservices.models.Notification;
import com.harmony.harmoniservices.models.TaskConfiguration;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.CamundaIdMappingRepository;
import com.harmony.harmoniservices.repository.NotificationRepository;
import com.harmony.harmoniservices.repository.TaskConfigurationRepository;
import com.harmony.harmoniservices.repository.UserRepository;
import com.harmony.harmoniservices.utils.EmailTemplateUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.history.HistoricTaskInstance;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;
    private final TaskConfigurationRepository taskConfigurationRepository;
    private final NotificationRepository notificationRepository;
    private final CamundaIdMappingRepository camundaIdMappingRepository;
    private final UserRepository userRepository;
    private final HistoryService historyService;
    private final RepositoryService repositoryService;

    /**
     * Send WebSocket notification for task assignment
     */
    @Async
    public void sendTaskAssignmentNotification(Task task) {
        try {
            TaskConfiguration config = getTaskConfiguration(task);
            
            // Toujours persister une notification d'assignation dès qu'il y a un assignee,
            // indépendamment des flags de configuration d'alerte
            if (task.getAssignee() != null) {
                try {
                    String recipientUserId = resolveAppUserId(task.getAssignee());
                    String title = "Nouvelle tâche assignée : " + task.getName();
                    String message = "Vous avez été assigné(e) à la tâche '" + task.getName() + "'.";
                    String actionUrl = "http://localhost:5173/tasks/" + task.getId();
                    saveNotification(
                        recipientUserId,
                        title,
                        message,
                        NotificationType.TASK_ASSIGNED,
                        NotificationPriority.NORMAL,
                        task.getId(),
                        "TaskInstance",
                        actionUrl
                    );
                    log.info("Persisted assignment notification for task {} and user {}", task.getId(), recipientUserId);
                } catch (Exception ex) {
                    log.warn("Failed to persist assignment notification for task {}: {}", task.getId(), ex.getMessage());
                }
            }
            
            // if (config != null && config.getNotifyOnCreation() != null && config.getNotifyOnCreation()) {
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
                        String emailSubject = "Nouvelle tâche assignée : " + task.getName();
                        String processName = extractProcessDefinitionKey(task.getProcessDefinitionId());
                        try {
                            ProcessDefinition pd = repositoryService
                                    .createProcessDefinitionQuery()
                                    .processDefinitionId(task.getProcessDefinitionId())
                                    .singleResult();
                            if (pd != null && pd.getName() != null && !pd.getName().isEmpty()) {
                                processName = pd.getName();
                            }
                        } catch (Exception exProc) {
                            log.warn("Unable to fetch process name for active task {}: {}", task.getId(), exProc.getMessage());
                        }
                        
                        // Format de la date d'échéance pour l'affichage
                        String formattedDueDate = null;
                        if (task.getDueDate() != null) {
                            formattedDueDate = task.getDueDate().toInstant()
                                .atZone(ZoneId.systemDefault())
                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                        }
                        
                        // Récupérer la criticité et les instructions de travail
                        String criticality = config != null ? config.getCriticality() : null;
                        String workInstructions = config != null ? config.getWorkInstructions() : null;
                        
                        // URL d'action (remplacer par l'URL réelle de votre application)
                        String actionUrl = "http://localhost:5173/tasks/" + task.getId();
                        
                        // Résoudre l'identité applicative et l'email réel du destinataire
                        String appUserId = resolveAppUserId(task.getAssignee());
                        String recipientName = appUserId;
                        String recipientEmail = appUserId;
                        try {
                            java.util.Optional<UserEntity> userOpt = java.util.Optional.empty();
                            if (appUserId != null && !appUserId.isEmpty()) {
                                if (appUserId.contains("@")) {
                                    // appUserId looks like an email
                                    recipientEmail = appUserId;
                                    userOpt = userRepository.findByEmail(appUserId);
                                } else {
                                    // try by username first
                                    userOpt = userRepository.findByUsername(appUserId);
                                }

                                if (userOpt.isPresent()) {
                                    UserEntity u = userOpt.get();
                                    if (u.getEmail() != null && !u.getEmail().isEmpty()) {
                                        recipientEmail = u.getEmail();
                                    }
                                    String fn = u.getFirstName();
                                    String ln = u.getLastName();
                                    if (fn != null && !fn.isEmpty()) {
                                        recipientName = (ln != null && !ln.isEmpty()) ? fn + " " + ln : fn;
                                    }
                                } else if (!appUserId.contains("@")) {
                                    // Fallback: conserver l'ancien comportement si appUserId n'est pas un email
                                    recipientEmail = appUserId + "@company.com"; // TODO: externaliser domaine via application.yml
                                }
                            }
                        } catch (Exception ex) {
                            log.warn("Could not resolve real email for assignee {}: {}", appUserId, ex.getMessage());
                            if (appUserId != null && !appUserId.contains("@")) {
                                recipientEmail = appUserId + "@company.com";
                            }
                        }

                        Optional<UserEntity> userOpt = userRepository.findById(Long.valueOf(appUserId));
                        // Générer le contenu HTML de l'email avec un nom affichable
                        String htmlContent = EmailTemplateUtil.createAssignmentEmailTemplate(
                                userOpt.get().getFirstName() + " " + userOpt.get().getLastName(), // Nom du destinataire
                                task.getName(), // Nom de la tâche
                                task.getId(), // ID de la tâche
                                processName, // Nom du processus
                                userOpt.get().getEmail(), // Personne assignée (ID applicatif)
                                formattedDueDate, // Date d'échéance formatée
                                criticality, // Criticité
                                workInstructions, // Instructions de travail
                                actionUrl // URL d'action
                        );

                        // Envoyer l'email HTML au vrai destinataire
                        sendHtmlEmailNotification(userOpt.get().getEmail(), emailSubject, htmlContent);
                        
                        
                    }
                }
                
                // Send to candidate groups - using TaskService to get candidate groups
                // Note: In a real implementation, you would query TaskService for candidate groups
                // For now, we'll send a general group notification if no specific assignee
                if (task.getAssignee() == null) {
                    messagingTemplate.convertAndSend("/topic/group-notifications", notification);
                }
                
                log.info("Sent task assignment notification for task: {}", task.getId());
            // }
        } catch (Exception e) {
            log.error("Error sending task assignment notification", e);
        }
    }

    /**
     * Send WebSocket notification for task completion
     */
    @Async
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
            
            // Récupérer les informations de la tâche pour l'email (si disponible)
            try {
                // Tenter de récupérer plus d'informations sur la tâche complétée si possible
                String emailSubject = "Tâche complétée";
                String taskName = "Tâche #" + taskId; // fallback
                try {
                    HistoricTaskInstance hti = historyService
                            .createHistoricTaskInstanceQuery()
                            .taskId(taskId)
                            .singleResult();
                    if (hti != null && hti.getName() != null && !hti.getName().isEmpty()) {
                        taskName = hti.getName();
                    }
                } catch (Exception nameEx) {
                    log.warn("Unable to fetch task name from history for {}: {}", taskId, nameEx.getMessage());
                }
                String processName = "Processus"; // fallback
                try {
                    HistoricTaskInstance htiForProc = historyService
                            .createHistoricTaskInstanceQuery()
                            .taskId(taskId)
                            .singleResult();
                    if (htiForProc != null && htiForProc.getProcessDefinitionId() != null) {
                        ProcessDefinition pd = repositoryService
                                .createProcessDefinitionQuery()
                                .processDefinitionId(htiForProc.getProcessDefinitionId())
                                .singleResult();
                        if (pd != null && pd.getName() != null && !pd.getName().isEmpty()) {
                            processName = pd.getName();
                        }
                    }
                } catch (Exception pnEx) {
                    log.warn("Unable to fetch process name from repository for task {}: {}", taskId, pnEx.getMessage());
                }
                
                // Format de la date de complétion
                String completionDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                
                // URL d'action (remplacer par l'URL réelle de votre application)
                String actionUrl = "#";

                // Persist a completion notification for the user triggering completion (optional)
                try {
                    String recipientUserId = resolveAppUserId(userId);
                    String title = "Tâche complétée";
                    String message = "La tâche '" + taskName + "' a été complétée.";
                    saveNotification(recipientUserId, title, message, NotificationType.TASK_COMPLETED,
                            NotificationPriority.NORMAL, taskId, "TaskInstance", actionUrl);
                } catch (Exception ex) {
                    log.warn("Failed to persist completion notification for task {}: {}", taskId, ex.getMessage());
                }
                Optional<UserEntity> user = userRepository.findById(Long.valueOf(userId));
                // Générer le contenu HTML de l'email
                String htmlContent = EmailTemplateUtil.createCompletionEmailTemplate(
                        user.get().getFirstName()+' '+user.get().getLastName(), // Nom du destinataire
                        taskName, // Nom de la tâche
                        taskId, // ID de la tâche
                        processName, // Nom du processus
                        userId, // Personne qui a complété la tâche
                        completionDate, // Date de complétion
                        actionUrl // URL d'action
                );
                
                // Envoyer l'email HTML
                sendHtmlEmailNotification(user.get().getEmail(), emailSubject, htmlContent);
                
                log.info("Sent task completion HTML email notification to: {}", userId);
            } catch (Exception emailEx) {
                log.error("Error sending completion email notification", emailEx);
                // Ne pas propager l'erreur d'email pour ne pas bloquer le flux principal
            }
            
            log.info("Sent task completion notification for task: {}", taskId);
        } catch (Exception e) {
            log.error("Error sending task completion notification", e);
        }
    }

    /**
     * Send deadline reminder notifications
     */
    @Async
    public void sendDeadlineReminder(Task task) {
        try {
            TaskConfiguration config = getTaskConfiguration(task);
            
            if (config != null && config.getNotifyOnDeadline() != null && config.getNotifyOnDeadline()) {
                Map<String, Object> notification = createTaskNotification(task, "DEADLINE_REMINDER", config);
                
                if (task.getAssignee() != null) {
                    // Persist deadline reminder for recipient
                    try {
                        String recipientUserId = resolveAppUserId(task.getAssignee());
                        String title = "Rappel d'échéance : " + task.getName();
                        String message = "La tâche '" + task.getName() + "' approche de son échéance.";
                        String actionUrl = "http://localhost:4200/tasks/" + task.getId();
                        saveNotification(recipientUserId, title, message, NotificationType.DEADLINE_REMINDER,
                                NotificationPriority.HIGH, task.getId(), "TaskInstance", actionUrl);
                    } catch (Exception ex) {
                        log.warn("Failed to persist deadline notification for task {}: {}", task.getId(), ex.getMessage());
                    }
                    messagingTemplate.convertAndSendToUser(
                        task.getAssignee(), 
                        "/queue/notifications", 
                        notification
                    );
                    
                    // Send email reminder
                    if (shouldSendEmailNotification(config)) {
                        String emailSubject = "Rappel d'échéance : " + task.getName();
                        String processName = extractProcessDefinitionKey(task.getProcessDefinitionId());
                        
                        // Format de la date d'échéance pour l'affichage
                        String formattedDueDate = null;
                        if (task.getDueDate() != null) {
                            formattedDueDate = task.getDueDate().toInstant()
                                .atZone(ZoneId.systemDefault())
                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                        }
                        
                        // Récupérer la criticité et les instructions de travail
                        String criticality = config != null ? config.getCriticality() : null;
                        String workInstructions = config != null ? config.getWorkInstructions() : null;
                        
                        // URL d'action (remplacer par l'URL réelle de votre application)
                        String actionUrl = "http://localhost:4200/tasks/" + task.getId();
                        
                        // Générer le contenu HTML de l'email
                        String htmlContent = EmailTemplateUtil.createDeadlineReminderEmailTemplate(
                                task.getAssignee(), // Nom du destinataire
                                task.getName(), // Nom de la tâche
                                task.getId(), // ID de la tâche
                                processName, // Nom du processus
                                task.getAssignee(), // Personne assignée
                                formattedDueDate, // Date d'échéance formatée
                                criticality, // Criticité
                                workInstructions, // Instructions de travail
                                actionUrl // URL d'action
                        );
                        
                        // Envoyer l'email HTML
                        sendHtmlEmailNotification(task.getAssignee(), emailSubject, htmlContent);
                        
                       
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
    @Async
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
        //     return config.getNotificationType() == null && 
        //            (config.getNotificationType().contains("email") || !config.getNotificationType().contains("both"));
        return true;
    }

    // Helpers de persistance
    private String resolveAppUserId(String id) {
        if (id == null) return null;
        Optional<CamundaIdMapping> mapping = camundaIdMappingRepository.findByCamundaId(id);
        return mapping.map(CamundaIdMapping::getOriginalId).orElse(id);
    }

    private void saveNotification(
            String recipientUserId,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            String sourceId,
            String sourceType,
            String actionUrl
    ) {
        if (recipientUserId == null) return;
        Notification entity = Notification.builder()
                .recipientUserId(recipientUserId)
                .title(title)
                .message(message)
                .type(type)
                .priority(priority)
                .status(NotificationStatus.UNREAD)
                .creationDate(LocalDateTime.now())
                .sourceId(sourceId)
                .sourceType(sourceType)
                .actionUrl(actionUrl)
                .build();
        notificationRepository.save(entity);
    }

    /**
     * Envoie une notification par email à un destinataire (format texte simple)
     * 
     * @param recipient Le destinataire de l'email (ID utilisateur ou adresse email complète)
     * @param subject Le sujet de l'email
     * @param message Le contenu de l'email
     */
    @Async
    public void sendEmailNotification(String recipient, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            
            // Vérifier si le destinataire est déjà une adresse email complète
            String emailAddress;
            if (recipient.contains("@")) {
                emailAddress = recipient;
            } else {
                // Sinon, considérer qu'il s'agit d'un ID utilisateur et ajouter le domaine
                emailAddress = recipient + "@company.com"; // Ajuster le domaine selon vos besoins
            }
            
            mailMessage.setTo(emailAddress);
            mailMessage.setSubject("[Harmony Services] " + subject);
            
            // Ajouter un en-tête et un pied de page au message
            String formattedMessage = 
                "Bonjour,\n\n" +
                message + "\n\n" +
                "Ceci est un message automatique, merci de ne pas y répondre.\n" +
                "Harmony Services - " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            mailMessage.setText(formattedMessage);
            mailMessage.setFrom("noreply@kufulis.com");
            
            // Logs détaillés avant l'envoi
            System.out.println("=== DÉBUT ENVOI EMAIL ====");
            System.out.println("Destinataire: " + emailAddress);
            System.out.println("Sujet: " + mailMessage.getSubject());
            System.out.println("De: " + mailMessage.getFrom());
            System.out.println("Configuration serveur: " + mailSender.toString());
            
            // Envoi de l'email
            mailSender.send(mailMessage);
            
            System.out.println("Email envoyé avec succès!");
            System.out.println("=== FIN ENVOI EMAIL ====");
            
            log.info("Email notification sent to: {}", emailAddress);
        } catch (Exception e) {
            System.out.println("=== ERREUR ENVOI EMAIL ====");
            System.out.println("Message d'erreur: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== FIN ERREUR EMAIL ====");
            
            log.error("Error sending email notification to: " + recipient, e);
        }
    }
    
    /**
     * Envoie une notification par email HTML à un destinataire
     * 
     * @param recipient Le destinataire de l'email (ID utilisateur ou adresse email complète)
     * @param subject Le sujet de l'email
     * @param htmlContent Le contenu HTML de l'email
     */
    @Async
    public void sendHtmlEmailNotification(String recipient, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            String emailAddress;
            if (recipient.contains("@")) {
                emailAddress = recipient;
            } else {
                emailAddress = recipient + "@company.com"; // Ajuster le domaine selon vos besoins
            }
            
            helper.setTo(emailAddress);
            helper.setSubject("Harmony App " + subject);
            helper.setText(htmlContent, true); // true indique que c'est du HTML
            helper.setFrom("noreply@kufulis.com");
            
            // Logs détaillés avant l'envoi
            System.out.println("=== DÉBUT ENVOI EMAIL HTML ====");
            System.out.println("Destinataire: " + emailAddress);
            System.out.println("Sujet: " + subject);
            System.out.println("Format: HTML");
            System.out.println("Configuration serveur: " + mailSender.toString());
            
            // Envoi de l'email
            mailSender.send(mimeMessage);
            
            System.out.println("Email HTML envoyé avec succès!");
            System.out.println("=== FIN ENVOI EMAIL HTML ====");
            
            log.info("HTML email notification sent to: {}", emailAddress);
        } catch (MessagingException e) {
            System.out.println("=== ERREUR ENVOI EMAIL HTML ====");
            System.out.println("Message d'erreur: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== FIN ERREUR EMAIL HTML ====");
            
            log.error("Error sending HTML email notification to: " + recipient, e);
        }
    }
}
