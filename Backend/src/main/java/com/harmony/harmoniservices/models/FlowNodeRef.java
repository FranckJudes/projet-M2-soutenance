package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flow_node_refs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FlowNodeRef {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @ManyToOne
    @JoinColumn(name = "lane_id", referencedColumnName = "id")
    private Lane lane;

    @Column(name = "node_ref", length = 50)
    private String nodeRef;
}
