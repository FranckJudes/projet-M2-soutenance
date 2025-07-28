package com.harmony.harmoniservices.models;
import lombok.*;
import jakarta.persistence.*;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "lane_set")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LaneSet {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100, nullable = true)
    private String name;

    @ManyToOne
    @JoinColumn(name = "pool_id", referencedColumnName = "id")
    private Pool pool;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private BpmnProcess process;
}
