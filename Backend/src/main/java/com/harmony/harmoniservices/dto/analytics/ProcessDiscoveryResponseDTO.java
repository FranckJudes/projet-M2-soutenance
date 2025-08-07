package com.harmony.harmoniservices.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessDiscoveryResponseDTO {
    private String petriNetImage; // Base64 encoded image
    private ProcessMetricsDTO metrics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessMetricsDTO {
        private Double fitness;
        private Double precision;
        private Double generalization;
        private Double simplicity;
    }
}
