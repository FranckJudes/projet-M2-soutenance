package com.harmony.harmoniservices.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformancePredictionResponseDTO {
    private List<PredictionDTO> predictions;
    private String predictionChart; // Base64 encoded chart image
    private Map<String, Object> modelMetrics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionDTO {
        private String caseId;
        private Double predictedCompletionTime;
        private String nextActivity;
        private Double confidence;
        private Map<String, Object> additionalData;
    }
}
