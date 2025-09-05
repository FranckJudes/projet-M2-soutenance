package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.TaskConfiguration;
import com.harmony.harmoniservices.repository.TaskConfigurationRepository;
import com.harmony.harmoniservices.utils.EmailTemplateUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.task.Task;
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
    @Async
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
                        String emailSubject = "Nouvelle tâche assignée : " + task.getName();
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
                        String actionUrl = "http://localhost:5173/tasks/" + task.getId();
                        
                        // Générer le contenu HTML de l'email
                        String htmlContent = EmailTemplateUtil.createAssignmentEmailTemplate(
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
                        
                        // Garder aussi l'email texte comme fallback si besoin
                        StringBuilder emailContent = new StringBuilder();
                        emailContent.append("Une nouvelle tâche vous a été assignée dans le système Harmony.\n\n");
                        emailContent.append("Détails de la tâche :\n");
                        emailContent.append("- Nom : ").append(task.getName()).append("\n");
                        emailContent.append("- ID : ").append(task.getId()).append("\n");
                        emailContent.append("- Processus : ").append(processName).append("\n");
                        
                        if (formattedDueDate != null) {
                            emailContent.append("- Date d'échéance : ").append(formattedDueDate).append("\n");
                        }
                        
                        if (workInstructions != null) {
                            emailContent.append("\nInstructions de travail :\n").append(workInstructions).append("\n");
                        }
                        
                        emailContent.append("\nVeuillez vous connecter au système pour traiter cette tâche.");
                        
                        // Commenter cette ligne pour n'envoyer que l'email HTML
                        // sendEmailNotification(task.getAssignee(), emailSubject, emailContent.toString());
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
                String taskName = "Tâche #" + taskId; // Nom par défaut si on ne peut pas récupérer le vrai nom
                String processName = "Processus"; // Nom par défaut
                
                // Format de la date de complétion
                String completionDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                
                // URL d'action (remplacer par l'URL réelle de votre application)
                String actionUrl = "http://192.168.43.171:4200/history/" + taskId;
                
                // Générer le contenu HTML de l'email
                String htmlContent = EmailTemplateUtil.createCompletionEmailTemplate(
                        userId, // Nom du destinataire
                        taskName, // Nom de la tâche
                        taskId, // ID de la tâche
                        processName, // Nom du processus
                        userId, // Personne qui a complété la tâche
                        completionDate, // Date de complétion
                        actionUrl // URL d'action
                );
                
                // Envoyer l'email HTML
                sendHtmlEmailNotification(userId, emailSubject, htmlContent);
                
                // Version texte comme fallback (commentée)
                StringBuilder emailContent = new StringBuilder();
                emailContent.append("Une tâche a été complétée avec succès.\n\n");
                emailContent.append("Détails de la tâche complétée :\n");
                emailContent.append("- ID de la tâche : ").append(taskId).append("\n");
                emailContent.append("- Complétée par : ").append(userId).append("\n");
                emailContent.append("- Date de complétion : ").append(completionDate).append("\n");
                
                // Commenter cette ligne pour n'envoyer que l'email HTML
                // sendEmailNotification(userId, emailSubject, emailContent.toString());
                
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
                        
                        // Version texte comme fallback (commentée)
                        StringBuilder emailContent = new StringBuilder();
                        emailContent.append("Rappel important concernant une tâche qui approche de son échéance.\n\n");
                        emailContent.append("Détails de la tâche en retard :\n");
                        emailContent.append("- Nom : ").append(task.getName()).append("\n");
                        emailContent.append("- ID : ").append(task.getId()).append("\n");
                        emailContent.append("- Processus : ").append(processName).append("\n");
                        
                        if (formattedDueDate != null) {
                            emailContent.append("- Date d'échéance : ").append(formattedDueDate).append("\n");
                        }
                        
                        if (criticality != null) {
                            emailContent.append("- Criticité : ").append(criticality).append("\n");
                        }
                        
                        if (workInstructions != null) {
                            emailContent.append("\nInstructions de travail :\n").append(workInstructions).append("\n");
                        }
                        
                        emailContent.append("\nVeuillez traiter cette tâche dès que possible pour éviter tout retard dans le processus.");
                        
                        // Commenter cette ligne pour n'envoyer que l'email HTML
                        // sendEmailNotification(task.getAssignee(), emailSubject, emailContent.toString());
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
            
            // Vérifier si le destinataire est déjà une adresse email complète
            String emailAddress;
            if (recipient.contains("@")) {
                emailAddress = recipient;
            } else {
                // Sinon, considérer qu'il s'agit d'un ID utilisateur et ajouter le domaine
                emailAddress = recipient + "@company.com"; // Ajuster le domaine selon vos besoins
            }
            
            helper.setTo(emailAddress);
            helper.setSubject("[Harmony Services] " + subject);
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
