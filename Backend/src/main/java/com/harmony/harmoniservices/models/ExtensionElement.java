package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "extension_elements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class ExtensionElement {
     @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "element_id", length = 50)
    private String elementId;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;
}
