package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.models.TaskConfiguration;
import com.harmony.harmoniservices.models.EntiteOrganisation;
import com.harmony.harmoniservices.models.GroupeEntity;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.models.TaskConfiguration.ConditionEntry;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper for converting between frontend task configuration data and backend TaskConfiguration entity
 */
public class TaskConfigurationMapper {

    /**
     * Maps frontend data to a TaskConfiguration entity
     * 
     * @param taskId The ID of the task
     * @param taskName The name of the task
     * @param taskType The type of the task
     * @param informationData Information general data
     * @param resourceData Resource data
     * @param habilitationData Habilitation data
     * @param planificationData Planification data
     * @param conditionData Condition data
     * @param notificationData Notification data
     * @return TaskConfiguration entity
     */
    public static TaskConfiguration toEntity(
            String taskId,
            String taskName,
            String taskType,
            Map<String, Object> informationData,
            Map<String, Object> resourceData,
            Map<String, Object> habilitationData,
            Map<String, Object> planificationData,
            Map<String, Object> conditionData,
            Map<String, Object> notificationData) {
        
        TaskConfiguration config = new TaskConfiguration();
        config.setTaskId(taskId);
        config.setTaskName(taskName);
        config.setTaskType(taskType);
        
        // Map Information General data
        if (informationData != null) {
            config.setBoard((String) informationData.get("board"));
            config.setWorkInstructions((String) informationData.get("workInstructions"));
            config.setExpectedDeliverable((String) informationData.get("expectedDeliverable"));
            config.setCategory((String) informationData.get("category"));
        }
        
        // Map Resource data
        if (resourceData != null) {
            config.setAttachmentsEnabled((Boolean) resourceData.get("attachmentsEnabled"));
            config.setAttachmentType((String) resourceData.get("attachmentType"));
            config.setSecurityLevel((String) resourceData.get("securityLevel"));
            config.setExternalTools((String) resourceData.get("externalTools"));
            config.setLinkToOtherTask((String) resourceData.get("linkToOtherTask"));
            config.setScriptBusinessRule((Boolean) resourceData.get("scriptBusinessRule"));
            config.setAddFormResource((Boolean) resourceData.get("addFormResource"));
            
            // Common actions
            config.setArchiveAttachment((Boolean) resourceData.get("archiveAttachment"));
            config.setShareArchivePdf((Boolean) resourceData.get("shareArchivePdf"));
            config.setDescribeFolderDoc((Boolean) resourceData.get("describeFolderDoc"));
            config.setDeleteAttachmentDoc((Boolean) resourceData.get("deleteAttachmentDoc"));
            config.setConsultAttachmentDoc((Boolean) resourceData.get("consultAttachmentDoc"));
            config.setDownloadZip((Boolean) resourceData.get("downloadZip"));
            
            // Document-specific actions
            config.setImportAttachment((Boolean) resourceData.get("importAttachment"));
            config.setEditAttachment((Boolean) resourceData.get("editAttachment"));
            config.setAnnotateDocument((Boolean) resourceData.get("annotateDocument"));
            config.setVerifyAttachmentDoc((Boolean) resourceData.get("verifyAttachmentDoc"));
            config.setSearchInDocument((Boolean) resourceData.get("searchInDocument"));
            config.setRemoveDocument((Boolean) resourceData.get("removeDocument"));
            config.setAddNewAttachment((Boolean) resourceData.get("addNewAttachment"));
            config.setConvertAttachmentPdf((Boolean) resourceData.get("convertAttachmentPdf"));
            config.setDownloadAttachmentPdf((Boolean) resourceData.get("downloadAttachmentPdf"));
            config.setDownloadOriginalFormat((Boolean) resourceData.get("downloadOriginalFormat"));
        }
        
        // Map Habilitation data
        if (habilitationData != null) {
            // These fields require entity lookup from the database
            // In a real implementation, you would need to fetch these entities from repositories
            config.setAssigneeType((String) habilitationData.get("assigneeType"));
            config.setReturnAllowed((Boolean) habilitationData.get("returnAllowed"));
            
            // Note: These would need to be actual entities fetched from repositories
            // For now, we're just setting them as null
            // In a real implementation, you would use IDs to fetch the entities
        }
        
        // Map Planification data
        if (planificationData != null) {
            config.setAllDay((Boolean) planificationData.get("allDay"));
            config.setDurationValue((Integer) planificationData.get("durationValue"));
            config.setDurationUnit((String) planificationData.get("durationUnit"));
            config.setCriticality((String) planificationData.get("criticality"));
            config.setPriority((String) planificationData.get("priority"));
            config.setViewHistoryEnabled((Boolean) planificationData.get("viewHistoryEnabled"));
            
            // KPIs
            config.setKpiTasksProcessed((Boolean) planificationData.get("kpiTasksProcessed"));
            config.setKpiReturnRate((Boolean) planificationData.get("kpiReturnRate"));
            config.setKpiAvgInteractions((Boolean) planificationData.get("kpiAvgInteractions"));
            config.setKpiDeadlineCompliance((Boolean) planificationData.get("kpiDeadlineCompliance"));
            config.setKpiValidationWaitTime((Boolean) planificationData.get("kpiValidationWaitTime"));
            config.setKpiPriorityCompliance((Boolean) planificationData.get("kpiPriorityCompliance"));
            config.setKpiEmergencyManagement((Boolean) planificationData.get("kpiEmergencyManagement"));
            
            // Alternative actions
            config.setNotifySupervisor((Boolean) planificationData.get("notifierSuperviseur"));
            config.setReassignTask((Boolean) planificationData.get("reassignerTache"));
            config.setSendReminder((Boolean) planificationData.get("envoyerRappel"));
            config.setHierarchicalEscalation((Boolean) planificationData.get("escaladeHierarchique"));
            config.setChangePriority((Boolean) planificationData.get("changementPriorite"));
            config.setBlockWorkflow((Boolean) planificationData.get("bloquerWorkflow"));
            config.setGenerateTeamAlert((Boolean) planificationData.get("genererAlerteEquipe"));
            config.setRequestJustification((Boolean) planificationData.get("demanderJustification"));
            config.setActivateCorrectiveAction((Boolean) planificationData.get("activerActionCorrective"));
            config.setExternalEscalation((Boolean) planificationData.get("escaladeExterne"));
            config.setCloseDefault((Boolean) planificationData.get("cloturerDefaut"));
            config.setKpiMonitoring((Boolean) planificationData.get("suiviParKpi"));
            config.setPlanBOrAlternativeTask((Boolean) planificationData.get("planBOuTacheAlternative"));
        }
        
        // Map Condition data
        if (conditionData != null) {
            config.setEntryConditionsEnabled((Boolean) conditionData.get("showEntryTable"));
            config.setOutputConditionsEnabled((Boolean) conditionData.get("showOutputTable"));
            
            // Entry conditions
            if (conditionData.get("entryConditions") instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> entryConditionsList = (List<Map<String, String>>) conditionData.get("entryConditions");
                List<ConditionEntry> entryConditions = entryConditionsList.stream()
                    .map(item -> new ConditionEntry(
                        item.get("name"),
                        item.get("position"),
                        item.get("value")
                    ))
                    .collect(Collectors.toList());
                config.setEntryConditions(entryConditions);
            } else {
                config.setEntryConditions(new ArrayList<>());
            }
            
            // Output conditions
            if (conditionData.get("outputConditions") instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> outputConditionsList = (List<Map<String, String>>) conditionData.get("outputConditions");
                List<ConditionEntry> outputConditions = outputConditionsList.stream()
                    .map(item -> new ConditionEntry(
                        item.get("name"),
                        item.get("position"),
                        item.get("value")
                    ))
                    .collect(Collectors.toList());
                config.setOutputConditions(outputConditions);
            } else {
                config.setOutputConditions(new ArrayList<>());
            }
        }
        
        // Map Notification data
        if (notificationData != null) {
            config.setNotifyOnCreation((Boolean) notificationData.get("notifyOnCreation"));
            config.setNotifyOnDeadline((Boolean) notificationData.get("notifyOnDeadline"));
            config.setReminderBeforeDeadline((Integer) notificationData.get("reminderBeforeDeadline"));
            config.setNotificationSensitivity((String) notificationData.get("notificationSensitivity"));
            
            // Selected reminders
            if (notificationData.get("selectedReminders") instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> remindersList = (List<Map<String, String>>) notificationData.get("selectedReminders");
                List<String> reminders = remindersList.stream()
                    .map(item -> item.get("value"))
                    .collect(Collectors.toList());
                config.setSelectedReminders(reminders);
            } else {
                config.setSelectedReminders(new ArrayList<>());
            }
        }
        
        return config;
    }

