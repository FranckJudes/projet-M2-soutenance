package com.harmony.harmoniservices.models;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.harmony.harmoniservices.enums.TriggerType;
import com.harmony.harmoniservices.enums.TypeEvent;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "type", length = 50)
    @Enumerated(EnumType.STRING)
    private TypeEvent typeEvent;

    @Column(name = "trigger_type", length = 50)
    @Enumerated(EnumType.STRING)
    private TriggerType triggerType;

    @Column(name = "event_definition", length = 100, nullable = true)
    private String eventDefinition;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;

    @ManyToOne
    @JoinColumn(name = "sub_process_id", referencedColumnName = "id")
    @JsonBackReference
    private SubProcess subProcess; // Référence vers le sous-processus parent
}