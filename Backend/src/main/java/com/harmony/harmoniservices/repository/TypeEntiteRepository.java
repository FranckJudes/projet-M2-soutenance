package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.TypeEntite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for TypeEntite entity
 */
@Repository
public interface TypeEntiteRepository extends JpaRepository<TypeEntite, Long> {
    
    /**
     * Find a type entity by its libele
     * 
     * @param libele the libele to search for
     * @return an Optional containing the TypeEntite if found
     */
    Optional<TypeEntite> findByLibele(String libele);
    
    /**
     * Check if a type entity exists with the given libele
     * 
     * @param libele the libele to check
     * @return true if a type entity exists with the given libele, false otherwise
     */
    boolean existsByLibele(String libele);
}
