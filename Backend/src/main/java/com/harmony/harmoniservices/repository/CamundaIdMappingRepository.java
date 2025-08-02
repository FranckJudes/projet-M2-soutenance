package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.CamundaIdMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour gérer les mappings entre identifiants originaux et identifiants Camunda
 */
@Repository
public interface CamundaIdMappingRepository extends JpaRepository<CamundaIdMapping, Long> {

    /**
     * Trouve un mapping par identifiant original
     * @param originalId L'identifiant original
     * @return Le mapping s'il existe
     */
    Optional<CamundaIdMapping> findByOriginalId(String originalId);

    /**
     * Trouve un mapping par identifiant Camunda
     * @param camundaId L'identifiant Camunda
     * @return Le mapping s'il existe
     */
    Optional<CamundaIdMapping> findByCamundaId(String camundaId);

    /**
     * Trouve tous les mappings d'un type spécifique
     * @param resourceType Le type de ressource (user, group, etc.)
     * @return La liste des mappings
     */
    java.util.List<CamundaIdMapping> findByResourceType(String resourceType);
}
