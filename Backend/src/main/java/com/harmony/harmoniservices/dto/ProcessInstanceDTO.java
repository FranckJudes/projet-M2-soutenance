package com.harmony.harmoniservices.dto;

import com.harmony.harmoniservices.models.ProcessInstance;
import lombok.*;
import java.time.LocalDateTime;

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
}
