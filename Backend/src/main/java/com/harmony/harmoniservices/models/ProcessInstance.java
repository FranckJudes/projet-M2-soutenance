package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "process_instances")
public class ProcessInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String processInstanceId;

    private String processDefinitionKey;
    private String processDefinitionId;
    private String businessKey;
    private String startUserId;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProcessInstanceState state;
    
    @Column(columnDefinition = "TEXT")
    private String variables; // JSON format
    
    private String suspensionReason;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        startTime = now;
        createdAt = now;
        updatedAt = now;
        if (state == null) {
            state = ProcessInstanceState.ACTIVE;
        }
    }

    public enum ProcessInstanceState {
        ACTIVE,
        SUSPENDED,
        COMPLETED,
        EXTERNALLY_TERMINATED,
        INTERNALLY_TERMINATED
    }
}
