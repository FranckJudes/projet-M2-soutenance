package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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

    // Métadonnées générales du processus
    private String processName;
    private String processDescription;

    @ElementCollection
    @CollectionTable(name = "process_definition_tags", joinColumns = @JoinColumn(name = "process_definition_id"))
    @Column(name = "tag")
    private List<String> processTags = new ArrayList<>();

    // Support des images multiples
    @OneToMany(mappedBy = "processDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProcessImage> images = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        deployedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
        if (processTags == null) {
            processTags = new ArrayList<>();
        }
        if (images == null) {
            images = new ArrayList<>();
        }
    }
}
