package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "associations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Association {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "source_ref", length = 50)
    private String sourceRef;

    @Column(name = "target_ref", length = 50)
    private String targetRef;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;
}
