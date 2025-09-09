package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.ProcessImageDTO;
import com.harmony.harmoniservices.dto.ProcessInstanceDTO;
import com.harmony.harmoniservices.dto.*;
import com.harmony.harmoniservices.models.ProcessImage;
import com.harmony.harmoniservices.models.ProcessInstance;
import com.harmony.harmoniservices.models.ProcessDefinition;
import com.harmony.harmoniservices.models.TaskConfiguration;
import com.harmony.harmoniservices.repository.ProcessDefinitionRepository;
import com.harmony.harmoniservices.repository.ProcessInstanceRepository;
import com.harmony.harmoniservices.repository.TaskConfigurationRepository;
import com.harmony.harmoniservices.mappers.TaskMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.*;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.runtime.ProcessInstanceWithVariables;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.bpmn.instance.Process;
import org.camunda.bpm.model.bpmn.instance.SequenceFlow;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import java.util.Collection;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.io.StringWriter;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import java.io.StringReader;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.Base64;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

    private static final String PROCESS_IMAGES_DIRECTORY = "src/main/resources/static/process-images";

    /**
     * Deploy a BPMN process with task configurations and general metadata
     * @param bpmnXml Le contenu XML du fichier BPMN
     * @param taskConfigurations Les configurations des tâches
     * @param processMetadata Les métadonnées générales du processus (nom, description, tags, images)
     * @param deployedByUserId L'identifiant de l'utilisateur qui déploie le processus
     * @param deployToEngine Si true, déploie le processus vers le moteur Camunda, sinon sauvegarde uniquement les métadonnées
     * @param forceCreate 
     * @return Les informations sur le processus déployé
     */
    @Transactional
    @CacheEvict(cacheNames = {"processDefinition:byKey", "processDefinition:all", "processDefinition:active"}, allEntries = true)
    public ProcessDefinitionDTO deployProcess(String bpmnXml, List<TaskConfigurationDTO> taskConfigurations,
                                           ProcessMetadataDTO processMetadata, String deployedBy, boolean deployToEngine, boolean forceCreate) {
        try {
          
            // Convert DTOs to entities with proper assignment mapping
            List<TaskConfiguration> configurations = taskConfigurations.stream()
                    .map(dto -> {
                        TaskConfiguration config = modelMapper.map(dto, TaskConfiguration.class);
                        config.setId(null); 
                        config.setAssigneeUser(dto.getAssigneeUser());
                        config.setAssigneeGroup(dto.getAssigneeGroup());
                        config.setAssigneeEntity(dto.getAssigneeEntity());
                        return config;
                    })
                    .collect(Collectors.toList());

            System.out.println("========Configurations GALALL:============ " + configurations);

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

            // Handle forceCreate logic - if forceCreate is true, we need to ensure deployment to Camunda
            if (forceCreate && !deployToEngine) {
                log.warn("forceCreate=true but deployToEngine=false. Forcing deployment to Camunda to make the process usable.");
                // Force deployment to Camunda for newly created processes
                if (deployment == null) {
                    deployment = repositoryService.createDeployment()
                            .addString("process.bpmn", transformedBpmn)
                            .name("Harmony Process Deployment - Forced")
                            .deploy();

                    camundaProcessDef = repositoryService.createProcessDefinitionQuery()
                            .deploymentId(deployment.getId())
                            .singleResult();

                    if (camundaProcessDef != null) {
                        processKey = camundaProcessDef.getKey();
                        log.info("Successfully forced deployment to Camunda: {}", processKey);
                    }
                }
            }

            // Check if process definition with same key already exists
            Optional<ProcessDefinition> existingProcessDefOpt = processDefinitionRepository.findByProcessDefinitionKey(processKey);

            // Handle forceCreate logic
            if (forceCreate && existingProcessDefOpt.isPresent()) {
                // Generate a unique process key for forced creation
                String originalProcessKey = processKey;
                int counter = 1;
                String uniqueProcessKey = processKey + "_" + counter;

                // Find a unique key that doesn't exist
                while (processDefinitionRepository.findByProcessDefinitionKey(uniqueProcessKey).isPresent()) {
                    counter++;
                    uniqueProcessKey = originalProcessKey + "_" + counter;
                }

                processKey = uniqueProcessKey;
                log.info("Force creating new process with unique key: {} (original was: {})", processKey, originalProcessKey);
                // Reset the existing process opt since we're creating a new one
                existingProcessDefOpt = Optional.empty();

                // If we forced deployment earlier, we need to redeploy with the new unique key
                if (deployment != null && camundaProcessDef != null) {
                    log.info("Redeploying to Camunda with unique key: {}", processKey);

                    // Transform the BPMN XML to use the unique key
                    String uniqueBpmnXml = transformBpmnWithUniqueKey(transformedBpmn, processKey);

                    deployment = repositoryService.createDeployment()
                            .addString("process.bpmn", uniqueBpmnXml)
                            .name("Harmony Process Deployment - Unique Key")
                            .deploy();

                    camundaProcessDef = repositoryService.createProcessDefinitionQuery()
                            .deploymentId(deployment.getId())
                            .singleResult();

                    if (camundaProcessDef != null) {
                        // Use the unique key we generated, not the one from Camunda
                        log.info("Successfully redeployed with unique key: {}", processKey);
                        // Update the transformed BPMN with the correct key
                        transformedBpmn = uniqueBpmnXml;
                    }
                }
            }

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

            // Always persist general process metadata and images if provided
            if (processMetadata != null) {
                try {
                    // Set general metadata fields
                    if (processMetadata.getProcessName() != null && !processMetadata.getProcessName().isEmpty()) {
                        processDefinition.setProcessName(processMetadata.getProcessName());
                        // If Camunda didn't provide a name, set the display name as well
                        if (processDefinition.getName() == null || processDefinition.getName().isEmpty()) {
                            processDefinition.setName(processMetadata.getProcessName());
                        }
                    }
                    if (processMetadata.getProcessDescription() != null) {
                        processDefinition.setProcessDescription(processMetadata.getProcessDescription());
                        // Keep the legacy description field aligned
                        processDefinition.setDescription(processMetadata.getProcessDescription());
                    }

                    if (processMetadata.getProcessTags() != null) {
                        // Replace existing tags with the new set
                        if (processDefinition.getProcessTags() != null) {
                            processDefinition.getProcessTags().clear();
                            processDefinition.getProcessTags().addAll(processMetadata.getProcessTags());
                        }
                    }

                    // Handle images: replace existing images with the provided ones
                    if (processMetadata.getImages() != null) {
                        if (processDefinition.getImages() != null) {
                            processDefinition.getImages().clear();
                        }

                        int order = 0;
                        // Prepare base directory: images stored under <PROCESS_IMAGES_DIRECTORY>/<processKey>/
                        Path baseDir = Paths.get(PROCESS_IMAGES_DIRECTORY, processKey);
                        try {
                            Files.createDirectories(baseDir);
                        } catch (IOException ioEx) {
                            log.warn("Could not create image directory {}: {}", baseDir, ioEx.getMessage());
                        }

                        for (ProcessImageDTO imgDto : processMetadata.getImages()) {
                            try {
                                if (imgDto == null) continue;

                                String fileName = (imgDto.getFileName() != null && !imgDto.getFileName().isEmpty())
                                        ? imgDto.getFileName()
                                        : (processKey + "_image_" + (order + 1));

                                String contentType = (imgDto.getContentType() != null && !imgDto.getContentType().isEmpty())
                                        ? imgDto.getContentType()
                                        : "image/png";

                                // Ensure extension based on contentType if missing
                                if (!fileName.contains(".")) {
                                    String ext = "png";
                                    if (contentType.contains("jpeg") || contentType.contains("jpg")) ext = "jpg";
                                    else if (contentType.contains("gif")) ext = "gif";
                                    else if (contentType.contains("webp")) ext = "webp";
                                    else if (contentType.contains("svg")) ext = "svg";
                                    fileName = fileName + "." + ext;
                                }

                                // Save image bytes to filesystem when imageData provided
                                String filePath = null;
                                if (imgDto.getImageData() != null && !imgDto.getImageData().isEmpty()) {
                                    try {
                                        // Remove possible base64 prefix
                                        String base64 = imgDto.getImageData();
                                        int commaIdx = base64.indexOf(',');
                                        if (commaIdx > 0) {
                                            base64 = base64.substring(commaIdx + 1);
                                        }
                                        byte[] bytes = Base64.getDecoder().decode(base64);

                                        Path target = baseDir.resolve(UUID.randomUUID().toString() + "_" + fileName);
                                        Files.write(target, bytes);
                                        filePath = target.toString();
                                    } catch (Exception io) {
                                        log.warn("Failed to write process image {}: {}", fileName, io.getMessage());
                                    }
                                }

                                ProcessImage img = ProcessImage.builder()
                                        .processDefinition(processDefinition)
                                        .fileName(fileName)
                                        .originalFileName(imgDto.getOriginalFileName() != null ? imgDto.getOriginalFileName() : fileName)
                                        .contentType(contentType)
                                        .fileSize(imgDto.getFileSize() != null ? imgDto.getFileSize() : 0L)
                                        .filePath(filePath)
                                        .imageData(null) // Using filesystem storage; keep DB column null
                                        .description(imgDto.getDescription())
                                        .displayOrder(imgDto.getDisplayOrder() != null ? imgDto.getDisplayOrder() : order)
                                        .build();

                                processDefinition.getImages().add(img);
                                order++;
                            } catch (Exception imgEx) {
                                log.warn("Skipping image due to error: {}", imgEx.getMessage());
                            }
                        }
                    }
                } catch (Exception metaEx) {
                    log.warn("Failed to persist process metadata/images: {}", metaEx.getMessage());
                }
            }

            processDefinition = processDefinitionRepository.save(processDefinition);

            // Save configurations with proper assignment values
            for (TaskConfiguration config : configurations) {
                config.setProcessDefinitionKey(processKey);
                
                Optional<TaskConfiguration> existingConfig = taskConfigurationRepository
                    .findByProcessDefinitionKeyAndTaskId(processKey, config.getTaskId());
                
                if (existingConfig.isPresent()) {
                    // Update only assignment fields to preserve other data
                    TaskConfiguration existing = existingConfig.get();
                    existing.setAssigneeUser(config.getAssigneeUser());
                    existing.setAssigneeGroup(config.getAssigneeGroup());
                    existing.setAssigneeEntity(config.getAssigneeEntity());
                    existing.setAssigneeType(config.getAssigneeType());
                    log.info("========================Updating existing config for task {} with assigneeUser: {}", config.getTaskId(), config.getAssigneeUser());
                    taskConfigurationRepository.save(existing);
                } else {
                    log.info("========================Creating new config for task {} with assigneeUser: {}", config.getTaskId(), config.getAssigneeUser());
                    taskConfigurationRepository.save(config);
                }
            }

            log.info("Successfully deployed process: {} with {} task configurations", 
                    processKey, configurations.size());

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
    @Cacheable(cacheNames = "tasks:byUser", key = "#userId")
    public List<TaskDTO> getTasksForUser(String userId) {
        if (userId == null || userId.isEmpty()) {
            log.warn("getTasksForUser called with null or empty userId");
            return new ArrayList<>();
        }
        
        // Récupérer l'ID Camunda correspondant à l'ID original (sans créer de nouveau mapping)
        String camundaUserId = camundaIdentityService.getCamundaId(userId, false);
        
        if (camundaUserId == null) {
            System.out.println("No Camunda ID mapping found for user ID: " + userId);
            return new ArrayList<>();
        }
        
        log.info("Fetching only ASSIGNED tasks for user {} (Camunda ID: {})", userId, camundaUserId);
        
        // 1) Only tasks assigned directly to the user's Camunda ID
        List<Task> assignedTasks = taskService.createTaskQuery()
                .taskAssignee(camundaUserId)
                .active()
                .list();
        
        log.info("Found {} assigned tasks for user {}", assignedTasks.size(), userId);
        
        // 2) Map to DTOs
        List<TaskDTO> dtos = TaskMapper.toDTOList(assignedTasks);
        
        // 3) Enrich each DTO with its TaskConfiguration
        for (TaskDTO dto : dtos) {
            try {
                // Initialize with empty configuration by default
                dto.setTaskConfiguration(new TaskConfigurationDTO());
                // Resolve processDefinitionKey from processDefinitionId
                org.camunda.bpm.engine.repository.ProcessDefinition def = repositoryService
                        .createProcessDefinitionQuery()
                        .processDefinitionId(dto.getProcessDefinitionId())
                        .singleResult();
                if (def == null) {
                    continue;
                }
                String processDefinitionKey = def.getKey();
                String taskDefinitionKey = dto.getTaskDefinitionKey();
                Optional<TaskConfiguration> cfgOpt = taskConfigurationRepository
                        .findByProcessDefinitionKeyAndTaskId(processDefinitionKey, taskDefinitionKey);
                if (cfgOpt.isPresent()) {
                    TaskConfigurationDTO cfgDto = modelMapper.map(cfgOpt.get(), TaskConfigurationDTO.class);
                    dto.setTaskConfiguration(cfgDto);
                }
            } catch (Exception e) {
                log.warn("Failed enriching TaskDTO {} with configuration: {}", dto.getId(), e.getMessage());
            }
        }
        
        log.info("Returning {} assigned tasks (enriched) for user {}", dtos.size(), userId);
        return dtos;
    }

    /**
         * Delete a process definition and related data
     * @param processId database ID or processDefinitionKey
     * @param userId requester (for logging/audit)
     */
    @Transactional
    @CacheEvict(cacheNames = {"processDefinition:byKey", "processDefinition:all", "processDefinition:active"}, allEntries = true)
    public void deleteProcess(String processId, String userId) {
        try {
            // Resolve process definition either by numeric ID or by key
            Optional<ProcessDefinition> pdOpt = Optional.empty();
            try {
                Long id = Long.parseLong(processId);
                pdOpt = processDefinitionRepository.findById(id);
            } catch (NumberFormatException ignore) {
                // Not a numeric ID, fall back to processDefinitionKey
            }
            if (!pdOpt.isPresent()) {
                pdOpt = processDefinitionRepository.findByProcessDefinitionKey(processId);
            }
            if (!pdOpt.isPresent()) {
                throw new RuntimeException("Process not found with id or key: " + processId);
            }
            ProcessDefinition pd = pdOpt.get();

            String processKey = pd.getProcessDefinitionKey();

            // Delete Camunda deployment if any (cascade = true to remove definitions)
            if (pd.getDeploymentId() != null && !pd.getDeploymentId().isEmpty()) {
                try {
                    log.info("Deleting Camunda deployment {} for process {} by user {}", pd.getDeploymentId(), processKey, userId);
                    repositoryService.deleteDeployment(pd.getDeploymentId(), true);
                } catch (Exception e) {
                    log.warn("Failed to delete Camunda deployment {}: {}", pd.getDeploymentId(), e.getMessage());
                }
            }

            // Delete image files from filesystem if present
            if (pd.getImages() != null) {
                for (ProcessImage img : new ArrayList<>(pd.getImages())) {
                    try {
                        String path = img.getFilePath();
                        if (path != null && !path.isEmpty()) {
                            Path p = Paths.get(path);
                            if (Files.exists(p)) {
                                Files.delete(p);
                            }
                        }
                    } catch (Exception io) {
                        log.warn("Failed to delete process image file: {}", io.getMessage());
                    }
                }
            }

            // Delete task configurations linked to this process key
            try {
                List<TaskConfiguration> configs = taskConfigurationRepository.findByProcessDefinitionKey(processKey);
                if (configs != null && !configs.isEmpty()) {
                    taskConfigurationRepository.deleteAll(configs);
                }
            } catch (Exception e) {
                log.warn("Failed deleting task configurations for process {}: {}", processKey, e.getMessage());
            }

            // Finally delete process definition entity
            processDefinitionRepository.delete(pd);
            log.info("Process {} deleted successfully by user {}", processKey, userId);

        } catch (Exception e) {
            log.error("Error deleting process {}: {}", processId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete process: " + e.getMessage(), e);
        }
    }

    /**
     * Get tasks for a user's groups
     */
    @Cacheable(cacheNames = "tasks:byGroups", key = "#groupIds")
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
     * Méthode modifiée pour éviter l'erreur "Activity is contained in normal flow and cannot be executed using executeActivity()"
     * et pour gérer correctement les transactions
     */
  

    /**
     * Get active process instances
     */
    @Cacheable(cacheNames = "processInstance:active")
    public List<ProcessInstanceDTO> getActiveProcesses() {
        List<ProcessInstance> activeProcesses = processInstanceRepository.findActiveProcesses();
        List<ProcessInstanceDTO> dtos = new ArrayList<>();
        
        for (ProcessInstance pi : activeProcesses) {
            ProcessInstanceDTO dto = modelMapper.map(pi, ProcessInstanceDTO.class);
            enrichProcessInstanceDTO(dto, pi.getProcessDefinitionKey());
            dtos.add(dto);
        }
        
        return dtos;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW) // Use a new transaction
    @CacheEvict(cacheNames = {"tasks:byUser", "tasks:byGroups"}, allEntries = true)
    public void completeTask(String taskId, Map<String, Object> variables, String userId) {
        try {
            // Get task and validate
            Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task == null) {
                throw new RuntimeException("Task not found: " + taskId);
            }

            // Get Camunda user ID
            String camundaUserId = camundaIdentityService.getCamundaId(userId, false);
            if (camundaUserId == null) {
                camundaIdentityService.ensureUserExists(userId);
                camundaUserId = camundaIdentityService.getCamundaId(userId, true);
            }

            log.info("Completing task {} with user ID: {} (Camunda ID: {})", 
                    taskId, userId, camundaUserId);

            // Claim and complete the task
            taskService.claim(taskId, camundaUserId);
            taskService.complete(taskId, variables);
            
            // Send notifications
            notificationService.sendTaskCompletionNotification(taskId, userId);
            
            // Handle next tasks
            String processInstanceId = task.getProcessInstanceId();
            List<Task> nextTasks = taskService.createTaskQuery()
                    .processInstanceId(processInstanceId)
                    .list();
                
            for (Task nextTask : nextTasks) {
                // Assigner la tâche suivante selon sa configuration
                assignTaskBasedOnConfiguration(nextTask);
                // Envoyer la notification
                notificationService.sendTaskAssignmentNotification(nextTask);
            }
            
            log.info("Task {} completed by user {}", taskId, userId);
            
        } catch (ProcessEngineException e) {
            log.error("Camunda process engine error completing task", e);
            throw new RuntimeException("Process engine error: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("General error completing task", e);
            throw new RuntimeException("Failed to complete task: " + e.getMessage(), e);
        }
    }
    /**
     * Get task configuration for a specific task
     */
    @Cacheable(cacheNames = "taskConfiguration:byProcessAndTask", key = "#processDefinitionKey + ':' + #taskId")
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
            // Assigner la tâche selon la configuration
            assignTaskBasedOnConfiguration(task);
            // Envoyer la notification
            notificationService.sendTaskAssignmentNotification(task);
        }
    }
    
    /**
     * Assigne une tâche en fonction de sa configuration
     * @param task La tâche à assigner
     */
    private void assignTaskBasedOnConfiguration(Task task) {
        try {
            // Récupérer la configuration de la tâche
            String processDefinitionId = task.getProcessDefinitionId();
            String processDefinitionKey = extractProcessKeyFromDefinitionId(processDefinitionId);
            String taskDefinitionKey = task.getTaskDefinitionKey();
            
            log.info("Assigning task {} (definition key: {}) based on configuration", 
                    task.getId(), taskDefinitionKey);
            
            // Récupérer la configuration pour cette tâche
            Optional<TaskConfiguration> configOpt = taskConfigurationRepository
                    .findByProcessDefinitionKeyAndTaskId(processDefinitionKey, taskDefinitionKey);
            
            if (!configOpt.isPresent()) {
                log.warn("No configuration found for task {} in process {}", 
                        taskDefinitionKey, processDefinitionKey);
                return;
            }
            
            TaskConfiguration config = configOpt.get();
            
            // Vérifier les différentes options d'assignation dans l'ordre de priorité
            if (config.getAssigneeUser() != null && !config.getAssigneeUser().isEmpty()) {
                // Assigner à un utilisateur spécifique
                String camundaUserId = camundaIdentityService.getCamundaId(config.getAssigneeUser(), false);
                if (camundaUserId == null) {
                    camundaIdentityService.ensureUserExists(config.getAssigneeUser());
                    camundaUserId = camundaIdentityService.getCamundaId(config.getAssigneeUser(), true);
                }
                
                log.info("Assigning task {} to user {} (Camunda ID: {})", 
                        task.getId(), config.getAssigneeUser(), camundaUserId);
                taskService.setAssignee(task.getId(), camundaUserId);
                
            } else if (config.getAssigneeGroup() != null && !config.getAssigneeGroup().isEmpty()) {
                // Ajouter le groupe comme candidat
                String camundaGroupId = camundaIdentityService.getCamundaId(config.getAssigneeGroup(), false);
                if (camundaGroupId == null) {
                    camundaIdentityService.ensureGroupExists(config.getAssigneeGroup());
                    camundaGroupId = camundaIdentityService.getCamundaId(config.getAssigneeGroup(), true);
                }
                
                log.info("Adding candidate group {} (Camunda ID: {}) to task {}", 
                        config.getAssigneeGroup(), camundaGroupId, task.getId());
                taskService.addCandidateGroup(task.getId(), camundaGroupId);
                
            } else if (config.getAssigneeEntity() != null && !config.getAssigneeEntity().isEmpty()) {
                // Pour les entités, il faudrait implémenter une logique spécifique
                // qui dépend de comment les entités sont mappées aux utilisateurs/groupes
                log.info("Entity assignment requested for task {} with entity {}", 
                        task.getId(), config.getAssigneeEntity());
                
                // Exemple: si l'entité correspond à un groupe
                String entityGroupId = config.getAssigneeEntity();
                String camundaEntityId = camundaIdentityService.getCamundaId(entityGroupId, false);
                if (camundaEntityId == null) {
                    camundaIdentityService.ensureGroupExists(entityGroupId);
                    camundaEntityId = camundaIdentityService.getCamundaId(entityGroupId, true);
                }
                
                taskService.addCandidateGroup(task.getId(), camundaEntityId);
            }
            
            // Gérer les responsables et intéressés si nécessaire
            if (config.getResponsibleUser() != null && !config.getResponsibleUser().isEmpty()) {
                // Ajouter comme candidat utilisateur
                String camundaResponsibleId = camundaIdentityService.getCamundaId(config.getResponsibleUser(), false);
                if (camundaResponsibleId == null) {
                    camundaIdentityService.ensureUserExists(config.getResponsibleUser());
                    camundaResponsibleId = camundaIdentityService.getCamundaId(config.getResponsibleUser(), true);
                }
                
                log.info("Adding responsible user {} as candidate to task {}", 
                        config.getResponsibleUser(), task.getId());
                taskService.addCandidateUser(task.getId(), camundaResponsibleId);
            }
            
            if (config.getInterestedUser() != null && !config.getInterestedUser().isEmpty()) {
                // Pour les utilisateurs intéressés, on pourrait les ajouter comme observateurs
                // ou implémenter une logique de notification spécifique
                log.info("User {} is interested in task {}", config.getInterestedUser(), task.getId());
                // Implémentation selon les besoins
            }
            
            // Vérifier si cette tâche est liée à une passerelle pour préparer les assignations futures
            analyzeTaskGatewayContext(task);
            
            log.info("Task assignment completed for task {}", task.getId());
            
        } catch (Exception e) {
            log.error("Error assigning task {}: {}", task.getId(), e.getMessage(), e);
            // Ne pas propager l'exception pour ne pas bloquer le processus
        }
    }
    
    /**
     * Extrait la clé du processus à partir de l'ID de définition du processus
     * Format typique: "process-key:version:deployment-id"
     */
    private String extractProcessKeyFromDefinitionId(String processDefinitionId) {
        if (processDefinitionId == null || processDefinitionId.isEmpty()) {
            return null;
        }
        
        // La clé du processus est généralement la première partie avant le premier ':'
        int colonIndex = processDefinitionId.indexOf(':');
        if (colonIndex > 0) {
            return processDefinitionId.substring(0, colonIndex);
        }
        
        return processDefinitionId; // Retourner l'ID complet si le format est différent
    }
    
    /**
     * Analyse le contexte de passerelles BPMN pour une tâche donnée
     * Cette méthode examine si la tâche est liée à des passerelles (gateways) et prépare
     * le suivi du flux pour les assignations futures
     * 
     * @param task La tâche à analyser
     */
    private void analyzeTaskGatewayContext(Task task) {
        try {
            // Récupérer le modèle BPMN pour cette instance de processus
            String processDefinitionId = task.getProcessDefinitionId();
            BpmnModelInstance modelInstance = repositoryService
                    .getBpmnModelInstance(processDefinitionId);
            
            if (modelInstance == null) {
                log.warn("Could not retrieve BPMN model for process definition {}", processDefinitionId);
                return;
            }
            
            // Récupérer l'élément de tâche dans le modèle BPMN
            String taskDefinitionKey = task.getTaskDefinitionKey();
            UserTask userTask = modelInstance.getModelElementById(taskDefinitionKey);
            
            if (userTask == null) {
                log.warn("Could not find task {} in BPMN model", taskDefinitionKey);
                return;
            }
            
            // Analyser les flux sortants de cette tâche
            Collection<SequenceFlow> outgoingFlows = userTask.getOutgoing();
            if (outgoingFlows.isEmpty()) {
                log.info("Task {} has no outgoing flows", taskDefinitionKey);
                return;
            }
            
            // Vérifier si l'un des flux sortants mène à une passerelle
            for (SequenceFlow flow : outgoingFlows) {
                FlowNode targetNode = flow.getTarget();
                
                // Vérifier le type de noeud cible
                if (targetNode instanceof ExclusiveGateway) {
                    log.info("Task {} leads to an exclusive gateway {}", 
                            taskDefinitionKey, targetNode.getId());
                    analyzeExclusiveGateway((ExclusiveGateway) targetNode, task);
                    
                } else if (targetNode instanceof ParallelGateway) {
                    log.info("Task {} leads to a parallel gateway {}", 
                            taskDefinitionKey, targetNode.getId());
                    analyzeParallelGateway((ParallelGateway) targetNode, task);
                    
                } else if (targetNode instanceof InclusiveGateway) {
                    log.info("Task {} leads to an inclusive gateway {}", 
                            taskDefinitionKey, targetNode.getId());
                    analyzeInclusiveGateway((InclusiveGateway) targetNode, task);
                }
            }
            
        } catch (Exception e) {
            log.error("Error analyzing gateway context for task {}: {}", 
                    task.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Analyse une passerelle exclusive (XOR) et ses chemins potentiels
     * @param gateway La passerelle à analyser
     * @param sourceTask La tâche source qui mène à cette passerelle
     */
    private void analyzeExclusiveGateway(ExclusiveGateway gateway, Task sourceTask) {
        // Récupérer tous les flux sortants de la passerelle
        Collection<SequenceFlow> outgoingFlows = gateway.getOutgoing();
        
        log.info("Exclusive gateway {} has {} outgoing paths", 
                gateway.getId(), outgoingFlows.size());
        
        // Pour chaque flux sortant, identifier les tâches potentielles
        for (SequenceFlow flow : outgoingFlows) {
            // Vérifier les conditions sur ce flux (pour les passerelles exclusives)
            String condition = flow.getConditionExpression() != null ? 
                    flow.getConditionExpression().getTextContent() : "<default>";
            
            log.info("Path from gateway {} with condition: {}", 
                    gateway.getId(), condition);
            
            // Suivre ce chemin pour trouver les tâches potentielles
            identifyTasksInPath(flow.getTarget(), new HashSet<>());
        }
    }
    
    /**
     * Analyse une passerelle parallèle (AND) et ses chemins
     * @param gateway La passerelle à analyser
     * @param sourceTask La tâche source qui mène à cette passerelle
     */
    private void analyzeParallelGateway(ParallelGateway gateway, Task sourceTask) {
        // Récupérer tous les flux sortants de la passerelle
        Collection<SequenceFlow> outgoingFlows = gateway.getOutgoing();
        
        log.info("Parallel gateway {} has {} outgoing paths (all will be executed)", 
                gateway.getId(), outgoingFlows.size());
        
        // Pour une passerelle parallèle, toutes les branches seront exécutées
        for (SequenceFlow flow : outgoingFlows) {
            log.info("Following parallel path from gateway {}", gateway.getId());
            
            // Suivre ce chemin pour trouver les tâches
            identifyTasksInPath(flow.getTarget(), new HashSet<>());
        }
    }
    
    /**
     * Analyse une passerelle inclusive (OR) et ses chemins potentiels
     * @param gateway La passerelle à analyser
     * @param sourceTask La tâche source qui mène à cette passerelle
     */
    private void analyzeInclusiveGateway(InclusiveGateway gateway, Task sourceTask) {
        // Récupérer tous les flux sortants de la passerelle
        Collection<SequenceFlow> outgoingFlows = gateway.getOutgoing();
        
        log.info("Inclusive gateway {} has {} outgoing paths (multiple may be executed)", 
                gateway.getId(), outgoingFlows.size());
        
        // Pour chaque flux sortant, vérifier les conditions et identifier les tâches potentielles
        for (SequenceFlow flow : outgoingFlows) {
            String condition = flow.getConditionExpression() != null ? 
                    flow.getConditionExpression().getTextContent() : "<default>";
            
            log.info("Path from inclusive gateway {} with condition: {}", 
                    gateway.getId(), condition);
            
            // Suivre ce chemin pour trouver les tâches potentielles
            identifyTasksInPath(flow.getTarget(), new HashSet<>());
        }
    }
    
    /**
     * Identifie récursivement les tâches dans un chemin à partir d'un noeud de flux
     * @param node Le noeud de départ
     * @param visitedNodes Ensemble des noeuds déjà visités (pour éviter les boucles infinies)
     */
    private void identifyTasksInPath(FlowNode node, Set<String> visitedNodes) {
        // Éviter les boucles infinies
        if (node == null || visitedNodes.contains(node.getId())) {
            return;
        }
        
        visitedNodes.add(node.getId());
        // Si c'est une tâche utilisateur, l'enregistrer
        if (node instanceof UserTask) {
            UserTask userTask = (UserTask) node;
            log.info("Found potential next task: {} ({})", 
                    userTask.getId(), userTask.getName());
            
            // Ici, on pourrait pré-charger la configuration de cette tâche
            // ou stocker l'information pour une utilisation future
            String processKey = null;
            // Récupérer le processus parent pour obtenir l'ID
            ModelElementInstance parent = userTask.getParentElement();
            if (parent instanceof Process) {
                Process process = (Process) parent;
                processKey = process.getId();
            }
            
            if (processKey != null) {
                Optional<TaskConfiguration> configOpt = taskConfigurationRepository
                        .findByProcessDefinitionKeyAndTaskId(processKey, userTask.getId());
                
                if (configOpt.isPresent()) {
                    log.info("Pre-loaded configuration for potential task {}", userTask.getId());
                }
            } else {
                log.warn("Could not determine process key for task {}", userTask.getId());
            }
        }
        
        // Continuer à suivre les chemins sortants
        Collection<SequenceFlow> outgoingFlows = node.getOutgoing();
        for (SequenceFlow flow : outgoingFlows) {
            identifyTasksInPath(flow.getTarget(), new HashSet<>(visitedNodes));
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
     * Transform BPMN XML to use a specific process key
     */
    private String transformBpmnWithUniqueKey(String bpmnXml, String uniqueKey) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new InputSource(new StringReader(bpmnXml)));

            // Find and update process elements
            NodeList processes = document.getElementsByTagNameNS("http://www.omg.org/spec/BPMN/20100524/MODEL", "process");
            for (int i = 0; i < processes.getLength(); i++) {
                Element process = (Element) processes.item(i);
                process.setAttribute("id", uniqueKey);
                log.info("Updated process ID to: {}", uniqueKey);
            }

            // Also update any process references in other elements
            NodeList processRefs = document.getElementsByTagNameNS("http://www.omg.org/spec/BPMN/20100524/MODEL", "processRef");
            for (int i = 0; i < processRefs.getLength(); i++) {
                Element processRef = (Element) processRefs.item(i);
                if (processRef.getTextContent() != null && !processRef.getTextContent().isEmpty()) {
                    String originalRef = processRef.getTextContent();
                    // Only replace if it matches a process ID pattern
                    if (originalRef.matches("Process_\\d+") || originalRef.matches("Process_\\d+_\\d+")) {
                        processRef.setTextContent(uniqueKey);
                        log.info("Updated process reference from {} to {}", originalRef, uniqueKey);
                    }
                }
            }

            // Convert back to string
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(writer));

            return writer.toString();

        } catch (Exception e) {
            log.error("Error transforming BPMN XML with unique key: {}", uniqueKey, e);
            throw new RuntimeException("Failed to transform BPMN XML with unique key: " + e.getMessage(), e);
        }
    }
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
        
        // Collecter les IDs d'utilisateurs et de groupes pour synchronisation
        Set<String> userIds = new HashSet<>();
        Set<String> groupIds = new HashSet<>();
        Map<String, List<String>> userGroupMappings = new HashMap<>();
        
        // Parcourir toutes les variables
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            // Variables d'assignation utilisateur
            if (key.toLowerCase().contains("assignee") || 
                key.toLowerCase().contains("user") || 
                key.toLowerCase().contains("responsible")) {
                if (value instanceof String) {
                    String userId = (String) value;
                    if (!userId.isEmpty()) {
                        userIds.add(userId);
                        camundaIdentityService.ensureUserExists(userId);
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
            camundaIdentityService.synchronizeWithCamunda(new ArrayList<>(userIds), new ArrayList<>(groupIds), userGroupMappings);
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
            
            // Utiliser la méthode synchronizeWithCamunda pour synchroniser tous les utilisateurs et groupes en une seule fois
            Map<String, List<String>> userGroupMappings = new HashMap<>(); // Pas de mappings spécifiques ici
            try {
                camundaIdentityService.synchronizeWithCamunda(userIds, groupIds, userGroupMappings);
                log.info("Synchronisation réussie de {} utilisateurs et {} groupes/entités", userIds.size(), groupIds.size());
            } catch (Exception e) {
                log.error("Erreur lors de la synchronisation des utilisateurs et groupes: {}", e.getMessage(), e);
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

    /**
     * Get deployed processes by user
     */
    public List<ProcessDefinitionDTO> getDeployedProcessesByUser(String userId) {
        try {
            log.info("Retrieving deployed processes for user: {}", userId);
            
            // Get process definitions from our database deployed by the user
            List<ProcessDefinition> userProcesses = processDefinitionRepository.findByDeployedBy(userId);
            

            // Convert to DTOs and add Camunda information
            List<ProcessDefinitionDTO> processDefinitions = new ArrayList<>();
            
            for (ProcessDefinition process : userProcesses) {
                ProcessDefinitionDTO dto = modelMapper.map(process, ProcessDefinitionDTO.class);
                
                // Try to get additional info from Camunda if process is deployed
                try {
                    if (process.getProcessDefinitionId() != null) {
                        org.camunda.bpm.engine.repository.ProcessDefinition camundaProcess = 
                            repositoryService.createProcessDefinitionQuery()
                                .processDefinitionId(process.getProcessDefinitionId())
                                .singleResult();
                        
                        if (camundaProcess != null) {
                            dto.setDeploymentId(camundaProcess.getDeploymentId());
                            dto.setVersion(camundaProcess.getVersion());
                            // Note: ProcessDefinitionDTO doesn't have suspended field, we use active instead
                            dto.setActive(!camundaProcess.isSuspended());
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not get Camunda info for process {}: {}", process.getProcessDefinitionKey(), e.getMessage());
                }
                
                processDefinitions.add(dto);
            }
            
            log.info("Found {} deployed processes for user: {}", processDefinitions.size(), userId);
            return processDefinitions;
            
        } catch (Exception e) {
            log.error("Error retrieving deployed processes for user: {}", userId, e);
            throw new RuntimeException("Failed to retrieve deployed processes for user: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get deployed processes with general information
     */
    public List<Map<String, Object>> getDeployedProcessesWithInfo(String userId) {
        try {
            log.info("Retrieving deployed processes with info for user: {}", userId);
            
            List<ProcessDefinition> userProcesses = processDefinitionRepository.findByDeployedBy(userId);
            List<Map<String, Object>> processesWithInfo = new ArrayList<>();
            
            for (ProcessDefinition process : userProcesses) {
                Map<String, Object> processInfo = new HashMap<>();
                
                // Basic process information
                processInfo.put("id", process.getId());
                processInfo.put("processDefinitionKey", process.getProcessDefinitionKey());
                processInfo.put("processDefinitionId", process.getProcessDefinitionId());
                processInfo.put("name", process.getName());
                processInfo.put("description", process.getDescription());
                processInfo.put("deployedBy", process.getDeployedBy());
                processInfo.put("deployedAt", process.getDeployedAt());
                processInfo.put("version", process.getVersion());
                processInfo.put("isActive", process.getActive());
                
                // Camunda-specific information
                try {
                    if (process.getProcessDefinitionId() != null) {
                        org.camunda.bpm.engine.repository.ProcessDefinition camundaProcess = 
                            repositoryService.createProcessDefinitionQuery()
                                .processDefinitionId(process.getProcessDefinitionId())
                                .singleResult();
                        
                        if (camundaProcess != null) {
                            processInfo.put("deploymentId", camundaProcess.getDeploymentId());
                            processInfo.put("camundaVersion", camundaProcess.getVersion());
                            processInfo.put("suspended", camundaProcess.isSuspended());
                            
                            // Get instance count
                            long instanceCount = runtimeService.createProcessInstanceQuery()
                                .processDefinitionKey(process.getProcessDefinitionKey())
                                .count();
                            processInfo.put("instanceCount", instanceCount);
                            
                            // Get active instance count
                            long activeInstanceCount = runtimeService.createProcessInstanceQuery()
                                .processDefinitionKey(process.getProcessDefinitionKey())
                                .active()
                                .count();
                            processInfo.put("activeInstanceCount", activeInstanceCount);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not get Camunda info for process {}: {}", process.getProcessDefinitionKey(), e.getMessage());
                    processInfo.put("instanceCount", 0);
                    processInfo.put("activeInstanceCount", 0);
                }
                
                processesWithInfo.add(processInfo);
            }
            
            log.info("Retrieved {} processes with info for user: {}", processesWithInfo.size(), userId);
            return processesWithInfo;
            
        } catch (Exception e) {
            log.error("Error retrieving processes with info for user: {}", userId, e);
            throw new RuntimeException("Failed to retrieve processes with info for user: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get process definition information
     */
    public Map<String, Object> getProcessDefinitionInfo(String processDefinitionKey) {
        try {
            log.info("Retrieving process definition info for: {}", processDefinitionKey);
            
            Map<String, Object> processInfo = new HashMap<>();
            
            // Get from our database first
            Optional<ProcessDefinition> processDefOpt = processDefinitionRepository
                .findFirstByProcessDefinitionKeyOrderByVersionDesc(processDefinitionKey);
            
            if (processDefOpt.isPresent()) {
                ProcessDefinition processDef = processDefOpt.get();
                processInfo.put("id", processDef.getId());
                processInfo.put("processDefinitionKey", processDef.getProcessDefinitionKey());
                processInfo.put("name", processDef.getName());
                processInfo.put("description", processDef.getDescription());
                processInfo.put("deployedBy", processDef.getDeployedBy());
                processInfo.put("deployedAt", processDef.getDeployedAt());
                processInfo.put("version", processDef.getVersion());
                processInfo.put("isActive", processDef.getActive());

                // Include general metadata if present
                processInfo.put("processName", processDef.getProcessName());
                processInfo.put("processDescription", processDef.getProcessDescription());
                processInfo.put("processTags", processDef.getProcessTags());

                // Build image descriptors with frontend-consumable URLs
                if (processDef.getImages() != null && !processDef.getImages().isEmpty()) {
                    List<Map<String, Object>> images = new ArrayList<>();
                    for (ProcessImage img : processDef.getImages()) {
                        Map<String, Object> imgMap = new HashMap<>();
                        imgMap.put("fileName", img.getFileName());
                        imgMap.put("originalFileName", img.getOriginalFileName());
                        imgMap.put("contentType", img.getContentType());
                        imgMap.put("fileSize", img.getFileSize());
                        imgMap.put("description", img.getDescription());
                        imgMap.put("displayOrder", img.getDisplayOrder());
                        imgMap.put("filePath", img.getFilePath());

                        // Construct a URL to serve the image via controller
                        if (img.getFilePath() != null) {
                            String encodedPath = URLEncoder.encode(img.getFilePath(), StandardCharsets.UTF_8);
                            String url = "/api/process-engine/files/" + encodedPath;
                            imgMap.put("url", url);
                        } else if (img.getImageData() != null) {
                            // Fallback for legacy imageData stored in DB (base64)
                            imgMap.put("base64", img.getImageDataAsBase64());
                        }
                        images.add(imgMap);
                    }
                    // Sort by display order
                    images.sort((a, b) -> {
                        Integer da = (Integer) a.getOrDefault("displayOrder", 0);
                        Integer db = (Integer) b.getOrDefault("displayOrder", 0);
                        return Integer.compare(da, db);
                    });
                    processInfo.put("images", images);
                } else {
                    processInfo.put("images", new ArrayList<>());
                }
            }
            
            // Get additional info from Camunda
            try {
                org.camunda.bpm.engine.repository.ProcessDefinition camundaProcess = 
                    repositoryService.createProcessDefinitionQuery()
                        .processDefinitionKey(processDefinitionKey)
                        .latestVersion()
                        .singleResult();
                
                if (camundaProcess != null) {
                    processInfo.put("processDefinitionId", camundaProcess.getId());
                    processInfo.put("deploymentId", camundaProcess.getDeploymentId());
                    processInfo.put("camundaVersion", camundaProcess.getVersion());
                    processInfo.put("suspended", camundaProcess.isSuspended());
                    processInfo.put("resourceName", camundaProcess.getResourceName());
                    
                    // Get instance statistics
                    long totalInstances = historyService.createHistoricProcessInstanceQuery()
                        .processDefinitionKey(processDefinitionKey)
                        .count();
                    processInfo.put("totalInstances", totalInstances);
                    
                    long activeInstances = runtimeService.createProcessInstanceQuery()
                        .processDefinitionKey(processDefinitionKey)
                        .active()
                        .count();
                    processInfo.put("activeInstances", activeInstances);
                    
                    long completedInstances = historyService.createHistoricProcessInstanceQuery()
                        .processDefinitionKey(processDefinitionKey)
                        .finished()
                        .count();
                    processInfo.put("completedInstances", completedInstances);
                    
                } else {
                    processInfo.put("message", "Process not found in Camunda engine");
                }
                
            } catch (Exception e) {
                log.warn("Could not get Camunda info for process {}: {}", processDefinitionKey, e.getMessage());
                processInfo.put("camundaError", e.getMessage());
            }
            
            return processInfo;
            
        } catch (Exception e) {
            log.error("Error retrieving process definition info for: {}", processDefinitionKey, e);
            throw new RuntimeException("Failed to retrieve process definition info: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get process instances where the user participates (either started them or has tasks assigned)
     * @param userId The user ID to search for
     * @return List of process instances where the user participates
     */
    public List<ProcessInstanceDTO> getProcessInstancesByUser(String userId) {
        try {
            log.info("====================================>>>Retrieving process instances where user participates: {}", userId);

            Set<String> processInstanceIds = new HashSet<>();

            // 1. Get instances started by the user
            List<ProcessInstance> startedInstances = processInstanceRepository.findByStartUserId(userId);
            log.info("Found {} instances started by user", startedInstances.size());

            for (ProcessInstance instance : startedInstances) {
                if (instance.getProcessInstanceId() != null) {
                    processInstanceIds.add(instance.getProcessInstanceId());
                }
            }

            // 2. Get instances where user has tasks (assigned directly or via groups)
            String camundaUserId = camundaIdentityService.getCamundaId(userId, false);
            if (camundaUserId != null) {
                // Get tasks assigned directly to the user
                List<Task> assignedTasks = taskService.createTaskQuery()
                        .taskAssignee(camundaUserId)
                        .list();

                // Get tasks where user is a candidate
                List<Task> candidateTasks = taskService.createTaskQuery()
                        .taskCandidateUser(camundaUserId)
                        .list();

                // Get user's groups
                List<org.camunda.bpm.engine.identity.Group> userGroups =
                    camundaIdentityService.getIdentityService().createGroupQuery()
                        .groupMember(camundaUserId)
                        .list();

                List<String> groupIds = userGroups.stream()
                    .map(org.camunda.bpm.engine.identity.Group::getId)
                    .collect(Collectors.toList());

                // Get tasks assigned to user's groups
                List<Task> groupTasks = new ArrayList<>();
                if (!groupIds.isEmpty()) {
                    groupTasks = taskService.createTaskQuery()
                            .taskCandidateGroupIn(groupIds)
                            .list();
                }

                // Collect process instance IDs from all tasks
                List<Task> allUserTasks = new ArrayList<>();
                allUserTasks.addAll(assignedTasks);
                allUserTasks.addAll(candidateTasks);
                allUserTasks.addAll(groupTasks);

                log.info("Found {} tasks for user across all assignment types", allUserTasks.size());

                for (Task task : allUserTasks) {
                    if (task.getProcessInstanceId() != null) {
                        processInstanceIds.add(task.getProcessInstanceId());
                    }
                }
            } else {
                log.warn("No Camunda ID mapping found for user: {}", userId);
            }

            // 3. Get all process instances from our database that match the collected IDs
            List<ProcessInstance> allInstances = new ArrayList<>();
            if (!processInstanceIds.isEmpty()) {
                allInstances = processInstanceRepository.findByProcessInstanceIdIn(processInstanceIds);
                log.info("Found {} matching process instances in database", allInstances.size());
            }

            // 4. Convert to DTOs and enrich with Camunda information
            List<ProcessInstanceDTO> processInstances = new ArrayList<>();
            for (ProcessInstance instance : allInstances) {
                ProcessInstanceDTO dto = modelMapper.map(instance, ProcessInstanceDTO.class);

                // Try to get additional info from Camunda
                try {
                    if (instance.getProcessInstanceId() != null) {
                        // Check if still active in Camunda
                        org.camunda.bpm.engine.runtime.ProcessInstance camundaInstance =
                            runtimeService.createProcessInstanceQuery()
                                .processInstanceId(instance.getProcessInstanceId())
                                .singleResult();

                        if (camundaInstance != null) {
                            dto.setBusinessKey(camundaInstance.getBusinessKey());
                            // Instance is still active
                        } else {
                            // Check in history
                            org.camunda.bpm.engine.history.HistoricProcessInstance historicInstance =
                                historyService.createHistoricProcessInstanceQuery()
                                    .processInstanceId(instance.getProcessInstanceId())
                                    .singleResult();

                            if (historicInstance != null && historicInstance.getEndTime() != null) {
                                dto.setState(ProcessInstance.ProcessInstanceState.COMPLETED);
                                dto.setEndTime(convertToLocalDateTime(historicInstance.getEndTime()));
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not get Camunda info for process instance {}: {}",
                        instance.getProcessInstanceId(), e.getMessage());
                }

                // Enrichir le DTO avec les métadonnées du processus
                enrichProcessInstanceDTO(dto, instance.getProcessDefinitionKey());
                processInstances.add(dto);
            }

            log.info("Returning {} process instances where user participates", processInstances.size());
            return processInstances;

        } catch (Exception e) {
            log.error("Error retrieving process instances where user participates: {}", userId, e);
            throw new RuntimeException("Failed to retrieve process instances where user participates: " + e.getMessage(), e);
        }
    }
    
    private LocalDateTime convertToLocalDateTime(java.util.Date date){
        if (date == null) return null;
        return date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
    }
    
    /**
     * Enrichit un ProcessInstanceDTO avec les métadonnées du processus (nom, description, tags, images)
     * @param dto Le DTO à enrichir
     * @param processDefinitionKey La clé du processus
     */
    private void enrichProcessInstanceDTO(ProcessInstanceDTO dto, String processDefinitionKey) {
        if (processDefinitionKey == null) {
            return;
        }
        
        try {
            // Récupérer la définition du processus
            Optional<ProcessDefinition> processDefOpt = processDefinitionRepository.findLatestActiveByProcessDefinitionKey(processDefinitionKey);
            
            if (processDefOpt.isPresent()) {
                ProcessDefinition processDef = processDefOpt.get();
                
                // Ajouter les métadonnées
                dto.setProcessName(processDef.getProcessName());
                dto.setProcessDescription(processDef.getProcessDescription());
                
                // Ajouter les tags
                if (processDef.getProcessTags() != null) {
                    dto.setProcessTags(new ArrayList<>(processDef.getProcessTags()));
                }
                
                // Ajouter les images
                if (processDef.getImages() != null && !processDef.getImages().isEmpty()) {
                    List<ProcessImageDTO> imageDTOs = processDef.getImages().stream()
                        .map(image -> {
                            ProcessImageDTO imageDTO = new ProcessImageDTO();
                            imageDTO.setId(image.getId());
                            imageDTO.setFileName(image.getFileName());
                            imageDTO.setOriginalFileName(image.getOriginalFileName());
                            imageDTO.setContentType(image.getContentType());
                            imageDTO.setFileSize(image.getFileSize());
                            imageDTO.setDescription(image.getDescription());
                            imageDTO.setFilePath(image.getFilePath());
                            return imageDTO;
                        })
                        .collect(Collectors.toList());
                    
                    dto.setImages(imageDTOs);
                }
            }
        } catch (Exception e) {
            log.warn("Could not enrich process instance DTO with process definition data: {}", e.getMessage());
        }
    }
    
    /**
     * Sauvegarde les images des processus sur le système de fichiers
     * @param processKey Clé du processus
     * @param images Liste des DTOs d'images
     * @return Liste des chemins des images sauvegardées
     */
    private List<String> saveImagesToFileSystem(String processKey, List<ProcessImageDTO> images) {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> imagePaths = new ArrayList<>();
        Path processDirectory = Paths.get(PROCESS_IMAGES_DIRECTORY, processKey);

        try {
            // Créer le répertoire du processus s'il n'existe pas
            Files.createDirectories(processDirectory);

            for (ProcessImageDTO imageDto : images) {
                try {
                    // Générer un nom de fichier unique
                    String fileExtension = getFileExtension(imageDto.getFileName());
                    String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
                    Path imagePath = processDirectory.resolve(uniqueFileName);

                    // Convertir les données base64 en bytes et les écrire dans le fichier
                    if (imageDto.getImageData() != null && !imageDto.getImageData().isEmpty()) {
                        byte[] imageBytes = java.util.Base64.getDecoder().decode(imageDto.getImageData());
                        Files.write(imagePath, imageBytes);
                        imagePaths.add("/process-images/" + processKey + "/" + uniqueFileName);
                        log.info("Image saved to filesystem: {}", imagePath.toString());
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid base64 image data for file: {}, skipping", imageDto.getFileName());
                }
            }
        } catch (IOException e) {
            log.error("Error creating process images directory: {}", processDirectory, e);
            throw new RuntimeException("Failed to save process images: " + e.getMessage(), e);
        }

        return imagePaths;
    }

    /**
     * Extrait l'extension du fichier à partir du nom de fichier
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "jpg"; // Extension par défaut
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }
}
