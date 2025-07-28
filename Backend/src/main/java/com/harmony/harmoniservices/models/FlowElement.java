package com.harmony.harmoniservices.models;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flow_elements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FlowElement {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @ManyToOne
    @JoinColumn(name = "subprocess_id", referencedColumnName = "id")
    private SubProcess subProcess;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "documentation", columnDefinition = "TEXT")
    private String documentation;
}
