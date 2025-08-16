package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.analytics.*;
import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.services.BpmnAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class BpmnAnalyticsController {

    private final BpmnAnalyticsService bpmnAnalyticsService;

    /**
     * Endpoint pour la découverte de processus
     */
    @PostMapping("/process-discovery")
    public ResponseEntity<ApiResponse<ProcessDiscoveryResponseDTO>> processDiscovery(
            @RequestBody ProcessDiscoveryRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Process discovery request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            ProcessDiscoveryResponseDTO result = bpmnAnalyticsService.processDiscovery(request);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process discovery completed successfully", result));
                    
        } catch (Exception e) {
            log.error("Error in process discovery", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to perform process discovery: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour l'analyse des variantes de processus
     */
    @PostMapping("/process-variants")
    public ResponseEntity<ApiResponse<ProcessVariantsResponseDTO>> processVariants(
            @RequestBody ProcessVariantsRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Process variants analysis request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            ProcessVariantsResponseDTO result = bpmnAnalyticsService.processVariants(request);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process variants analysis completed successfully", result));
                    
        } catch (Exception e) {
            log.error("Error in process variants analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to analyze process variants: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour l'analyse des goulots d'étranglement
     */
    @PostMapping("/bottleneck-analysis")
    public ResponseEntity<ApiResponse<BottleneckAnalysisResponseDTO>> bottleneckAnalysis(
            @RequestBody BottleneckAnalysisRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Bottleneck analysis request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            BottleneckAnalysisResponseDTO result = bpmnAnalyticsService.bottleneckAnalysis(request);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Bottleneck analysis completed successfully", result));
                    
        } catch (Exception e) {
            log.error("Error in bottleneck analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to perform bottleneck analysis: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour la prédiction de performance
     */
    @PostMapping("/performance-prediction")
    public ResponseEntity<ApiResponse<PerformancePredictionResponseDTO>> performancePrediction(
            @RequestBody PerformancePredictionRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Performance prediction request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            PerformancePredictionResponseDTO result = bpmnAnalyticsService.performancePrediction(request);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Performance prediction completed successfully", result));
                    
        } catch (Exception e) {
            log.error("Error in performance prediction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to perform performance prediction: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour l'analyse de réseau social
     */
    @PostMapping("/social-network-analysis")
    public ResponseEntity<ApiResponse<SocialNetworkAnalysisResponseDTO>> socialNetworkAnalysis(
            @RequestBody SocialNetworkAnalysisRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Social network analysis request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            SocialNetworkAnalysisResponseDTO result = bpmnAnalyticsService.socialNetworkAnalysis(request);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Social network analysis completed successfully", result));
                    
        } catch (Exception e) {
            log.error("Error in social network analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to perform social network analysis: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour récupérer les logs de processus pour analytics
     */
    @GetMapping("/process-logs/{processDefinitionKey}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProcessLogs(
            @PathVariable String processDefinitionKey,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        try {
            log.info("Process logs request for process: {} from user: {}", 
                    processDefinitionKey, 
                    authentication != null ? authentication.getName() : "anonymous");
            
            List<Map<String, Object>> logs = bpmnAnalyticsService.getProcessLogsForAnalytics(
                    processDefinitionKey, startDate, endDate);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process logs retrieved successfully", logs));
                    
        } catch (Exception e) {
            log.error("Error retrieving process logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process logs: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour récupérer tous les logs d'événements
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllEventLogs(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        try {
            log.info("All event logs request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            List<Map<String, Object>> logs = bpmnAnalyticsService.getAllEventLogs(startDate, endDate);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Event logs retrieved successfully", logs));
                    
        } catch (Exception e) {
            log.error("Error retrieving event logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve event logs: " + e.getMessage()));
        }
    }

    /**
     * Endpoint de test pour diagnostiquer les problèmes de connectivité
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testConnection(
            Authentication authentication) {
        try {
            log.info("Test connection request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            Map<String, Object> testData = new HashMap<>();
            testData.put("message", "Backend analytics is working!");
            testData.put("timestamp", new Date());
            testData.put("user", authentication != null ? authentication.getName() : "anonymous");
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Test connection successful", testData));
                    
        } catch (Exception e) {
            log.error("Error in test connection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Test connection failed: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour récupérer les définitions de processus
     */
    @GetMapping("/process-definitions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProcessDefinitions(
            Authentication authentication) {
        try {
            log.info("Process definitions request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            List<Map<String, Object>> processDefinitions = bpmnAnalyticsService.getProcessDefinitions();
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process definitions retrieved successfully", processDefinitions));
                    
        } catch (Exception e) {
            log.error("Error retrieving process definitions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process definitions: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour récupérer les métriques d'un processus
     */
    @GetMapping("/metrics/{processDefinitionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProcessMetrics(
            @PathVariable String processDefinitionId,
            Authentication authentication) {
        try {
            log.info("Process metrics request for process: {} from user: {}", 
                    processDefinitionId,
                    authentication != null ? authentication.getName() : "anonymous");
            
            Map<String, Object> metrics = bpmnAnalyticsService.getProcessMetrics(processDefinitionId);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process metrics retrieved successfully", metrics));
                    
        } catch (Exception e) {
            log.error("Error retrieving process metrics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process metrics: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour récupérer les données de carte de processus
     */
    @GetMapping("/process-map/{processDefinitionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProcessMapData(
            @PathVariable String processDefinitionId,
            Authentication authentication) {
        try {
            log.info("Process map data request for process: {} from user: {}", 
                    processDefinitionId,
                    authentication != null ? authentication.getName() : "anonymous");
            
            Map<String, Object> processMapData = bpmnAnalyticsService.getProcessMapData(processDefinitionId);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Process map data retrieved successfully", processMapData));
                    
        } catch (Exception e) {
            log.error("Error retrieving process map data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to retrieve process map data: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour exporter les logs en CSV
     */
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportLogsAsCsv(
            @RequestParam(required = false) String processDefinitionId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        try {
            log.info("CSV export request from user: {}", 
                    authentication != null ? authentication.getName() : "anonymous");
            
            byte[] csvData = bpmnAnalyticsService.exportLogsAsCsv(processDefinitionId, startDate, endDate);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=process_logs.csv")
                    .body(csvData);
                    
        } catch (Exception e) {
            log.error("Error exporting logs as CSV", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
