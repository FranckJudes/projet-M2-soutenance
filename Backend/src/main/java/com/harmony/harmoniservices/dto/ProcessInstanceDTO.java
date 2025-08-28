package com.harmony.harmoniservices.dto;

import com.harmony.harmoniservices.models.ProcessInstance;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessInstanceDTO {
    private Long id;
    private String processInstanceId;
    private String processDefinitionKey;
    private String processDefinitionId;
    private String businessKey;
    private String startUserId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ProcessInstance.ProcessInstanceState state;
    private String variables;
    private String suspensionReason;
    
    // Métadonnées du processus
    private String processName;
    private String processDescription;
    private List<String> processTags = new ArrayList<>();
    
    // Support des images
    private List<ProcessImageDTO> images = new ArrayList<>();
}
