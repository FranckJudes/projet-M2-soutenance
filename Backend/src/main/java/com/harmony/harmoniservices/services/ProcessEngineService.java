package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.ProcessDefinitionDTO;
import com.harmony.harmoniservices.dto.ProcessInstanceDTO;
import com.harmony.harmoniservices.dto.TaskConfigurationDTO;
import com.harmony.harmoniservices.dto.TaskDTO;
import com.harmony.harmoniservices.mappers.TaskMapper;
import com.harmony.harmoniservices.models.CamundaIdMapping;
import com.harmony.harmoniservices.models.ProcessDefinition;
import com.harmony.harmoniservices.models.ProcessInstance;
import com.harmony.harmoniservices.models.TaskConfiguration;
import com.harmony.harmoniservices.repository.ProcessDefinitionRepository;
import com.harmony.harmoniservices.repository.ProcessInstanceRepository;
import com.harmony.harmoniservices.repository.TaskConfigurationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.*;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.runtime.ProcessInstanceWithVariables;
import org.camunda.bpm.engine.task.Task;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import java.io.StringReader;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessEngineService {

    private final RepositoryService repositoryService;
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final HistoryService historyService;
    
    private final ProcessDefinitionRepository processDefinitionRepository;
    private final ProcessInstanceRepository processInstanceRepository;
    private final TaskConfigurationRepository taskConfigurationRepository;
    private final BpmnTransformationService bpmnTransformationService;
    private final NotificationService notificationService;
    private final CamundaIdentityService camundaIdentityService;
    private final ModelMapper modelMapper;

    /**
     * Deploy a BPMN process with task configurations
     * @param bpmnXml Le contenu XML du fichier BPMN
     * @param taskConfigurations Les configurations des tâches
     * @param deployedBy L'identifiant de l'utilisateur qui déploie le processus
     * @param deployToEngine Si true, déploie le processus vers le moteur Camunda, sinon sauvegarde uniquement les métadonnées
     * @return Les informations sur le processus déployé
     */
    @Transactional
    public ProcessDefinitionDTO deployProcess(String bpmnXml, List<TaskConfigurationDTO> taskConfigurations, String deployedBy, boolean deployToEngine) {
        try {
            // Log détaillé des configurations reçues
            log.info("Déploiement du processus avec {} configurations de tâches", taskConfigurations.size());
            for (TaskConfigurationDTO dto : taskConfigurations) {
                log.info("Configuration de tâche reçue: taskId={}, assigneeUser={}, assigneeGroup={}, assigneeEntity={}",
                        dto.getTaskId(), dto.getAssigneeUser(), dto.getAssigneeGroup(), dto.getAssigneeEntity());
            }
            
            // Convert DTOs to entities
            List<TaskConfiguration> configurations = taskConfigurations.stream()
                    .map(dto -> modelMapper.map(dto, TaskConfiguration.class))
                    .collect(Collectors.toList());

            System.out.println("========Configurations:============ " + configurations);

            // Transform BPMN XML to add userTask configuration
            String transformedBpmn = bpmnTransformationService.transformBpmnWithConfigurations(bpmnXml, configurations);
            
            // Extract process key from the transformed BPMN
            String processKey = extractProcessKey(transformedBpmn);
            String processName = extractProcessName(transformedBpmn);
            
            // Variables pour stocker les informations du processus
            Deployment deployment = null;
            org.camunda.bpm.engine.repository.ProcessDefinition camundaProcessDef = null;
            
            // S'assurer que l'utilisateur qui déploie existe dans Camunda
            if (deployedBy != null && !deployedBy.isEmpty()) {
                log.info("Ensuring deployer user exists in Camunda: {}", deployedBy);
                camundaIdentityService.ensureUserExists(deployedBy);
            }
            
            // Synchroniser tous les utilisateurs, groupes et entités mentionnés dans les configurations de tâches
            log.info("Synchronisation des utilisateurs et groupes des configurations de tâches");
            synchronizeTaskConfigurationsWithCamunda(configurations);
            
            // Déployer vers Camunda uniquement si demandé
            if (deployToEngine) {
                log.info("Deploying process to Camunda engine");
                // Deploy to Camunda
                deployment = repositoryService.createDeployment()
                        .addString("process.bpmn", transformedBpmn)
                        .name("Harmony Process Deployment")
                        .deploy();
                
                // Get process definition from Camunda
                camundaProcessDef = repositoryService.createProcessDefinitionQuery()
                        .deploymentId(deployment.getId())
                        .singleResult();
                
                if (camundaProcessDef == null) {
                    throw new RuntimeException("Failed to deploy process: Process definition not found after deployment");
                }
                
                log.info("Successfully deployed process to Camunda engine: {}", camundaProcessDef.getKey());
                processKey = camundaProcessDef.getKey(); // Utiliser la clé retournée par Camunda
            } else {
                log.info("Skipping deployment to Camunda engine as requested");
                log.info("Process key (without deployment): {}", processKey);
            }

            // Check if process definition with same key already exists
            Optional<ProcessDefinition> existingProcessDefOpt = processDefinitionRepository.findByProcessDefinitionKey(processKey);
            
            ProcessDefinition processDefinition;
            if (existingProcessDefOpt.isPresent()) {
                // Update existing process definition
                processDefinition = existingProcessDefOpt.get();
                log.info("Updating existing process definition with key: {}", processKey);
                
                // Mettre à jour les champs en fonction du déploiement ou non
                processDefinition.setBpmnXml(transformedBpmn);
                processDefinition.setDeployedAt(LocalDateTime.now());
                processDefinition.setDeployedBy(deployedBy);
                
                if (deployToEngine && camundaProcessDef != null) {
                    processDefinition.setProcessDefinitionId(camundaProcessDef.getId());
                    processDefinition.setDeploymentId(deployment.getId());
                    processDefinition.setVersion(camundaProcessDef.getVersion());
                    processDefinition.setName(camundaProcessDef.getName());
                }
            } else {
                // Create new process definition
                ProcessDefinition.ProcessDefinitionBuilder builder = ProcessDefinition.builder()
                        .processDefinitionKey(processKey)
                        .bpmnXml(transformedBpmn)
                        .deployedBy(deployedBy)
                        .deployedAt(LocalDateTime.now())
                        .active(true);
                
                if (deployToEngine && camundaProcessDef != null) {
                    builder.processDefinitionId(camundaProcessDef.getId())
                           .name(camundaProcessDef.getName())
                           .version(camundaProcessDef.getVersion())
                           .deploymentId(deployment.getId());
                } else {
                    builder.name(processName)
                           .version(1);
                }
                
                processDefinition = builder.build();
            }

            processDefinition = processDefinitionRepository.save(processDefinition);

            // Save task configurations and ensure users/groups exist in Camunda
            for (TaskConfiguration config : configurations) {
                config.setProcessDefinitionKey(camundaProcessDef.getKey());
                
                // Vérifier si une configuration existe déjà pour ce processDefinitionKey et taskId
                Optional<TaskConfiguration> existingConfig = taskConfigurationRepository
                    .findByProcessDefinitionKeyAndTaskId(camundaProcessDef.getKey(), config.getTaskId());
                
                if (existingConfig.isPresent()) {
                    // Mettre à jour la configuration existante
                    TaskConfiguration existing = existingConfig.get();
                    log.info("Updating existing task configuration for task: {} in process: {}", 
                            config.getTaskId(), camundaProcessDef.getKey());
                    
                    // Conserver l'ID de la configuration existante
                    config.setId(existing.getId());
                }
                
                // Sauvegarder la configuration (nouvelle ou mise à jour)
                taskConfigurationRepository.save(config);
                
                // Ensure assignees exist in Camunda identity system
                if (config.getAssigneeUser() != null) {
                    camundaIdentityService.ensureUserExists(config.getAssigneeUser());
                }
                if (config.getAssigneeGroup() != null) {
                    camundaIdentityService.ensureGroupExists(config.getAssigneeGroup());
                }
                if (config.getResponsibleUser() != null) {
                    camundaIdentityService.ensureUserExists(config.getResponsibleUser());
                }
                if (config.getInterestedUser() != null) {
                    camundaIdentityService.ensureUserExists(config.getInterestedUser());
                }
            }

            log.info("Successfully deployed process: {} with {} task configurations", 
                    camundaProcessDef.getKey(), configurations.size());

            return modelMapper.map(processDefinition, ProcessDefinitionDTO.class);

        } catch (Exception e) {
            log.error("Error deploying process", e);
            throw new RuntimeException("Failed to deploy process: " + e.getMessage(), e);
        }
    }

    /**
     * Start a process instance
     */
    @Transactional
    public ProcessInstanceDTO startProcess(String processDefinitionKey, Map<String, Object> variables, String startUserId) {
        try {
            // Ensure the start user exists in Camunda
            if (startUserId != null && !startUserId.isEmpty()) {
                camundaIdentityService.ensureUserExists(startUserId);
                
                // Si des variables contiennent des assignés ou des groupes, les synchroniser avec Camunda
                synchronizeAssigneesAndGroups(variables);
            }
            
            // Start process in Camunda
            ProcessInstanceWithVariables camundaInstance = runtimeService
                    .createProcessInstanceByKey(processDefinitionKey)
                    .setVariables(variables)
                    .executeWithVariablesInReturn();

            // Save process instance to database
            ProcessInstance processInstance = ProcessInstance.builder()
                    .processInstanceId(camundaInstance.getId())
                    .processDefinitionKey(processDefinitionKey)
                    .processDefinitionId(camundaInstance.getProcessDefinitionId())
                    .processId(camundaInstance.getId()) // Ajouter cette ligne
                    .businessKey(camundaInstance.getBusinessKey())
                    .startUserId(startUserId)
                    .state(ProcessInstance.ProcessInstanceState.ACTIVE)
                    .variables(convertVariablesToJson(variables))
                    .build();

            processInstance = processInstanceRepository.save(processInstance);

            // Send notifications for initial tasks
            notifyInitialTasks(camundaInstance.getId());

            log.info("Started process instance: {} for process: {}", 
                    camundaInstance.getId(), processDefinitionKey);

            return modelMapper.map(processInstance, ProcessInstanceDTO.class);

        } catch (Exception e) {
            log.error("Error starting process", e);
            throw new RuntimeException("Failed to start process: " + e.getMessage(), e);
        }
    }

    /**
     * Get tasks assigned to a user
     */
    public List<TaskDTO> getTasksForUser(String userId) {
        if (userId == null || userId.isEmpty()) {
            log.warn("getTasksForUser called with null or empty userId");
            return new ArrayList<>();
        }
        
        // Récupérer l'ID Camunda correspondant à l'ID original (sans créer de nouveau mapping)
        String camundaUserId = camundaIdentityService.getCamundaId(userId, false);
        
        if (camundaUserId == null) {
            log.warn("No Camunda ID mapping found for user ID: {}", userId);
            return new ArrayList<>();
        }
        
        System.out.println("==================> >>>>>>>" + camundaUserId);
        
        // Get tasks assigned directly to the user's Camunda ID
        List<Task> assignedTasks = taskService.createTaskQuery()
                .taskAssignee(camundaUserId)
                .active()
                .list();
        
        if (!assignedTasks.isEmpty()) {
            log.info("Found {} tasks assigned directly to user {}", assignedTasks.size(), userId);
            for (Task task : assignedTasks) {
                log.info("  - Task [id={}, name={}, processDefinitionId={}]", 
                        task.getId(), task.getName(), task.getProcessDefinitionId());
            }
        }
        
        // Get tasks where the user is a candidate
        List<Task> candidateTasks = taskService.createTaskQuery()
                .taskCandidateUser(camundaUserId)
                .active()
                .list();
        
        log.info("Found {} tasks where user ID {} is candidate", candidateTasks.size(), userId);
        if (!candidateTasks.isEmpty()) {
            for (Task task : candidateTasks) {
                log.info("  - Task [id={}, name={}, processDefinitionId={}]", 
                        task.getId(), task.getName(), task.getProcessDefinitionId());
            }
        }
        
        // Récupérer les groupes dont l'utilisateur est membre
        List<String> userGroups = new ArrayList<>();
        List<org.camunda.bpm.engine.identity.Group> camundaGroups = camundaIdentityService.getIdentityService().createGroupQuery()
                .groupMember(camundaUserId)
                .list();
        
        log.info("User ID {} (Camunda ID: {}) is member of {} groups", userId, camundaUserId, camundaGroups.size());
        
        for (org.camunda.bpm.engine.identity.Group group : camundaGroups) {
            userGroups.add(group.getId());
            log.info("  - Group: {} ({})", group.getId(), group.getName());
        }
        
        // Get tasks assigned to user's groups
        List<Task> groupTasks = new ArrayList<>();
        if (!userGroups.isEmpty()) {
            groupTasks = taskService.createTaskQuery()
                    .taskCandidateGroupIn(userGroups)
                    .active()
                    .list();
            
            log.info("Found {} tasks assigned to user's groups", groupTasks.size());
            if (!groupTasks.isEmpty()) {
                for (Task task : groupTasks) {
                    log.info("  - Task [id={}, name={}, processDefinitionId={}]", 
                            task.getId(), task.getName(), task.getProcessDefinitionId());
                }
            }
        }
        
        // Combine all lists (avoiding duplicates)
        Set<String> taskIds = new HashSet<>();
        List<Task> allTasks = new ArrayList<>();
        
        for (Task task : assignedTasks) {
            taskIds.add(task.getId());
            allTasks.add(task);
        }
        
        for (Task task : candidateTasks) {
            if (!taskIds.contains(task.getId())) {
                taskIds.add(task.getId());
                allTasks.add(task);
            }
        }
        
        for (Task task : groupTasks) {
            if (!taskIds.contains(task.getId())) {
                taskIds.add(task.getId());
                allTasks.add(task);
            }
        }
        
        log.info("Total unique tasks for user {}: {}", userId, allTasks.size());
        log.info("=== FIN getTasksForUser pour userId: {} ===", userId);
        
        // Convertir les tâches Camunda en DTOs pour éviter les problèmes de sérialisation
        return TaskMapper.toDTOList(allTasks);
    }

    /**
     * Get tasks for a user's groups
     */
    public List<TaskDTO> getTasksForUserGroups(List<String> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Convertir les IDs originaux en IDs Camunda
        List<String> camundaGroupIds = new ArrayList<>();
        for (String groupId : groupIds) {
            String camundaGroupId = camundaIdentityService.getCamundaId(groupId, false);
            if (camundaGroupId != null) {
                camundaGroupIds.add(camundaGroupId);
                log.info("Mapped group ID {} to Camunda ID {}", groupId, camundaGroupId);
            } else {
                log.warn("No Camunda ID mapping found for group ID: {}", groupId);
            }
        }
        
        if (camundaGroupIds.isEmpty()) {
            log.warn("No valid Camunda group IDs found for the provided group IDs");
            return new ArrayList<>();
        }
        
        log.info("Searching tasks for Camunda group IDs: {}", camundaGroupIds);
        
        List<Task> tasks = taskService.createTaskQuery()
                .taskCandidateGroupIn(camundaGroupIds)
                .active()
                .list();
                
        log.info("Found {} tasks for groups {}", tasks.size(), camundaGroupIds);
        return TaskMapper.toDTOList(tasks);
    }

    /**
     * Complete a task
     */
    @Transactional
    public void completeTask(String taskId, Map<String, Object> variables, String userId) {
        try {
            // Get task configuration for notifications
            Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task == null) {
                throw new RuntimeException("Task not found: " + taskId);
            }

            // Récupérer l'ID Camunda correspondant à l'ID original
            String camundaUserId = camundaIdentityService.getCamundaId(userId, false);
            if (camundaUserId == null) {
                log.warn("No Camunda ID mapping found for user ID: {}. Creating a new mapping.", userId);
                // Créer un nouvel utilisateur et obtenir son ID Camunda
                camundaIdentityService.ensureUserExists(userId);
                camundaUserId = camundaIdentityService.getCamundaId(userId, true);
                
                if (camundaUserId == null) {
                    log.error("Failed to create Camunda ID mapping for user: {}", userId);
                    throw new RuntimeException("Failed to create Camunda ID mapping for user: " + userId);
                }
            }
            
            log.info("Completing task {} with user ID: {} (Camunda ID: {})", taskId, userId, camundaUserId);

            // Complete the task with the Camunda user ID
            taskService.claim(taskId, camundaUserId);
            taskService.complete(taskId, variables);
            
            // Send notification for task completion (using original user ID for notifications)
            notificationService.sendTaskCompletionNotification(taskId, userId);
            
            // Get next tasks and send notifications
            String processInstanceId = task.getProcessInstanceId();
            List<Task> nextTasks = taskService.createTaskQuery().processInstanceId(processInstanceId).list();
            
            for (Task nextTask : nextTasks) {
                notificationService.sendTaskAssignmentNotification(nextTask);
            }
            
            log.info("Task {} completed by user {}", taskId, userId);
            
        } catch (Exception e) {
            log.error("Error completing task", e);
            throw new RuntimeException("Failed to complete task: " + e.getMessage(), e);
        }
    }

    /**
     * Get active process instances
     */
    public List<ProcessInstanceDTO> getActiveProcesses() {
        List<ProcessInstance> activeProcesses = processInstanceRepository.findActiveProcesses();
        return activeProcesses.stream()
                .map(pi -> modelMapper.map(pi, ProcessInstanceDTO.class))
                .collect(Collectors.toList());
    }

    /**
     * Get task configuration for a specific task
     */
    public TaskConfiguration getTaskConfiguration(String processDefinitionKey, String taskId) {
        return taskConfigurationRepository
                .findByProcessDefinitionKeyAndTaskId(processDefinitionKey, taskId)
                .orElse(null);
    }

    private void notifyInitialTasks(String processInstanceId) {
        List<Task> initialTasks = taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .active()
                .list();

        for (Task task : initialTasks) {
            notificationService.sendTaskAssignmentNotification(task);
        }
    }

    private String convertVariablesToJson(Map<String, Object> variables) {
        // Simple JSON conversion - in production, use a proper JSON library
        if (variables == null || variables.isEmpty()) {
            return "{}";
        }
        
        StringBuilder json = new StringBuilder("{");
        variables.forEach((key, value) -> {
            json.append("\"").append(key).append("\":\"").append(value).append("\",");
        });
        
        if (json.length() > 1) {
            json.setLength(json.length() - 1); // Remove last comma
        }
        json.append("}");
        
        return json.toString();
    }
    
    /**
     * Extract process key from BPMN XML
     */
    private String extractProcessKey(String bpmnXml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new InputSource(new StringReader(bpmnXml)));
            
            // Chercher l'ID du processus dans les éléments process
            NodeList processes = document.getElementsByTagNameNS("http://www.omg.org/spec/BPMN/20100524/MODEL", "process");
            if (processes.getLength() > 0) {
                Element process = (Element) processes.item(0);
                String id = process.getAttribute("id");
                if (id != null && !id.isEmpty()) {
                    return id;
                }
            }
            
            return "unknown-process-key";
        } catch (Exception e) {
            log.error("Error extracting process key from BPMN XML", e);
            return "unknown-process-key";
        }
    }
    
    /**
     * Extract process name from BPMN XML
     */
    private String extractProcessName(String bpmnXml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new InputSource(new StringReader(bpmnXml)));
            
            // Essayer d'abord de trouver le nom dans les attributs du processus
            NodeList processes = document.getElementsByTagNameNS("http://www.omg.org/spec/BPMN/20100524/MODEL", "process");
            if (processes.getLength() > 0) {
                Element process = (Element) processes.item(0);
                String name = process.getAttribute("name");
                if (name != null && !name.isEmpty()) {
                    return name;
                }
            }
            
            // Sinon, chercher dans les éléments de collaboration ou de diagramme
            NodeList collaborations = document.getElementsByTagNameNS("http://www.omg.org/spec/BPMN/20100524/MODEL", "collaboration");
            if (collaborations.getLength() > 0) {
                Element collaboration = (Element) collaborations.item(0);
                String name = collaboration.getAttribute("name");
                if (name != null && !name.isEmpty()) {
                    return name;
                }
            }
            
            // Utiliser l'ID du processus comme nom par défaut
            String processKey = extractProcessKey(bpmnXml);
            return processKey != null ? processKey : "Unnamed Process";
        } catch (Exception e) {
            log.error("Error extracting process name from BPMN XML", e);
            return "Unnamed Process";
        }
    }
    
    /**
     * Synchronise les utilisateurs et groupes mentionnés dans les variables du processus avec Camunda
     * Cette méthode extrait les assignations d'utilisateurs et de groupes des variables
     * et s'assure qu'ils existent dans Camunda avec des identifiants valides
     * 
     * @param variables Variables du processus contenant potentiellement des assignations
     */
    private void synchronizeAssigneesAndGroups(Map<String, Object> variables) {
        if (variables == null || variables.isEmpty()) {
            return;
        }
        
        List<String> userIds = new ArrayList<>();
        List<String> groupIds = new ArrayList<>();
        Map<String, List<String>> userGroupMappings = new HashMap<>();
        
        // Extraire les utilisateurs et groupes des variables
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            // Variables d'assignation d'utilisateur typiques
            if (key.toLowerCase().contains("user") || key.toLowerCase().contains("assignee") || 
                key.toLowerCase().contains("utilisateur") || key.toLowerCase().contains("assigné")) {
                if (value instanceof String) {
                    String userId = (String) value;
                    if (!userId.isEmpty()) {
                        userIds.add(userId);
                    }
                } else if (value instanceof List) {
                    try {
                        @SuppressWarnings("unchecked")
                        List<String> users = (List<String>) value;
                        userIds.addAll(users.stream().filter(u -> u != null && !u.isEmpty()).collect(Collectors.toList()));
                    } catch (ClassCastException e) {
                        log.warn("Impossible de convertir la variable {} en liste d'utilisateurs", key);
                    }
                }
            }
            
            // Variables de groupe typiques
            if (key.toLowerCase().contains("group") || key.toLowerCase().contains("entity") || 
                key.toLowerCase().contains("groupe") || key.toLowerCase().contains("entité")) {
                if (value instanceof String) {
                    String groupId = (String) value;
                    if (!groupId.isEmpty()) {
                        groupIds.add(groupId);
                    }
                } else if (value instanceof List) {
                    try {
                        @SuppressWarnings("unchecked")
                        List<String> groups = (List<String>) value;
                        groupIds.addAll(groups.stream().filter(g -> g != null && !g.isEmpty()).collect(Collectors.toList()));
                    } catch (ClassCastException e) {
                        log.warn("Impossible de convertir la variable {} en liste de groupes", key);
                    }
                }
            }
            
            // Variables d'assignation utilisateur-groupe
            if (key.toLowerCase().contains("user_group") || key.toLowerCase().contains("membership")) {
                if (value instanceof Map) {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, List<String>> mappings = (Map<String, List<String>>) value;
                        userGroupMappings.putAll(mappings);
                    } catch (ClassCastException e) {
                        log.warn("Impossible de convertir la variable {} en mappings utilisateur-groupe", key);
                    }
                }
            }
        }
        
        // Synchroniser avec Camunda
        if (!userIds.isEmpty() || !groupIds.isEmpty() || !userGroupMappings.isEmpty()) {
            log.info("Synchronisation de {} utilisateurs et {} groupes avec Camunda", userIds.size(), groupIds.size());
            camundaIdentityService.synchronizeWithCamunda(userIds, groupIds, userGroupMappings);
        }
    }
    
    /**
     * Synchronise tous les utilisateurs, groupes et entités mentionnés dans les configurations de tâches
     * Cette méthode peut être appelée avant le déploiement d'un processus pour s'assurer
     * que tous les assignés potentiels sont correctement enregistrés dans Camunda
     * 
     * @param configurations Liste des configurations de tâches à analyser
     */
    private void synchronizeTaskConfigurationsWithCamunda(List<TaskConfiguration> configurations) {
        if (configurations == null || configurations.isEmpty()) {
            return;
        }
        
        log.info("Synchronisation des configurations de tâches avec Camunda ({} configurations)", configurations.size());
        
        List<String> userIds = new ArrayList<>();
        List<String> groupIds = new ArrayList<>();
        
        // Extraire tous les utilisateurs et groupes des configurations
        for (TaskConfiguration config : configurations) {
            // Utilisateurs
            if (config.getAssigneeUser() != null && !config.getAssigneeUser().isEmpty()) {
                userIds.add(config.getAssigneeUser());
            }
            if (config.getResponsibleUser() != null && !config.getResponsibleUser().isEmpty()) {
                userIds.add(config.getResponsibleUser());
            }
            if (config.getInterestedUser() != null && !config.getInterestedUser().isEmpty()) {
                userIds.add(config.getInterestedUser());
            }
            
            // Groupes
            if (config.getAssigneeGroup() != null && !config.getAssigneeGroup().isEmpty()) {
                groupIds.add(config.getAssigneeGroup());
            }
            
            // Entités (traitées comme des groupes)
            if (config.getAssigneeEntity() != null && !config.getAssigneeEntity().isEmpty()) {
                groupIds.add(config.getAssigneeEntity());
            }
        }
        
        // Synchroniser avec Camunda
        if (!userIds.isEmpty() || !groupIds.isEmpty()) {
            log.info("Synchronisation de {} utilisateurs et {} groupes/entités avec Camunda", userIds.size(), groupIds.size());
            
            // Synchroniser les utilisateurs
            for (String userId : userIds) {
                try {
                    log.info("Synchronisation de l'utilisateur: {}", userId);
                    camundaIdentityService.ensureUserExists(userId);
                    String camundaId = camundaIdentityService.getCamundaId(userId, true);
                    log.info("Utilisateur {} synchronisé avec ID Camunda: {}", userId, camundaId);
                } catch (Exception e) {
                    log.error("Erreur lors de la synchronisation de l'utilisateur {}: {}", userId, e.getMessage(), e);
                }
            }
            
            // Synchroniser les groupes et entités
            for (String groupId : groupIds) {
                try {
                    log.info("Synchronisation du groupe/entité: {}", groupId);
                    camundaIdentityService.ensureGroupExists(groupId);
                    String camundaId = camundaIdentityService.getCamundaId(groupId, true);
                    log.info("Groupe/Entité {} synchronisé avec ID Camunda: {}", groupId, camundaId);
                } catch (Exception e) {
                    log.error("Erreur lors de la synchronisation du groupe/entité {}: {}", groupId, e.getMessage(), e);
                }
            }
        }
        
        log.info("=== FIN synchronizeTaskAssignees ===");
    }
    
    /**
     * Méthode de diagnostic pour vérifier l'état des tâches et des utilisateurs
     */
    public Map<String, Object> diagnoseTaskAssignmentIssues(String processDefinitionKey, String userId) {
        Map<String, Object> result = new HashMap<>();
        log.info("=== DIAGNOSTIC TASK ASSIGNMENT pour processus {} et utilisateur {} ===", processDefinitionKey, userId);
        
        // 1. Vérifier si l'utilisateur existe dans Camunda
        String camundaUserId = camundaIdentityService.getCamundaId(userId, false);
        log.info("Mapping utilisateur: {} -> {}", userId, camundaUserId);
        
        if (camundaUserId == null) {
            log.error("PROBLÈME: Aucun mapping Camunda trouvé pour l'utilisateur {}", userId);
            result.put("error", "Aucun mapping Camunda trouvé pour l'utilisateur " + userId);
            result.put("success", false);
            return result;
        }
        
        result.put("userId", userId);
        result.put("camundaUserId", camundaUserId);
        result.put("processDefinitionKey", processDefinitionKey);
        
        // 2. Vérifier si l'utilisateur existe dans Camunda
        long userCount = camundaIdentityService.getIdentityService().createUserQuery()
                .userId(camundaUserId)
                .count();
        log.info("Utilisateur {} existe dans Camunda: {}", camundaUserId, userCount > 0);
        
        // 3. Lister tous les groupes de l'utilisateur
        List<org.camunda.bpm.engine.identity.Group> userGroups = camundaIdentityService.getIdentityService()
                .createGroupQuery()
                .groupMember(camundaUserId)
                .list();
        log.info("Utilisateur {} appartient à {} groupes:", camundaUserId, userGroups.size());
        for (org.camunda.bpm.engine.identity.Group group : userGroups) {
            log.info("  - Groupe: {} ({})", group.getId(), group.getName());
        }
        
        // 4. Lister toutes les tâches actives du processus
        List<Task> allTasks = taskService.createTaskQuery()
                .processDefinitionKey(processDefinitionKey)
                .active()
                .list();
        log.info("Tâches actives pour le processus {}: {}", processDefinitionKey, allTasks.size());
        
        for (Task task : allTasks) {
            log.info("  - Tâche [id={}, name={}, assignee={}, candidateGroups={}]", 
                    task.getId(), task.getName(), task.getAssignee(), 
                    taskService.getIdentityLinksForTask(task.getId()));
        }
        
        // 5. Tester les requêtes de tâches
        List<Task> assignedTasks = taskService.createTaskQuery()
                .taskAssignee(camundaUserId)
                .active()
                .list();
        log.info("Tâches assignées directement à {}: {}", camundaUserId, assignedTasks.size());
        
        List<Task> candidateTasks = taskService.createTaskQuery()
                .taskCandidateUser(camundaUserId)
                .active()
                .list();
        log.info("Tâches où {} est candidat: {}", camundaUserId, candidateTasks.size());
        
        if (!userGroups.isEmpty()) {
            List<String> groupIds = userGroups.stream()
                    .map(org.camunda.bpm.engine.identity.Group::getId)
                    .collect(Collectors.toList());
            
            List<Task> groupTasks = taskService.createTaskQuery()
                    .taskCandidateGroupIn(groupIds)
                    .active()
                    .list();
            log.info("Tâches assignées aux groupes de {}: {}", camundaUserId, groupTasks.size());
        }
        
        log.info("=== FIN DIAGNOSTIC ===");
        
        // Compiler les résultats
        result.put("userExists", userCount > 0);
        result.put("userGroupsCount", userGroups.size());
        result.put("totalActiveTasks", allTasks.size());
        result.put("assignedTasksCount", assignedTasks.size());
        result.put("candidateTasksCount", candidateTasks.size());
        result.put("success", true);
        
        return result;
    }
    
    /**
     * Lister tous les utilisateurs Camunda et leurs mappings
     */
    public Map<String, Object> listAllCamundaUsers() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Utiliser le service d'identité pour récupérer les mappings
            Map<String, String> mappings = new HashMap<>();
            
            // Récupérer tous les utilisateurs Camunda
            List<org.camunda.bpm.engine.identity.User> camundaUsers = 
                camundaIdentityService.getIdentityService().createUserQuery().list();
            
            for (org.camunda.bpm.engine.identity.User user : camundaUsers) {
                // Le mapping inverse n'est pas directement disponible, mais on peut lister les IDs Camunda
                mappings.put(user.getId(), user.getFirstName() + " " + user.getLastName());
            }
            
            result.put("camundaUsers", mappings);
            result.put("totalUsers", camundaUsers.size());
            result.put("success", true);
            
            log.info("Found {} Camunda users", camundaUsers.size());
            
        } catch (Exception e) {
            log.error("Error listing Camunda users", e);
            result.put("error", e.getMessage());
            result.put("success", false);
        }
        
        return result;
    }
    
    /**
     * Méthode de test pour valider l'assignation flexible (utilisateur/groupe/entité)
     */
    public Map<String, Object> testFlexibleAssignment(Map<String, Object> testData) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String assigneeType = (String) testData.get("assigneeType");
            String assigneeId = (String) testData.get("assigneeId");
            
            log.info("Test d'assignation flexible - Type: {}, ID: {}", assigneeType, assigneeId);
            
            // Vérifier le mapping selon le type
            String camundaId = null;
            boolean exists = false;
            
            switch (assigneeType) {
                case "user":
                    camundaId = camundaIdentityService.getCamundaId(assigneeId, false);
                    if (camundaId != null) {
                        exists = camundaIdentityService.getIdentityService()
                                .createUserQuery().userId(camundaId).count() > 0;
                    }
                    break;
                    
                case "group":
                case "entity":
                    camundaId = camundaIdentityService.getCamundaId(assigneeId, false);
                    if (camundaId != null) {
                        exists = camundaIdentityService.getIdentityService()
                                .createGroupQuery().groupId(camundaId).count() > 0;
                    }
                    break;
                    
                default:
                    result.put("error", "Type d'assignation non supporté: " + assigneeType);
                    result.put("success", false);
                    return result;
            }
            
            // Compiler les résultats
            result.put("assigneeType", assigneeType);
            result.put("originalId", assigneeId);
            result.put("camundaId", camundaId);
            result.put("mappingExists", camundaId != null);
            result.put("entityExists", exists);
            result.put("success", true);
            
            // Informations supplémentaires
            if (camundaId != null && exists) {
                result.put("status", "OK - Assignation valide");
                
                // Pour les utilisateurs, récupérer les tâches assignées
                if ("user".equals(assigneeType)) {
                    List<Task> assignedTasks = taskService.createTaskQuery()
                            .taskAssignee(camundaId).active().list();
                    List<Task> candidateTasks = taskService.createTaskQuery()
                            .taskCandidateUser(camundaId).active().list();
                    
                    result.put("assignedTasksCount", assignedTasks.size());
                    result.put("candidateTasksCount", candidateTasks.size());
                }
                
                // Pour les groupes/entités, récupérer les tâches candidates
                if ("group".equals(assigneeType) || "entity".equals(assigneeType)) {
                    List<Task> groupTasks = taskService.createTaskQuery()
                            .taskCandidateGroup(camundaId).active().list();
                    
                    result.put("candidateTasksCount", groupTasks.size());
                }
                
            } else if (camundaId == null) {
                result.put("status", "ERREUR - Mapping manquant");
                result.put("recommendation", "Exécuter la synchronisation avant le déploiement");
            } else {
                result.put("status", "ERREUR - Entité inexistante dans Camunda");
                result.put("recommendation", "Vérifier la création de l'entité");
            }
            
            log.info("Test d'assignation flexible terminé: {}", result.get("status"));
            
        } catch (Exception e) {
            log.error("Erreur lors du test d'assignation flexible", e);
            result.put("error", e.getMessage());
            result.put("success", false);
        }
        
        return result;
    }
}
