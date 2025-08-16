package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Form entity operations
 */
@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    
    /**
     * Find form by name
     * @param nom the form name
     * @return Optional of Form
     */
    Optional<Form> findByNom(String nom);
    
    /**
     * Check if form exists by name
     * @param nom the form name
     * @return true if exists
     */
    boolean existsByNom(String nom);
    
    /**
     * Find forms by name containing (case insensitive)
     * @param nom the partial form name
     * @return list of forms
     */
    List<Form> findByNomContainingIgnoreCase(String nom);
    
    /**
     * Find forms with their metadata
     * @return list of forms with loaded metadata
     */
    @Query("SELECT DISTINCT f FROM Form f LEFT JOIN FETCH f.metadatas")
    List<Form> findAllWithMetadata();
    
    /**
     * Find form by id with metadata
     * @param id the form id
     * @return Optional of Form with metadata
     */
    @Query("SELECT f FROM Form f LEFT JOIN FETCH f.metadatas WHERE f.id = :id")
    Optional<Form> findByIdWithMetadata(@Param("id") Long id);
    
    /**
     * Count forms containing metadata
     * @param metadataId the metadata id
     * @return count of forms
     */
    @Query("SELECT COUNT(f) FROM Form f JOIN f.metadatas m WHERE m.id = :metadataId")
    Long countFormsContainingMetadata(@Param("metadataId") Long metadataId);
}
