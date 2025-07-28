package com.harmony.harmoniservices.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BpmnProcessDTO {
    private String id;
    private String name;
    private Boolean isExecutable;
    private String description;
    private String keywords;
    private String imagePaths;
    private String filePaths;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
