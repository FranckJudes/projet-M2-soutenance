package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "message_flows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MessageFlow {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "source_ref", length = 50)
    private String sourceRef;

    @Column(name = "target_ref", length = 50)
    private String targetRef;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;
}
