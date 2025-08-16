package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.UserGroupEntity;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.models.GroupeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroupEntity, Long> {
    
    /**
     * Trouve tous les utilisateurs d'un groupe spécifique
     */
    @Query("SELECT ug.user FROM UserGroupEntity ug WHERE ug.groupe.id = :groupId")
    List<UserEntity> findUsersByGroupId(@Param("groupId") Long groupId);
    
    /**
     * Trouve tous les groupes d'un utilisateur spécifique
     */
    @Query("SELECT ug.groupe FROM UserGroupEntity ug WHERE ug.user.id = :userId")
    List<GroupeEntity> findGroupsByUserId(@Param("userId") Long userId);
    
    /**
     * Trouve tous les utilisateurs qui ne sont dans aucun groupe
     */
    @Query("SELECT u FROM UserEntity u WHERE u.id NOT IN (SELECT ug.user.id FROM UserGroupEntity ug)")
    List<UserEntity> findUsersWithoutGroup();
    
    /**
     * Vérifie si un utilisateur est dans un groupe spécifique
     */
    @Query("SELECT ug FROM UserGroupEntity ug WHERE ug.user.id = :userId AND ug.groupe.id = :groupId")
    Optional<UserGroupEntity> findByUserIdAndGroupId(@Param("userId") Long userId, @Param("groupId") Long groupId);
    
    /**
     * Supprime la relation entre un utilisateur et un groupe
     */
    void deleteByUserIdAndGroupeId(Long userId, Long groupeId);
    
    /**
     * Compte le nombre d'utilisateurs dans un groupe
     */
    @Query("SELECT COUNT(ug) FROM UserGroupEntity ug WHERE ug.groupe.id = :groupId")
    Long countUsersByGroupId(@Param("groupId") Long groupId);
}
