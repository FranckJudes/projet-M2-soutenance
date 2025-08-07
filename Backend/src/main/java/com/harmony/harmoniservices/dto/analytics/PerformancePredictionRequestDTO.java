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
public class PerformancePredictionRequestDTO {
    private List<Map<String, Object>> logs;
    private String predictionType; // completion_time, next_activity, resource_demand
    private Map<String, Object> parameters; // Paramètres spécifiques au type de prédiction
}
