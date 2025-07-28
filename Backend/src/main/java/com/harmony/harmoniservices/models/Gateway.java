package com.harmony.harmoniservices.models;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.harmony.harmoniservices.enums.TypeGateway;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gateways")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder


public class Gateway {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "type", length = 50)
    @Enumerated(EnumType.STRING)
    private TypeGateway typeGateway;

    @Column(name = "documentation", columnDefinition = "TEXT")
    private String documentation;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;

    @ManyToOne
    @JoinColumn(name = "sub_process_id", referencedColumnName = "id")
    @JsonBackReference
    private SubProcess subProcess; // Référence vers le sous-processus parent
}