package com.harmony.harmoniservices.models;



import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sub_processes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubProcess {
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

    @Builder.Default
    @OneToMany(mappedBy = "subProcess", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Task> tasks = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "subProcess", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Event> events = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "subProcess", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Gateway> gateways = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "subProcess", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SequenceFlow> sequenceFlows = new ArrayList<>();

    @Builder.Default
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "parent_subprocess_id")
    private List<SubProcess> subProcesses = new ArrayList<>();
}