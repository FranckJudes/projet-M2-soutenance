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
public class ProcessVariantsResponseDTO {
    private List<ProcessVariantDTO> variants;
    private String variantsChart; // Base64 encoded chart image
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessVariantDTO {
        private List<String> activities;
        private Integer count;
        private Double frequency;
        private Double averageDuration;
    }
}
