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
public class ProcessVariantsRequestDTO {
    private List<Map<String, Object>> logs;
    private Integer maxVariants; // Nombre maximum de variantes à retourner
}
