package com.harmony.harmoniservices.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmony.harmoniservices.dto.ProcessDefinitionDTO;
import com.harmony.harmoniservices.dto.ProcessInstanceDTO;
import com.harmony.harmoniservices.dto.ProcessMetadataDTO;
import com.harmony.harmoniservices.dto.TaskConfigurationDTO;
import com.harmony.harmoniservices.dto.TaskDTO;
import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.UserRepository;
import com.harmony.harmoniservices.services.CamundaIdentityService;
import com.harmony.harmoniservices.services.ProcessEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/process-engine")
@RequiredArgsConstructor
@Slf4j
public class ProcessEngineController {

    private final ProcessEngineService processEngineService;
    private final CamundaIdentityService camundaIdentityService;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    
    /**
     * Deploy BPMN process with task configurations
     */
    @PostMapping("/deploy")
    public ResponseEntity<ApiResponse<ProcessDefinitionDTO>> deployProcess(
            @RequestParam("file") MultipartFile bpmnFile,
            @RequestParam("configurations") String configurationsJson,
            @RequestParam(value = "metadata", required = false) String metadataJson,
            @RequestParam(value = "deployToEngine", defaultValue = "true") boolean deployToEngine,
            @RequestParam(value = "forceCreate", defaultValue = "false") boolean forceCreate,
            Authentication authentication) {
       
        try {
            // Validate file
            if (bpmnFile.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("BPMN file is required"));
            }

            String filename = bpmnFile.getOriginalFilename();
            if (filename == null || !filename.endsWith(".bpmn")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("File must be a .bpmn file"));
            }

            // Parse BPMN content
            String bpmnXml = new String(bpmnFile.getBytes());

            // Parse task configurations
            List<TaskConfigurationDTO> taskConfigurations = objectMapper.readValue(
                    configurationsJson, 
                    new TypeReference<List<TaskConfigurationDTO>>() {}
            );

            // Parse process metadata (optional)
            ProcessMetadataDTO processMetadata = null;
            if (metadataJson != null && !metadataJson.trim().isEmpty()) {
                try {
                    processMetadata = objectMapper.readValue(metadataJson, ProcessMetadataDTO.class);
                    log.info("Parsed process metadata: {}", processMetadata.getProcessName());
                } catch (Exception e) {
                    log.warn("Failed to parse process metadata: {}", e.getMessage());
                    // Continue without metadata rather than failing the deployment
                }
            }

            // Get current user email from authentication
            String userEmail = authentication != null ? authentication.getName() : "system";

            // Find user by email to get the user ID
            Optional<UserEntity> user = userRepository.findByEmail(userEmail);

