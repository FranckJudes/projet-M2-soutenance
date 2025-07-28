package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.harmony.harmoniservices.enums.TypeGroupe;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "groupes")
public class GroupeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String libele_groupe_utilisateur;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TypeGroupe type = TypeGroupe.TYPE_0;

    private String description_groupe_utilisateur;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime created_at;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updated_at;
}