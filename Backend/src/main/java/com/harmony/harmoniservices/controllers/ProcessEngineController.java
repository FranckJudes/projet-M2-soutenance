package com.harmony.harmoniservices.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmony.harmoniservices.dto.ProcessDefinitionDTO;
import com.harmony.harmoniservices.dto.ProcessInstanceDTO;
import com.harmony.harmoniservices.dto.TaskConfigurationDTO;
import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.services.ProcessEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.task.Task;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/process-engine")
@RequiredArgsConstructor
@Slf4j
public class ProcessEngineController {

    private final ProcessEngineService processEngineService;
    private final ObjectMapper objectMapper;

    /**
     * Deploy BPMN process with task configurations
     */
    @PostMapping("/deploy")
    public ResponseEntity<ApiResponse<ProcessDefinitionDTO>> deployProcess(
            @RequestParam("file") MultipartFile bpmnFile,
            @RequestParam("configurations") String configurationsJson,
            @RequestParam(value = "deployToEngine", defaultValue = "true") boolean deployToEngine,
            Authentication authentication) {
        
        System.out.println("Deploying process with configurations: " + configurationsJson);
        System.out.println("File: " + bpmnFile); 
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

            // Get current user
            String deployedBy = authentication != null ? authentication.getName() : "system";

            // Deploy process with conditional deployment based on deployToEngine parameter
            ProcessDefinitionDTO processDefinition = processEngineService.deployProcess(
                    bpmnXml, taskConfigurations, deployedBy, deployToEngine);

            log.info("Successfully deployed process: {} by user: {}", 
                    processDefinition.getProcessDefinitionKey(), deployedBy);

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
    public ResponseEntity<ApiResponse<List<Task>>> getMyTasks(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authentication required"));
            }

            String userId = authentication.getName();
            List<Task> tasks = processEngineService.getTasksForUser(userId);

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
    public ResponseEntity<ApiResponse<List<Task>>> getUserTasks(@PathVariable String userId) {
        try {
            List<Task> tasks = processEngineService.getTasksForUser(userId);

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
    public ResponseEntity<ApiResponse<List<Task>>> getGroupTasks(@PathVariable String groupId) {
        try {
            List<Task> tasks = processEngineService.getTasksForUserGroups(List.of(groupId));

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

            String userId = authentication.getName();
            processEngineService.completeTask(taskId, variables, userId);

            log.info("Task {} completed by user {}", taskId, userId);

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
            List<ProcessInstanceDTO> activeProcesses = processEngineService.getActiveProcesses();

            return ResponseEntity.ok(ApiResponse.success(
                    "Active processes retrieved successfully", activeProcesses));

        } catch (Exception e) {
            log.error("Error retrieving active processes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve active processes: " + e.getMessage()));
        }
    }

    /**
     * Get process definition details
     */
    @GetMapping("/definitions/{processDefinitionKey}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProcessDefinition(
            @PathVariable String processDefinitionKey) {
        
        try {
            Map<String, Object> processInfo = new HashMap<>();
            processInfo.put("processDefinitionKey", processDefinitionKey);
            processInfo.put("message", "Process definition details endpoint");

            return ResponseEntity.ok(ApiResponse.success(
                    "Process definition retrieved successfully", processInfo));

        } catch (Exception e) {
            log.error("Error retrieving process definition: {}", processDefinitionKey, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process definition: " + e.getMessage()));
        }
    }
}
