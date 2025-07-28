package com.harmony.harmoniservices.models;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "text_annotations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TextAnnotation {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "text", columnDefinition = "TEXT")
    private String text;

    @ManyToOne
    @JoinColumn(name = "process_id", referencedColumnName = "id")
    private BpmnProcess process;
}
