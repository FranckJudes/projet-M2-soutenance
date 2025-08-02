package com.harmony.harmoniservices.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

/**
 * Entité pour stocker le mapping entre les identifiants originaux et les identifiants Camunda
 */
@Entity
@Table(name = "camunda_id_mappings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CamundaIdMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identifiant original (email, nom de groupe, etc.)
     */
    @Column(name = "original_id", nullable = false, unique = true)
    private String originalId;

    /**
     * Identifiant Camunda généré (format prefixUUID)
     */
    @Column(name = "camunda_id", nullable = false, unique = true)
    private String camundaId;

    /**
     * Type de ressource (user, group, etc.)
     */
    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    /**
     * Date de création
     */
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}
