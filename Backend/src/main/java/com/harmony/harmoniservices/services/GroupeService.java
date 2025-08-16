package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.GroupeEntity;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.models.UserGroupEntity;
import com.harmony.harmoniservices.repository.GroupeRepository;
import com.harmony.harmoniservices.repository.UserRepository;
import com.harmony.harmoniservices.repository.UserGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@Transactional
public class GroupeService {

    private final GroupeRepository groupeRepository;
    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;

    @Autowired
    public GroupeService(GroupeRepository groupeRepository, 
                        UserRepository userRepository,
                        UserGroupRepository userGroupRepository) {
        this.groupeRepository = groupeRepository;
        this.userRepository = userRepository;
        this.userGroupRepository = userGroupRepository;
    }

    public List<GroupeEntity> findAll() {
        return groupeRepository.findAll();
    }

    public Optional<GroupeEntity> findById(Long id) {
        return groupeRepository.findById(id);
    }

    public GroupeEntity save(GroupeEntity groupe) {
        return groupeRepository.save(groupe);
    }

    public void deleteById(Long id) {
        // Supprimer d'abord toutes les relations utilisateur-groupe
        List<UserGroupEntity> userGroups = userGroupRepository.findAll()
            .stream()
            .filter(ug -> ug.getGroupe().getId().equals(id))
            .toList();
        userGroupRepository.deleteAll(userGroups);
        
        // Puis supprimer le groupe
        groupeRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return groupeRepository.existsById(id);
    }

    public GroupeEntity update(GroupeEntity groupe) {
        return groupeRepository.save(groupe);
    }

    // === MÉTHODES DE GESTION DES UTILISATEURS DANS LES GROUPES ===

    /**
     * Récupère tous les utilisateurs d'un groupe spécifique
     */
    public List<UserEntity> getUsersInGroup(Long groupId) {
        if (!existsById(groupId)) {
            throw new RuntimeException("Groupe avec id " + groupId + " non trouvé");
        }
        return userGroupRepository.findUsersByGroupId(groupId);
    }

    /**
     * Récupère tous les utilisateurs qui ne sont dans aucun groupe
     */
    public List<UserEntity> getUsersWithoutGroup() {
        return userGroupRepository.findUsersWithoutGroup();
    }

    /**
     * Ajoute des utilisateurs à un groupe
     */
    public void addUsersToGroup(Long groupId, List<Long> userIds) {
        Optional<GroupeEntity> groupeOpt = findById(groupId);
        if (groupeOpt.isEmpty()) {
            throw new RuntimeException("Groupe avec id " + groupId + " non trouvé");
        }
        
        GroupeEntity groupe = groupeOpt.get();
        List<UserGroupEntity> userGroupsToSave = new ArrayList<>();
        
        for (Long userId : userIds) {
            Optional<UserEntity> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("Utilisateur avec id " + userId + " non trouvé");
            }
            
            // Vérifier si l'utilisateur n'est pas déjà dans le groupe
            Optional<UserGroupEntity> existingRelation = 
                userGroupRepository.findByUserIdAndGroupId(userId, groupId);
            
            if (existingRelation.isEmpty()) {
                UserGroupEntity userGroup = UserGroupEntity.builder()
                    .user(userOpt.get())
                    .groupe(groupe)
                    .build();
                userGroupsToSave.add(userGroup);
            }
        }
        
        userGroupRepository.saveAll(userGroupsToSave);
    }

    /**
     * Retire un utilisateur d'un groupe
     */
    public void removeUserFromGroup(Long groupId, Long userId) {
        if (!existsById(groupId)) {
            throw new RuntimeException("Groupe avec id " + groupId + " non trouvé");
        }
        
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Utilisateur avec id " + userId + " non trouvé");
        }
        
        Optional<UserGroupEntity> userGroupOpt = 
            userGroupRepository.findByUserIdAndGroupId(userId, groupId);
        
        if (userGroupOpt.isPresent()) {
            userGroupRepository.delete(userGroupOpt.get());
        } else {
            throw new RuntimeException("L'utilisateur n'est pas membre de ce groupe");
        }
    }

    /**
     * Crée un groupe avec des utilisateurs
     */
    public GroupeEntity createGroupWithUsers(GroupeEntity groupe, List<Long> userIds) {
        // Sauvegarder le groupe d'abord
        GroupeEntity savedGroupe = save(groupe);
        
        // Ajouter les utilisateurs si la liste n'est pas vide
        if (userIds != null && !userIds.isEmpty()) {
            addUsersToGroup(savedGroupe.getId(), userIds);
        }
        
        return savedGroupe;
    }

    /**
     * Compte le nombre d'utilisateurs dans un groupe
     */
    public Long countUsersInGroup(Long groupId) {
        if (!existsById(groupId)) {
            throw new RuntimeException("Groupe avec id " + groupId + " non trouvé");
        }
        return userGroupRepository.countUsersByGroupId(groupId);
    }

    /**
     * Récupère tous les groupes d'un utilisateur
     */
    public List<GroupeEntity> getGroupsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Utilisateur avec id " + userId + " non trouvé");
        }
        return userGroupRepository.findGroupsByUserId(userId);
    }
}
