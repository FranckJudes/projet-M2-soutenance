package com.harmony.harmoniservices.dto;

import lombok.*;
import java.time.LocalDateTime;

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
}
