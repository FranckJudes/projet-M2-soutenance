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
public class SocialNetworkAnalysisResponseDTO {
    private List<NetworkNodeDTO> nodes;
    private List<NetworkEdgeDTO> edges;
    private String networkChart; // Base64 encoded network visualization
    private Map<String, Object> metrics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NetworkNodeDTO {
        private String id;
        private String label;
        private String type; // resource, role, department
        private Double centrality;
        private Integer degree;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NetworkEdgeDTO {
        private String source;
        private String target;
        private Double weight;
        private String relationshipType;
    }
}
