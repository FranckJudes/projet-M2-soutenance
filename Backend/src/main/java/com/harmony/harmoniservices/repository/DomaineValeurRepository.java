package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.DomaineValeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for DomaineValeur entity
 */
@Repository
public interface DomaineValeurRepository extends JpaRepository<DomaineValeur, Long> {
    
    /**
     * Find a DomaineValeur by its libele
     * @param libele the libele to search for
     * @return an Optional containing the DomaineValeur if found
     */
    Optional<DomaineValeur> findByLibele(String libele);
    
    /**
     * Check if a DomaineValeur exists with the given libele
     * @param libele the libele to check
     * @return true if a DomaineValeur exists with the given libele, false otherwise
     */
    boolean existsByLibele(String libele);
}
