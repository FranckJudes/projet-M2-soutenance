package com.harmony.harmoniservices.models;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "data_objects")
@Getter
@Setter
@NoArgsConstructor
@Builder

@AllArgsConstructor
public class DataObject {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;

    @Column(name = "documentation", columnDefinition = "TEXT")
    private String documentation;
}