    /**
     * Maps a TaskConfiguration entity to frontend data
     * 
     * @param config The TaskConfiguration entity
     * @return Map containing all the frontend data
     */
    // public static Map<String, Object> toFrontend(TaskConfiguration config) {
    //     Map<String, Object> result = Map.of(
    //         "taskId", config.getTaskId(),
    //         "taskName", config.getTaskName(),
    //         "taskType", config.getTaskType(),
            
    //         // Information General
    //         "information", Map.of(
    //             "board", config.getBoard(),
    //             "workInstructions", config.getWorkInstructions(),
    //             "expectedDeliverable", config.getExpectedDeliverable(),
    //             "category", config.getCategory()
    //         ),
            
    //         // Resource
    //         "resource", Map.of(
    //             "attachmentsEnabled", config.getAttachmentsEnabled(),
    //             "attachmentType", config.getAttachmentType(),
    //             "securityLevel", config.getSecurityLevel(),
    //             "externalTools", config.getExternalTools(),
    //             "linkToOtherTask", config.getLinkToOtherTask(),
    //             "scriptBusinessRule", config.getScriptBusinessRule(),
    //             "addFormResource", config.getAddFormResource(),
                
    //             // Common actions
    //             "archiveAttachment", config.getArchiveAttachment(),
    //             "shareArchivePdf", config.getShareArchivePdf(),
    //             "describeFolderDoc", config.getDescribeFolderDoc(),
    //             "deleteAttachmentDoc", config.getDeleteAttachmentDoc(),
    //             "consultAttachmentDoc", config.getConsultAttachmentDoc(),
    //             "downloadZip", config.getDownloadZip(),
                
