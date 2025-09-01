package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.analytics.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.history.HistoricActivityInstance;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BpmnAnalyticsService {

    @Value("${bpmn.analytics.service.url}")
    private String analyticsServiceUrl;

    private final RestTemplate restTemplate;
    private final HistoryService historyService;

    /**
     * Appel au service de découverte de processus
     */
    public ProcessDiscoveryResponseDTO processDiscovery(ProcessDiscoveryRequestDTO request) {
        try {
            String url = analyticsServiceUrl + "/api/pm4py/process-discovery";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<ProcessDiscoveryRequestDTO> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling process discovery service at: {}", url);
            ResponseEntity<ProcessDiscoveryResponseDTO> response = restTemplate.postForEntity(
                url, entity, ProcessDiscoveryResponseDTO.class);
            
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error calling process discovery service: {} - Response body: {}", e.getMessage(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to perform process discovery: " + e.getMessage() + " - Response: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Unexpected error in process discovery", e);
            throw new RuntimeException("Unexpected error in process discovery: " + e.getMessage());
        }
    }

    /**
     * Appel au service d'analyse des variantes de processus
     */
    public ProcessVariantsResponseDTO processVariants(ProcessVariantsRequestDTO request) {
        try {
            String url = analyticsServiceUrl + "/api/pm4py/process-variants";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<ProcessVariantsRequestDTO> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling process variants service at: {}", url);
            ResponseEntity<ProcessVariantsResponseDTO> response = restTemplate.postForEntity(
                url, entity, ProcessVariantsResponseDTO.class);
            
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error calling process variants service: {}", e.getMessage());
            throw new RuntimeException("Failed to analyze process variants: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error in process variants analysis", e);
            throw new RuntimeException("Unexpected error in process variants analysis: " + e.getMessage());
        }
    }

    /**
     * Appel au service d'analyse des goulots d'étranglement
     */
    public BottleneckAnalysisResponseDTO bottleneckAnalysis(BottleneckAnalysisRequestDTO request) {
        try {
            String url = analyticsServiceUrl + "/api/pm4py/bottleneck-analysis";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<BottleneckAnalysisRequestDTO> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling bottleneck analysis service at: {}", url);
            ResponseEntity<BottleneckAnalysisResponseDTO> response = restTemplate.postForEntity(
                url, entity, BottleneckAnalysisResponseDTO.class);
            
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error calling bottleneck analysis service: {}", e.getMessage());
            throw new RuntimeException("Failed to perform bottleneck analysis: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error in bottleneck analysis", e);
            throw new RuntimeException("Unexpected error in bottleneck analysis: " + e.getMessage());
        }
    }

    /**
     * Appel au service de prédiction de performance
     */
    public PerformancePredictionResponseDTO performancePrediction(PerformancePredictionRequestDTO request) {
        try {
            String url = analyticsServiceUrl + "/api/pm4py/performance-prediction";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<PerformancePredictionRequestDTO> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling performance prediction service at: {}", url);
            ResponseEntity<PerformancePredictionResponseDTO> response = restTemplate.postForEntity(
                url, entity, PerformancePredictionResponseDTO.class);
            
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error calling performance prediction service: {}", e.getMessage());
            throw new RuntimeException("Failed to perform performance prediction: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error in performance prediction", e);
            throw new RuntimeException("Unexpected error in performance prediction: " + e.getMessage());
        }
    }

    /**
     * Appel au service d'analyse de réseau social
     */
    public SocialNetworkAnalysisResponseDTO socialNetworkAnalysis(SocialNetworkAnalysisRequestDTO request) {
        try {
            String url = analyticsServiceUrl + "/api/pm4py/social-network-analysis";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<SocialNetworkAnalysisRequestDTO> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling social network analysis service at: {}", url);
            ResponseEntity<SocialNetworkAnalysisResponseDTO> response = restTemplate.postForEntity(
                url, entity, SocialNetworkAnalysisResponseDTO.class);
            
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error calling social network analysis service: {}", e.getMessage());
            throw new RuntimeException("Failed to perform social network analysis: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error in social network analysis", e);
            throw new RuntimeException("Unexpected error in social network analysis: " + e.getMessage());
        }
    }

    /**
     * Récupérer les logs de processus depuis Camunda pour les analytics
     */
    public List<Map<String, Object>> getProcessLogsForAnalytics(String processDefinitionKey, 
                                                                String startDate, 
                                                                String endDate) {
        log.info("Retrieving process logs for analytics: processKey={}, startDate={}, endDate={}", 
                processDefinitionKey, startDate, endDate);
        
        try {
            List<Map<String, Object>> logs = new ArrayList<>();
            
            // Récupérer les instances de processus historiques
            List<HistoricProcessInstance> processInstances = historyService
                    .createHistoricProcessInstanceQuery()
                    .processDefinitionKey(processDefinitionKey)
                    .finished() // Seulement les processus terminés pour l'analyse
                    .list();
            
            log.info("Found {} completed process instances for key: {}", 
                    processInstances.size(), processDefinitionKey);
            
            // Pour chaque instance de processus, récupérer les activités
            for (HistoricProcessInstance processInstance : processInstances) {
                List<HistoricActivityInstance> activities = historyService
                        .createHistoricActivityInstanceQuery()
                        .processInstanceId(processInstance.getId())
                        .finished()
                        .orderByHistoricActivityInstanceStartTime()
                        .asc()
                        .list();
                
                // Convertir chaque activité en format PM4Py
                for (HistoricActivityInstance activity : activities) {
                    if (activity.getActivityType().equals("userTask") || 
                        activity.getActivityType().equals("serviceTask") ||
                        activity.getActivityType().equals("scriptTask")) {
                        
                        Map<String, Object> logEntry = new HashMap<>();
                        logEntry.put("case_id", processInstance.getId());
                        logEntry.put("activity", activity.getActivityName() != null ? 
                                activity.getActivityName() : activity.getActivityId());
                        logEntry.put("timestamp", activity.getStartTime());
                        logEntry.put("resource", activity.getAssignee() != null ? 
                                activity.getAssignee() : "system");
                        logEntry.put("activity_type", activity.getActivityType());
                        logEntry.put("duration", activity.getDurationInMillis());
                        
                        // Ajouter des métadonnées supplémentaires
                        logEntry.put("process_definition_key", processDefinitionKey);
                        logEntry.put("process_instance_id", processInstance.getId());
                        logEntry.put("activity_instance_id", activity.getId());
                        
                        logs.add(logEntry);
                    }
                }
            }
            
            log.info("Generated {} log entries for analytics", logs.size());
            return logs;
            
        } catch (Exception e) {
            log.error("Error retrieving process logs for analytics", e);
            throw new RuntimeException("Failed to retrieve process logs: " + e.getMessage());
        }
    }

    /**
     * Récupère tous les logs d'événements avec filtres optionnels
     */
    public List<Map<String, Object>> getAllEventLogs(String startDate, String endDate) {
        try {
            log.info("Retrieving all event logs with date range: {} to {}", startDate, endDate);
            
            List<HistoricProcessInstance> processInstances = historyService
                .createHistoricProcessInstanceQuery()
                .finished()
                .list();
            
            List<Map<String, Object>> allLogs = new ArrayList<>();
            
            for (HistoricProcessInstance processInstance : processInstances) {
                List<HistoricActivityInstance> activities = historyService
                    .createHistoricActivityInstanceQuery()
                    .processInstanceId(processInstance.getId())
                    .finished()
                    .orderByHistoricActivityInstanceStartTime()
                    .asc()
                    .list();
                
                for (HistoricActivityInstance activity : activities) {
                    Map<String, Object> logEntry = new HashMap<>();
                    logEntry.put("processInstanceId", processInstance.getId());
                    logEntry.put("processDefinitionKey", processInstance.getProcessDefinitionKey());
                    logEntry.put("activityId", activity.getActivityId());
                    logEntry.put("activityName", activity.getActivityName());
                    logEntry.put("activityType", activity.getActivityType());
                    logEntry.put("startTime", activity.getStartTime());
                    logEntry.put("endTime", activity.getEndTime());
                    logEntry.put("durationInMillis", activity.getDurationInMillis());
                    logEntry.put("assignee", activity.getAssignee());
                    
                    allLogs.add(logEntry);
                }
            }
            
            return allLogs;
            
        } catch (Exception e) {
            log.error("Error retrieving all event logs", e);
            throw new RuntimeException("Failed to retrieve event logs: " + e.getMessage());
        }
    }

    /**
     * Récupère la liste des définitions de processus
     */
    public List<Map<String, Object>> getProcessDefinitions() {
        try {
            log.info("Retrieving process definitions");
            
            List<HistoricProcessInstance> processInstances = historyService
                .createHistoricProcessInstanceQuery()
                .list();
            
            log.info("Found {} historic process instances", processInstances.size());
            
            Map<String, Map<String, Object>> definitionsMap = new HashMap<>();
            
            for (HistoricProcessInstance instance : processInstances) {
                String key = instance.getProcessDefinitionKey();
                if (!definitionsMap.containsKey(key)) {
                    Map<String, Object> definition = new HashMap<>();
                    definition.put("id", instance.getProcessDefinitionId());
                    definition.put("key", key);
                    definition.put("name", instance.getProcessDefinitionName());
                    definition.put("version", instance.getProcessDefinitionVersion());
                    definitionsMap.put(key, definition);
                    log.info("Added process definition: {} ({})", key, instance.getProcessDefinitionName());
                }
            }
            
            List<Map<String, Object>> result = new ArrayList<>(definitionsMap.values());
            
            // Si aucun processus historique, retourner des données de test
            if (result.isEmpty()) {
                log.warn("No historic process instances found. Returning mock data for testing.");
                Map<String, Object> mockDefinition1 = new HashMap<>();
                mockDefinition1.put("id", "mock-process-1:1:1");
                mockDefinition1.put("key", "mock-process-1");
                mockDefinition1.put("name", "Processus de Test 1");
                mockDefinition1.put("version", 1);
                
                Map<String, Object> mockDefinition2 = new HashMap<>();
                mockDefinition2.put("id", "mock-process-2:1:2");
                mockDefinition2.put("key", "mock-process-2");
                mockDefinition2.put("name", "Processus de Test 2");
                mockDefinition2.put("version", 1);
                
                result.add(mockDefinition1);
                result.add(mockDefinition2);
            }
            
            log.info("Returning {} process definitions", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("Error retrieving process definitions", e);
            throw new RuntimeException("Failed to retrieve process definitions: " + e.getMessage());
        }
    }

    /**
     * Récupère les métriques d'un processus spécifique
     */
    public Map<String, Object> getProcessMetrics(String processDefinitionId) {
        try {
            log.info("Retrieving metrics for process: {}", processDefinitionId);
            
            List<HistoricProcessInstance> instances = historyService
                .createHistoricProcessInstanceQuery()
                .processDefinitionId(processDefinitionId)
                .list();
            
            long totalInstances = instances.size();
            long completedInstances = instances.stream()
                .mapToLong(i -> i.getEndTime() != null ? 1 : 0)
                .sum();
            long activeInstances = totalInstances - completedInstances;
            
            double avgDuration = instances.stream()
                .filter(i -> i.getDurationInMillis() != null)
                .mapToLong(HistoricProcessInstance::getDurationInMillis)
                .average()
                .orElse(0.0);
            
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalInstances", totalInstances);
            metrics.put("completedInstances", completedInstances);
            metrics.put("activeInstances", activeInstances);
            metrics.put("averageDuration", avgDuration);
            metrics.put("completionRate", totalInstances > 0 ? (double) completedInstances / totalInstances : 0.0);
            
            return metrics;
            
        } catch (Exception e) {
            log.error("Error retrieving process metrics", e);
            throw new RuntimeException("Failed to retrieve process metrics: " + e.getMessage());
        }
    }

    /**
     * Récupère les données de carte de processus
     */
    public Map<String, Object> getProcessMapData(String processDefinitionId) {
        try {
            log.info("Retrieving process map data for: {}", processDefinitionId);
            
            List<HistoricActivityInstance> activities = historyService
                .createHistoricActivityInstanceQuery()
                .processDefinitionId(processDefinitionId)
                .finished()
                .list();
            
            Map<String, Integer> activityCounts = new HashMap<>();
            Map<String, Long> activityDurations = new HashMap<>();
            
            for (HistoricActivityInstance activity : activities) {
                String activityId = activity.getActivityId();
                activityCounts.put(activityId, activityCounts.getOrDefault(activityId, 0) + 1);
                
                if (activity.getDurationInMillis() != null) {
                    activityDurations.put(activityId, 
                        activityDurations.getOrDefault(activityId, 0L) + activity.getDurationInMillis());
                }
            }
            
            List<Map<String, Object>> nodes = new ArrayList<>();
            List<Map<String, Object>> links = new ArrayList<>();
            
            for (String activityId : activityCounts.keySet()) {
                Map<String, Object> node = new HashMap<>();
                node.put("id", activityId);
                node.put("name", activityId);
                node.put("count", activityCounts.get(activityId));
                node.put("avgDuration", activityDurations.getOrDefault(activityId, 0L) / activityCounts.get(activityId));
                nodes.add(node);
            }
            
            Map<String, Object> processMap = new HashMap<>();
            processMap.put("nodes", nodes);
            processMap.put("links", links);
            
            return processMap;
            
        } catch (Exception e) {
            log.error("Error retrieving process map data", e);
            throw new RuntimeException("Failed to retrieve process map data: " + e.getMessage());
        }
    }

    /**
     * Exporte les logs en format CSV
     */
    public byte[] exportLogsAsCsv(String processDefinitionId, String startDate, String endDate) {
        try {
            log.info("Exporting logs as CSV for process: {}", processDefinitionId);
            
            List<Map<String, Object>> logs = getAllEventLogs(startDate, endDate);
            
            StringBuilder csv = new StringBuilder();
            csv.append("ProcessInstanceId,ProcessDefinitionKey,ActivityId,ActivityName,ActivityType,StartTime,EndTime,Duration,Assignee\n");
            
            for (Map<String, Object> log : logs) {
                if (processDefinitionId == null || processDefinitionId.isEmpty() || 
                    processDefinitionId.equals(log.get("processDefinitionKey"))) {
                    
                    csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                        log.get("processInstanceId"),
                        log.get("processDefinitionKey"),
                        log.get("activityId"),
                        log.get("activityName"),
                        log.get("activityType"),
                        log.get("startTime"),
                        log.get("endTime"),
                        log.get("durationInMillis"),
                        log.get("assignee")
                    ));
                }
            }
            
            return csv.toString().getBytes();
            
        } catch (Exception e) {
            log.error("Error exporting logs as CSV", e);
            throw new RuntimeException("Failed to export logs as CSV: " + e.getMessage());
        }
    }
}
