package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.ProcessDefinitionDTO;
import com.harmony.harmoniservices.dto.ProcessInstanceDTO;
import com.harmony.harmoniservices.dto.TaskConfigurationDTO;
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

    private final ProcessEngine processEngine;
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
            // Convert DTOs to entities
            List<TaskConfiguration> configurations = taskConfigurations.stream()
                    .map(dto -> modelMapper.map(dto, TaskConfiguration.class))
                    .collect(Collectors.toList());

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
    public List<Task> getTasksForUser(String userId) {
        // Ensure the user exists in Camunda
        camundaIdentityService.ensureUserExists(userId);
        
        // Get tasks assigned directly to the user
        List<Task> assignedTasks = taskService.createTaskQuery()
                .taskAssignee(userId)
                .active()
                .list();
        
        // Get tasks where the user is a candidate
        List<Task> candidateTasks = taskService.createTaskQuery()
                .taskCandidateUser(userId)
                .active()
                .list();
        
        // Combine the lists (avoiding duplicates)
        Set<String> taskIds = new HashSet<>();
        List<Task> allTasks = new ArrayList<>();
        
        for (Task task : assignedTasks) {
            taskIds.add(task.getId());
            allTasks.add(task);
        }
        
        for (Task task : candidateTasks) {
            if (!taskIds.contains(task.getId())) {
                allTasks.add(task);
            }
        }
        
        log.info("Found {} tasks for user {}", allTasks.size(), userId);
        return allTasks;
    }

    /**
     * Get tasks for a user's groups
     */
    public List<Task> getTasksForUserGroups(List<String> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Ensure all groups exist in Camunda
        for (String groupId : groupIds) {
            camundaIdentityService.ensureGroupExists(groupId);
        }
        
        List<Task> tasks = taskService.createTaskQuery()
                .taskCandidateGroupIn(groupIds)
                .active()
                .list();
                
        log.info("Found {} tasks for groups {}", tasks.size(), groupIds);
        return tasks;
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

            // Complete task in Camunda
            taskService.complete(taskId, variables);

            // Send completion notifications
            notificationService.sendTaskCompletionNotification(taskId, userId);

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
        Map<String, List<String>> userGroupMappings = new HashMap<>();
        
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
            camundaIdentityService.synchronizeWithCamunda(userIds, groupIds, userGroupMappings);
        }
    }
}
