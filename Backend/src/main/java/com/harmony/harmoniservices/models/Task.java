package com.harmony.harmoniservices.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.harmony.harmoniservices.enums.TypeTask;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "type", length = 50)
    @Enumerated(EnumType.STRING)
    private TypeTask typeTask;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;
    
    @ManyToOne
    @JoinColumn(name = "sub_process_id", referencedColumnName = "id")
    @JsonBackReference
    private SubProcess subProcess; 
}
