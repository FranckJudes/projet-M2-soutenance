package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "lanes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Lane {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne
    @JoinColumn(name = "lane_set_id", referencedColumnName = "id")
    private LaneSet laneSet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private BpmnProcess process;
    
}