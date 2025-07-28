package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.EntiteOrganisation;
import com.harmony.harmoniservices.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for EntiteOrganisation entity
 */
@Repository
public interface EntiteOrganisationRepository extends JpaRepository<EntiteOrganisation, Long> {
    
    /**
     * Find all root entities (entities without a parent)
     * 
     * @return list of root entities
     */
    List<EntiteOrganisation> findByParentIsNull();
    
    /**
     * Find all entities with a specific parent
     * 
     * @param parentId the parent ID
     * @return list of child entities
     */
    List<EntiteOrganisation> findByParentId(Long parentId);
    
    /**
     * Find an entity by its code
     * 
     * @param code the code to search for
     * @return an Optional containing the EntiteOrganisation if found
     */
    Optional<EntiteOrganisation> findByCode(String code);
    
    /**
     * Check if an entity exists with the given code
     * 
     * @param code the code to check
     * @return true if an entity exists with the given code, false otherwise
     */
    boolean existsByCode(String code);
    
    /**
     * Find entities by libele containing the given text (case insensitive)
     * 
     * @param libele the text to search for in libele
     * @return list of matching entities
     */
    List<EntiteOrganisation> findByLibeleContainingIgnoreCase(String libele);
    
    /**
     * Find entities by a specific user
     * 
     * @param user the user to search for
     * @return list of entities associated with the user
     */
    List<EntiteOrganisation> findByUsersContains(UserEntity user);
    
    /**
     * Find entities by user ID
     * 
     * @param userId the user ID
     * @return list of entities associated with the user ID
     */
    @Query("SELECT e FROM EntiteOrganisation e JOIN e.users u WHERE u.id = :userId")
    List<EntiteOrganisation> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find active entities
     * 
     * @return list of active entities
     */
    List<EntiteOrganisation> findByActiveTrue();
}
