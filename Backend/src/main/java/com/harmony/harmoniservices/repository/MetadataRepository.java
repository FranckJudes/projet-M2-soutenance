package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.Metadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Metadata entity
 */
@Repository
public interface MetadataRepository extends JpaRepository<Metadata, Long> {
    
    /**
     * Find a Metadata by its nom
     * @param nom the nom to search for
     * @return an Optional containing the Metadata if found
     */
    Optional<Metadata> findByNom(String nom);
    
    /**
     * Check if a Metadata exists with the given nom
     * @param nom the nom to check
     * @return true if a Metadata exists with the given nom, false otherwise
     */
    boolean existsByNom(String nom);
}