    //             // Document-specific actions
    //             "importAttachment", config.getImportAttachment(),
    //             "editAttachment", config.getEditAttachment(),
    //             "annotateDocument", config.getAnnotateDocument(),
    //             "verifyAttachmentDoc", config.getVerifyAttachmentDoc(),
    //             "searchInDocument", config.getSearchInDocument(),
    //             "removeDocument", config.getRemoveDocument(),
    //             "addNewAttachment", config.getAddNewAttachment(),
    //             "convertAttachmentPdf", config.getConvertAttachmentPdf(),
    //             "downloadAttachmentPdf", config.getDownloadAttachmentPdf(),
    //             "downloadOriginalFormat", config.getDownloadOriginalFormat()
    //         ),
            
    //         // Habilitation
    //         "habilitation", Map.of(
    //             "assigneeType", config.getAssigneeType(),
    //             "returnAllowed", config.getReturnAllowed(),
    //             "assignedEntityId", config.getAssignedEntity() != null ? config.getAssignedEntity().getId() : null,
    //             "assignedUserId", config.getAssignedUser() != null ? config.getAssignedUser().getId() : null,
    //             "assignedGroupId", config.getAssignedGroup() != null ? config.getAssignedGroup().getId() : null,
    //             "responsibleUserId", config.getResponsibleUser() != null ? config.getResponsibleUser().getId() : null,
    //             "interestedUserId", config.getInterestedUser() != null ? config.getInterestedUser().getId() : null
    //         ),
            
