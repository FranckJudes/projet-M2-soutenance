package com.harmony.harmoniservices.utils;

import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Utilitaire pour la gestion des templates d'emails HTML
 */
public class EmailTemplateUtil {

    private static final String TEMPLATE_PATH = "templates/email-template.html";
    
    /**
     * Charge le template HTML depuis les ressources
     * 
     * @return Le contenu du template HTML
     * @throws IOException Si le template ne peut pas être chargé
     */
    private static String loadTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            return FileCopyUtils.copyToString(reader);
        }
    }
    
    /**
     * Remplace les placeholders dans le template HTML avec les valeurs fournies
     * 
     * @param templateVars Map contenant les paires clé-valeur pour le remplacement
     * @return Le template HTML avec les variables remplacées
     */
    public static String processTemplate(Map<String, String> templateVars) {
        try {
            String template = loadTemplate();
            
            // Ajouter automatiquement l'année courante et le timestamp
            templateVars.put("CURRENT_YEAR", String.valueOf(LocalDateTime.now().getYear()));
            templateVars.put("TIMESTAMP", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            
            // Remplacer toutes les variables dans le template
            for (Map.Entry<String, String> entry : templateVars.entrySet()) {
                String placeholder = "[[" + entry.getKey() + "]]";
                String value = entry.getValue() != null ? entry.getValue() : "";
                template = template.replace(placeholder, value);
            }
            
            return template;
        } catch (IOException e) {
            // En cas d'erreur, retourner un message simple
            return "Impossible de charger le template d'email. Erreur: " + e.getMessage();
        }
    }
    
    /**
     * Crée un template pour une notification d'assignation de tâche
     * 
     * @param recipientName Nom du destinataire
     * @param taskName Nom de la tâche
     * @param taskId ID de la tâche
     * @param processName Nom du processus
     * @param assignee Personne assignée
     * @param dueDate Date d'échéance (peut être null)
     * @param criticality Criticité (peut être null)
     * @param workInstructions Instructions de travail (peut être null)
     * @param actionUrl URL d'action pour le bouton
     * @return Le template HTML complété
     */
    public static String createAssignmentEmailTemplate(
            String recipientName, 
            String taskName, 
            String taskId, 
            String processName, 
            String assignee, 
            String dueDate, 
            String criticality, 
            String workInstructions, 
            String actionUrl) {
        
        Map<String, String> templateVars = new HashMap<>();
        templateVars.put("RECIPIENT_NAME", recipientName);
        templateVars.put("MAIN_MESSAGE", "Une nouvelle tâche vous a été assignée dans le système Harmony.");
        templateVars.put("TASK_TITLE", taskName);
        templateVars.put("TASK_ID", taskId);
        templateVars.put("PROCESS_NAME", processName);
        templateVars.put("ASSIGNEE", assignee);
        templateVars.put("ACTION_URL", actionUrl != null ? actionUrl : "#");
        templateVars.put("NOTIFICATION_TYPE", "notification-assigned");
        
        // Informations conditionnelles
        if (dueDate != null && !dueDate.isEmpty()) {
            templateVars.put("DEADLINE_INFO", "<p><span class=\"label\">Date d'échéance:</span> " + dueDate + "</p>");
        } else {
            templateVars.put("DEADLINE_INFO", "");
        }
        
        if (criticality != null && !criticality.isEmpty()) {
            String criticalityClass = "criticality-medium";
            if ("high".equalsIgnoreCase(criticality)) {
                criticalityClass = "criticality-high";
            } else if ("low".equalsIgnoreCase(criticality)) {
                criticalityClass = "criticality-low";
            }
            
            templateVars.put("CRITICALITY_INFO", "<p><span class=\"label\">Criticité:</span> <span class=\"" + 
                    criticalityClass + "\">" + criticality + "</span></p>");
        } else {
            templateVars.put("CRITICALITY_INFO", "");
        }
        
        if (workInstructions != null && !workInstructions.isEmpty()) {
            templateVars.put("WORK_INSTRUCTIONS", 
                    "<div class=\"message\">" +
                    "<h3>Instructions de travail:</h3>" +
                    "<p>" + workInstructions.replace("\n", "<br>") + "</p>" +
                    "</div>");
        } else {
            templateVars.put("WORK_INSTRUCTIONS", "");
        }
        
        return processTemplate(templateVars);
    }
    
    /**
     * Crée un template pour une notification de rappel d'échéance
     * 
     * @param recipientName Nom du destinataire
     * @param taskName Nom de la tâche
     * @param taskId ID de la tâche
     * @param processName Nom du processus
     * @param assignee Personne assignée
     * @param dueDate Date d'échéance (peut être null)
     * @param criticality Criticité (peut être null)
     * @param workInstructions Instructions de travail (peut être null)
     * @param actionUrl URL d'action pour le bouton
     * @return Le template HTML complété
     */
    public static String createDeadlineReminderEmailTemplate(
            String recipientName, 
            String taskName, 
            String taskId, 
            String processName, 
            String assignee, 
            String dueDate, 
            String criticality, 
            String workInstructions, 
            String actionUrl) {
        
        Map<String, String> templateVars = new HashMap<>();
        templateVars.put("RECIPIENT_NAME", recipientName);
        templateVars.put("MAIN_MESSAGE", "Rappel important concernant une tâche qui approche de son échéance.");
        templateVars.put("TASK_TITLE", "RAPPEL : " + taskName);
        templateVars.put("TASK_ID", taskId);
        templateVars.put("PROCESS_NAME", processName);
        templateVars.put("ASSIGNEE", assignee);
        templateVars.put("ACTION_URL", actionUrl != null ? actionUrl : "#");
        templateVars.put("NOTIFICATION_TYPE", "notification-deadline");
        
        // Informations conditionnelles
        if (dueDate != null && !dueDate.isEmpty()) {
            templateVars.put("DEADLINE_INFO", "<p><span class=\"label\">Date d'échéance:</span> <strong>" + dueDate + "</strong></p>");
        } else {
            templateVars.put("DEADLINE_INFO", "");
        }
        
        if (criticality != null && !criticality.isEmpty()) {
            String criticalityClass = "criticality-medium";
            if ("high".equalsIgnoreCase(criticality)) {
                criticalityClass = "criticality-high";
            } else if ("low".equalsIgnoreCase(criticality)) {
                criticalityClass = "criticality-low";
            }
            
            templateVars.put("CRITICALITY_INFO", "<p><span class=\"label\">Criticité:</span> <span class=\"" + 
                    criticalityClass + "\">" + criticality + "</span></p>");
        } else {
            templateVars.put("CRITICALITY_INFO", "");
        }
        
        if (workInstructions != null && !workInstructions.isEmpty()) {
            templateVars.put("WORK_INSTRUCTIONS", 
                    "<div class=\"message\">" +
                    "<h3>Instructions de travail:</h3>" +
                    "<p>" + workInstructions.replace("\n", "<br>") + "</p>" +
                    "</div>");
        } else {
            templateVars.put("WORK_INSTRUCTIONS", "");
        }
        
        return processTemplate(templateVars);
    }
    
    /**
     * Crée un template pour une notification de complétion de tâche
     * 
     * @param recipientName Nom du destinataire
     * @param taskName Nom de la tâche (peut être null)
     * @param taskId ID de la tâche
     * @param processName Nom du processus (peut être null)
     * @param completedBy Personne qui a complété la tâche
     * @param completionDate Date de complétion
     * @param actionUrl URL d'action pour le bouton (peut être null)
     * @return Le template HTML complété
     */
    public static String createCompletionEmailTemplate(
            String recipientName, 
            String taskName, 
            String taskId, 
            String processName, 
            String completedBy, 
            String completionDate, 
            String actionUrl) {
        
        Map<String, String> templateVars = new HashMap<>();
        templateVars.put("RECIPIENT_NAME", recipientName);
        templateVars.put("MAIN_MESSAGE", "Une tâche a été complétée avec succès.");
        templateVars.put("TASK_TITLE", taskName != null ? "Tâche complétée : " + taskName : "Tâche complétée");
        templateVars.put("TASK_ID", taskId);
        templateVars.put("PROCESS_NAME", processName != null ? processName : "");
        templateVars.put("ASSIGNEE", completedBy);
        templateVars.put("ACTION_URL", actionUrl != null ? actionUrl : "#");
        templateVars.put("NOTIFICATION_TYPE", "notification-completed");
        
        // Informations spécifiques à la complétion
        templateVars.put("DEADLINE_INFO", "<p><span class=\"label\">Complétée par:</span> " + completedBy + "</p>" +
                "<p><span class=\"label\">Date de complétion:</span> " + completionDate + "</p>");
        templateVars.put("CRITICALITY_INFO", "");
        templateVars.put("WORK_INSTRUCTIONS", "");
        
        return processTemplate(templateVars);
    }
}
