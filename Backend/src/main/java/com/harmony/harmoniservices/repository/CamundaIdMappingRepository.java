package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.CamundaIdMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CamundaIdMappingRepository extends JpaRepository<CamundaIdMapping, Long> {

    /**
     * Trouve un mapping par ID original
     */
    Optional<CamundaIdMapping> findByOriginalId(String originalId);

    /**
     * Trouve un mapping par ID Camunda
     */
    Optional<CamundaIdMapping> findByCamundaId(String camundaId);

    /**
     * Trouve un mapping par ID original et type d'entité
     */
    Optional<CamundaIdMapping> findByOriginalIdAndEntityType(String originalId, CamundaIdMapping.EntityType entityType);

    /**
     * Trouve un mapping par ID Camunda et type d'entité
     */
    Optional<CamundaIdMapping> findByCamundaIdAndEntityType(String camundaId, CamundaIdMapping.EntityType entityType);
}
