package com.harmony.harmoniservices.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessDefinitionDTO {
    private Long id;
    private String processDefinitionKey;
    private String processDefinitionId;
    private String name;
    private String description;
    private Integer version;
    private String deploymentId;
    private LocalDateTime deployedAt;
    private String deployedBy;
    private Boolean active;

    // Métadonnées générales du processus
    private String processName;
    private String processDescription;
    private List<String> processTags = new ArrayList<>();

    // Support des images multiples
    private List<ProcessImageDTO> images = new ArrayList<>();
}