    //         // Planification
    //         "planification", Map.of(
    //             "allDay", config.getAllDay(),
    //             "durationValue", config.getDurationValue(),
    //             "durationUnit", config.getDurationUnit(),
    //             "criticality", config.getCriticality(),
    //             "priority", config.getPriority(),
    //             "viewHistoryEnabled", config.getViewHistoryEnabled(),
                
    //             // KPIs
    //             "kpiTasksProcessed", config.getKpiTasksProcessed(),
    //             "kpiReturnRate", config.getKpiReturnRate(),
    //             "kpiAvgInteractions", config.getKpiAvgInteractions(),
    //             "kpiDeadlineCompliance", config.getKpiDeadlineCompliance(),
    //             "kpiValidationWaitTime", config.getKpiValidationWaitTime(),
    //             "kpiPriorityCompliance", config.getKpiPriorityCompliance(),
    //             "kpiEmergencyManagement", config.getKpiEmergencyManagement(),
                
    //             // Alternative actions
    //             "notifierSuperviseur", config.getNotifySupervisor(),
    //             "reassignerTache", config.getReassignTask(),
    //             "envoyerRappel", config.getSendReminder(),
    //             "escaladeHierarchique", config.getHierarchicalEscalation(),
    //             "changementPriorite", config.getChangePriority(),
    //             "bloquerWorkflow", config.getBlockWorkflow(),
    //             "genererAlerteEquipe", config.getGenerateTeamAlert(),
    //             "demanderJustification", config.getRequestJustification(),
    //             "activerActionCorrective", config.getActivateCorrectiveAction(),
    //             "escaladeExterne", config.getExternalEscalation(),
    //             "cloturerDefaut", config.getCloseDefault(),
    //             "suiviParKpi", config.getKpiMonitoring(),
    //             "planBOuTacheAlternative", config.getPlanBOrAlternativeTask()
    //         ),
            
    //         // Condition
    //         "condition", Map.of(
    //             "showEntryTable", config.getEntryConditionsEnabled(),
    //             "showOutputTable", config.getOutputConditionsEnabled(),
    //             "entryConditions", config.getEntryConditions() != null ? 
    //                 config.getEntryConditions().stream()
    //                     .map(entry -> Map.of(
    //                         "name", entry.getType(),
    //                         "position", entry.getCondition(),
    //                         "value", entry.getResult()
    //                     ))
    //                     .collect(Collectors.toList()) : 
    //                 new ArrayList<>(),
    //             "outputConditions", config.getOutputConditions() != null ? 
    //                 config.getOutputConditions().stream()
    //                     .map(entry -> Map.of(
    //                         "name", entry.getType(),
    //                         "position", entry.getCondition(),
    //                         "value", entry.getResult()
    //                     ))
    //                     .collect(Collectors.toList()) : 
    //                 new ArrayList<>()
    //         ),
            
    //         // Notification
    //         "notification", Map.of(
    //             "notifyOnCreation", config.getNotifyOnCreation(),
    //             "notifyOnDeadline", config.getNotifyOnDeadline(),
    //             "reminderBeforeDeadline", config.getReminderBeforeDeadline(),
    //             "notificationSensitivity", config.getNotificationSensitivity(),
    //             "selectedReminders", config.getSelectedReminders() != null ? 
    //                 config.getSelectedReminders().stream()
    //                     .map(reminder -> Map.of(
    //                         "value", reminder,
    //                         "label", reminder
    //                     ))
    //                     .collect(Collectors.toList()) : 
    //                 new ArrayList<>()
    //         )
    //     );
        
    //     return result;
    // }
}
