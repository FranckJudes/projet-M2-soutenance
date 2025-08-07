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
public class SocialNetworkAnalysisRequestDTO {
    private List<Map<String, Object>> logs;
    private String analysisType; // handover_of_work, working_together, similar_activities
}
