package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.Valeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValeurRepository extends JpaRepository<Valeur, Long> {
    
    /**
     * Find all valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return list of valeurs
     */
    List<Valeur> findByDomaineValeurIdOrderByOrdreAsc(Long domaineValeurId);
    
    /**
     * Find all active valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return list of active valeurs
     */
    List<Valeur> findByDomaineValeurIdAndActifTrueOrderByOrdreAsc(Long domaineValeurId);
    
    /**
     * Count valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return count of valeurs
     */
    Long countByDomaineValeurId(Long domaineValeurId);
    
    /**
     * Check if code exists for a specific domaine valeur
     * @param code the code to check
     * @param domaineValeurId the domaine valeur id
     * @return true if exists
     */
    boolean existsByCodeAndDomaineValeurId(String code, Long domaineValeurId);
    
    /**
     * Check if code exists for a specific domaine valeur excluding a specific id
     * @param code the code to check
     * @param domaineValeurId the domaine valeur id
     * @param id the id to exclude
     * @return true if exists
     */
    boolean existsByCodeAndDomaineValeurIdAndIdNot(String code, Long domaineValeurId, Long id);
    
    /**
     * Delete all valeurs by domaine valeur id
     * @param domaineValeurId The domaine valeur id
     */
    void deleteByDomaineValeurId(Long domaineValeurId);
    
    /**
     * Find the maximum ordre value for a domaine valeur
     * @param domaineValeurId The domaine valeur id
     * @return The maximum ordre value, or null if no valeurs exist
     */
    @Query("SELECT MAX(v.ordre) FROM Valeur v WHERE v.domaineValeur.id = :domaineValeurId")
    Integer findMaxOrdreByDomaineValeurId(@Param("domaineValeurId") Long domaineValeurId);
}
