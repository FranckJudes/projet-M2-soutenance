package com.harmony.harmoniservices.models;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sequence_flows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SequenceFlow {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne
    @JoinColumn(name = "source_ref", referencedColumnName = "id")
    private Task source;

    @ManyToOne
    @JoinColumn(name = "target_ref", referencedColumnName = "id")
    private Task target;

    @Column(name = "condition_expression", columnDefinition = "TEXT")
    private String conditionExpression;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;

    @ManyToOne
    @JoinColumn(name = "sub_process_id", referencedColumnName = "id")
    @JsonBackReference
    private SubProcess subProcess; // Référence vers le sous-processus parent
}