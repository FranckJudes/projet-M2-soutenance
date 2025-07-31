package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "process_definitions")
public class ProcessDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String processDefinitionKey;

    private String processDefinitionId;
    private String name;
    private String description;
    private Integer version;
    private String deploymentId;
    
    @Column(columnDefinition = "TEXT")
    private String bpmnXml;
    
    private LocalDateTime deployedAt;
    private String deployedBy;
    private Boolean active;

    @PrePersist
    protected void onCreate() {
        deployedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }
}