            // Vérifier si l'utilisateur existe
            if (!user.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + userEmail);
            }
            
            // Get user ID for deployment (this is what will be used in process configurations)
            String deployedByUserId = user.get().getId().toString();
            
            
            ProcessDefinitionDTO processDefinition = processEngineService.deployProcess(
                    bpmnXml, taskConfigurations, processMetadata, deployedByUserId, deployToEngine, forceCreate);

            log.info("Successfully deployed process: {} by user: {}", 
                    processDefinition.getProcessDefinitionKey(), deployedByUserId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Process deployed successfully", processDefinition));

        } catch (Exception e) {
            log.error("Error deploying process", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to deploy process: " + e.getMessage()));
        }
    }

    /**
     * Start a process instance
     */
    @PostMapping("/start/{processDefinitionKey}")
    public ResponseEntity<ApiResponse<ProcessInstanceDTO>> startProcess(
            @PathVariable String processDefinitionKey,
            @RequestBody(required = false) Map<String, Object> variables,
            Authentication authentication) {
        
        try {
            if (variables == null) {
                variables = new HashMap<>();
            }

            String startUserId = authentication != null ? authentication.getName() : "system";

            ProcessInstanceDTO processInstance = processEngineService.startProcess(
                    processDefinitionKey, variables, startUserId);

            log.info("Started process instance: {} for process: {} by user: {}", 
                    processInstance.getProcessInstanceId(), processDefinitionKey, startUserId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Process started successfully", processInstance));

        } catch (Exception e) {
            log.error("Error starting process: {}", processDefinitionKey, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to start process: " + e.getMessage()));
        }
    }

    /**
     * Get tasks assigned to current user
     */
    @GetMapping("/tasks/my-tasks")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getMyTasks(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authentication required"));
            }

            String userId = authentication.getName();
            Optional<UserEntity> user = userRepository.findByEmail(userId);


            if (!user.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + userId);
            }
          
            List<TaskDTO> tasks = processEngineService.getTasksForUser(user.get().getId().toString());

            return ResponseEntity.ok(ApiResponse.success(
                    "Tasks retrieved successfully", tasks));

        } catch (Exception e) {
            log.error("Error retrieving tasks for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve tasks: " + e.getMessage()));
        }
    }
    
    /**
     * Get tasks assigned to a specific user
     */
    @GetMapping("/tasks/user/{userId}")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getUserTasks(@PathVariable String userId) {
        try {
            List<TaskDTO> tasks = processEngineService.getTasksForUser(userId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Tasks retrieved successfully for user: " + userId, tasks));

        } catch (Exception e) {
            log.error("Error retrieving tasks for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve tasks: " + e.getMessage()));
        }
    }
    
    /**
     * Get tasks for a specific group
     */
    @GetMapping("/tasks/group/{groupId}")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getGroupTasks(@PathVariable String groupId) {
        try {
            List<TaskDTO> tasks = processEngineService.getTasksForUserGroups(List.of(groupId));

            return ResponseEntity.ok(ApiResponse.success(
                    "Tasks retrieved successfully for group: " + groupId, tasks));

        } catch (Exception e) {
            log.error("Error retrieving tasks for group: {}", groupId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve tasks: " + e.getMessage()));
        }
    }

    /**
     * Get task details
     */
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTaskDetails(@PathVariable String taskId) {
        try {
            // This would typically involve getting task details from Camunda
            // and combining with configuration data
            Map<String, Object> taskDetails = new HashMap<>();
            taskDetails.put("taskId", taskId);
            taskDetails.put("message", "Task details endpoint - implementation depends on specific requirements");

            return ResponseEntity.ok(ApiResponse.success(
                    "Task details retrieved successfully", taskDetails));

        } catch (Exception e) {
            log.error("Error retrieving task details for task: {}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve task details: " + e.getMessage()));
        }
    }

    /**
     * Complete a task
     */
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<ApiResponse<String>> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> variables,
            Authentication authentication) {
        
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authentication required"));
            }

            if (variables == null) {
                variables = new HashMap<>();
            }

            // Get current user email from authentication
            String userEmail = authentication.getName();
            
            // Find user by email to get the user ID
            Optional<UserEntity> user = userRepository.findByEmail(userEmail);
            
            if (!user.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + userEmail);
            }
            
            // Get user ID for task completion
            String userId = user.get().getId().toString();
            
            System.out.println("=============================>>>>>>Completing task " + taskId + " with user ID: " + userId + " (email: " + userEmail + ")");
            
            processEngineService.completeTask(taskId, variables, userId);

            log.info("Task {} completed by user {} (ID: {})", taskId, userEmail, userId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Task completed successfully", "Task " + taskId + " has been completed"));

        } catch (Exception e) {
            log.error("Error completing task: {}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to complete task: " + e.getMessage()));
        }
    }

    /**
     * Get active process instances
     */
    @GetMapping("/processes")
    public ResponseEntity<ApiResponse<List<ProcessInstanceDTO>>> getActiveProcesses() {
        try {
            List<ProcessInstanceDTO> processes = processEngineService.getActiveProcesses();
            return ResponseEntity.ok(ApiResponse.success(
                    "Active processes retrieved successfully", processes));

        } catch (Exception e) {
            log.error("Error retrieving active processes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve active processes: " + e.getMessage()));
        }
    }
    
  

    /**
     * Get deployed processes by current user
     */
    @GetMapping("/my-deployed-processes")
    public ResponseEntity<ApiResponse<List<ProcessDefinitionDTO>>> getMyDeployedProcesses(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authentication required"));
            }

            String userEmail = authentication.getName();
            Optional<UserEntity> user = userRepository.findByEmail(userEmail);


            if (!user.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + userEmail);
            }
            
            String userId = user.get().getId().toString();
            List<ProcessDefinitionDTO> deployedProcesses = processEngineService.getDeployedProcessesByUser(userId);
            
            log.info("Retrieved {} deployed processes for user: {}", deployedProcesses.size(), userEmail);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Deployed processes retrieved successfully", deployedProcesses));

        } catch (Exception e) {
            log.error("Error retrieving deployed processes for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve deployed processes: " + e.getMessage()));
        }
    }

    /**
     * Get all deployed processes with general information
     */
    @GetMapping("/deployed-processes-with-info")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeployedProcessesWithInfo(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authentication required"));
            }

            String userEmail = authentication.getName();
            Optional<UserEntity> user = userRepository.findByEmail(userEmail);
            
            if (!user.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + userEmail);
            }
            
            String userId = user.get().getId().toString();
            List<Map<String, Object>> processesWithInfo = processEngineService.getDeployedProcessesWithInfo(userId);
            
            log.info("Retrieved {} deployed processes with info for user: {}", processesWithInfo.size(), userEmail);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Deployed processes with info retrieved successfully", processesWithInfo));

        } catch (Exception e) {
            log.error("Error retrieving deployed processes with info for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve deployed processes with info: " + e.getMessage()));
        }
    }

    /**
     * Get process definition details
     */
    @GetMapping("/definitions/{processDefinitionKey}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProcessDefinition(
            @PathVariable String processDefinitionKey) {
        
        try {
            Map<String, Object> processInfo = processEngineService.getProcessDefinitionInfo(processDefinitionKey);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process definition retrieved successfully", processInfo));

        } catch (Exception e) {
            log.error("Error retrieving process definition: {}", processDefinitionKey, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process definition: " + e.getMessage()));
        }
    }

    /**
     * Get process instances by user
     */
    @GetMapping("/my-process-instances")
    public ResponseEntity<ApiResponse<List<ProcessInstanceDTO>>> getMyProcessInstances(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authentication required"));
            }

            String userEmail = authentication.getName();
            Optional<UserEntity> user = userRepository.findByEmail(userEmail);
            
            if (!user.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + userEmail);
            }
            
            String userId = user.get().getEmail().toString();
            List<ProcessInstanceDTO> processInstances = processEngineService.getProcessInstancesByUser(userId);
            
            log.info("Retrieved {} process instances for user: {}", processInstances.size(), userEmail);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process instances retrieved successfully", processInstances));

        } catch (Exception e) {
            log.error("Error retrieving process instances for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process instances: " + e.getMessage()));
        }
    }
    
    /**
     * Synchroniser un utilisateur avec Camunda
     * Crée l'utilisateur dans Camunda s'il n'existe pas déjà
     * et retourne l'ID Camunda correspondant
     */
    @PostMapping("/sync-user/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncUser(
            @PathVariable String userId) {
        
        try {
            log.info("Synchronizing user with Camunda: {}", userId);
            
            // Assurer que l'utilisateur existe dans Camunda
            camundaIdentityService.ensureUserExists(userId);
            
            // Récupérer l'ID Camunda pour cet utilisateur (créer si nécessaire)
            String camundaId = camundaIdentityService.getCamundaId(userId, true);
            
            Map<String, Object> result = new HashMap<>();
            result.put("originalId", userId);
            result.put("camundaId", camundaId);
            result.put("synchronized", true);
            
            log.info("User synchronized successfully: {} -> {}", userId, camundaId);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "User synchronized successfully with Camunda", result));
            
        } catch (Exception e) {
            log.error("Error synchronizing user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to synchronize user: " + e.getMessage()));
        }
    }

    /**
     * Serve process images by file path (supports multiple image types)
     */
    @GetMapping("/files/{filePath:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filePath) {
        try {
            Path file = Paths.get(filePath);
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read file: " + filePath);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
    
    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "svg":
                return "image/svg+xml";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
}
