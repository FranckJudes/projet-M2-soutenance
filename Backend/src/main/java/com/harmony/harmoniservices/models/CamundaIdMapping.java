package com.harmony.harmoniservices.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

/**
 * Entité pour stocker le mapping entre les IDs originaux (emails, etc.)
 * et les IDs Camunda générés (conformes au pattern [a-zA-Z0-9]+)
 */
@Entity
@Table(name = "camunda_id_mapping")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CamundaIdMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID original (email, nom de groupe, etc.)
     */
    @Column(name = "original_id", unique = true, nullable = false)
    private String originalId;

    /**
     * ID Camunda généré (conforme au pattern [a-zA-Z0-9]+)
     */
    @Column(name = "camunda_id", unique = true, nullable = false)
    private String camundaId;

    /**
     * Type d'entité (USER, GROUP)
     */
    @Column(name = "entity_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EntityType entityType;

    public enum EntityType {
        USER, GROUP, ENTITY
    }
}
