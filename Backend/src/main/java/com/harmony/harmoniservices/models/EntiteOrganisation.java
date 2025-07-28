package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing an organizational entity
 */
@Entity
@Table(name = "entites_organisation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EntiteOrganisation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "libele", nullable = false)
    private String libele;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "code", unique = true)
    private String code;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private EntiteOrganisation parent;
    
    @ManyToOne
    @JoinColumn(name = "type_entity_id")
    private TypeEntite typeEntite;
    
    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
    
    @ManyToMany
    @JoinTable(
        name = "entite_users",
        joinColumns = @JoinColumn(name = "entite_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<UserEntity> users = new HashSet<>();
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
