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

    @Value("${bpmn.analytics.service.url:http://localhost:5000}")
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
            log.error("Error calling process discovery service: {}", e.getMessage());
            throw new RuntimeException("Failed to perform process discovery: " + e.getMessage());
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
}
