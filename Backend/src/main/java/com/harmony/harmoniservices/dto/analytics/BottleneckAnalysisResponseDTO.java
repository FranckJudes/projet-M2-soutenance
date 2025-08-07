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
public class BottleneckAnalysisResponseDTO {
    private List<BottleneckDTO> bottlenecks;
    private String analysisChart; // Base64 encoded chart image
    private Map<String, Object> statistics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BottleneckDTO {
        private String activity;
        private Double averageWaitingTime;
        private Double resourceUtilization;
        private Integer frequency;
        private String severity; // HIGH, MEDIUM, LOW
    }
}
