package com.harmony.harmoniservices.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.IdentityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CamundaIdentityService {

    private final IdentityService identityService;
    
    // Map pour stocker la correspondance entre les IDs originaux et les IDs Camunda
    private final Map<String, String> idMappings = new HashMap<>();

    /**
     * Ensure a user exists in Camunda identity system
     * Génère un ID propre pour Camunda et stocke l'email comme information utilisateur
     */
    @Transactional
    public void ensureUserExists(String userId) {
        if (userId == null || userId.isEmpty()) {
            return;
        }
        
        // Vérifier si on a déjà un mapping pour cet utilisateur
        String camundaId = idMappings.get(userId);
        
        // Si pas de mapping, en créer un nouveau
        if (camundaId == null) {
            camundaId = generateCamundaId("user");
            idMappings.put(userId, camundaId);
        }
        
        // Check if user exists
        if (identityService.createUserQuery().userId(camundaId).count() == 0) {
            log.info("Creating Camunda user: {} (original: {})", camundaId, userId);
            org.camunda.bpm.engine.identity.User user = identityService.newUser(camundaId);
            
            // Extraire les informations de l'email si possible
            String firstName = userId;
            String lastName = "User";
            String email = userId;
            
            // Si c'est un email, essayer d'extraire un nom
            if (userId.contains("@")) {
                String localPart = userId.split("@")[0];
                if (localPart.contains(".")) {
                    String[] parts = localPart.split("\\.");
                    firstName = capitalizeFirstLetter(parts[0]);
                    if (parts.length > 1) {
                        lastName = capitalizeFirstLetter(parts[1]);
                    }
                } else {
                    firstName = capitalizeFirstLetter(localPart);
                }
            }
            
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(camundaId); // Mot de passe simple pour les tests
            identityService.saveUser(user);
        }
    }
    
    /**
     * Capitalise la première lettre d'une chaîne
     */
    private String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
    
    /**
     * Génère un ID valide pour Camunda
     * Format: prefixUUID (strictement alphanumérique)
     * Conforme au pattern par défaut de Camunda [a-zA-Z0-9]+
     */
    private String generateCamundaId(String prefix) {
        // Générer un UUID sans tirets et le tronquer
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        
        // Créer un ID strictement alphanumérique (pas de tiret ni underscore)
        String id = prefix + uuid;
        
        // S'assurer que l'ID est valide selon les règles Camunda
        // 1. Commence par une lettre (garanti par le préfixe)
        // 2. Contient uniquement a-z, A-Z, 0-9
        // 3. Longueur maximale de 64 caractères
        if (id.length() > 64) {
            id = id.substring(0, 64);
        }
        
        return id;
    }

    /**
     * Ensure a group exists in Camunda identity system
     * Génère un ID propre pour Camunda et stocke l'ID original comme nom du groupe
     */
    @Transactional
    public void ensureGroupExists(String groupId) {
        if (groupId == null || groupId.isEmpty()) {
            return;
        }
        
        // Vérifier si on a déjà un mapping pour ce groupe
        String camundaId = idMappings.get(groupId);
        
        // Si pas de mapping, en créer un nouveau
        if (camundaId == null) {
            camundaId = generateCamundaId("group");
            idMappings.put(groupId, camundaId);
        }

        // Check if group exists
        if (identityService.createGroupQuery().groupId(camundaId).count() == 0) {
            log.info("Creating Camunda group: {} (original: {})", camundaId, groupId);
            org.camunda.bpm.engine.identity.Group group = identityService.newGroup(camundaId);
            group.setName(groupId); // Garder l'ID original comme nom pour référence
            group.setType("WORKFLOW");
            identityService.saveGroup(group);
        }
    }

    /**
     * Ensure a user is member of a group
     */
    @Transactional
    public void ensureUserInGroup(String userId, String groupId) {
        if (userId == null || userId.isEmpty() || groupId == null || groupId.isEmpty()) {
            return;
        }

        // Récupérer ou générer les IDs Camunda
        String camundaUserId = idMappings.get(userId);
        if (camundaUserId == null) {
            camundaUserId = generateCamundaId("user");
            idMappings.put(userId, camundaUserId);
        }
        
        String camundaGroupId = idMappings.get(groupId);
        if (camundaGroupId == null) {
            camundaGroupId = generateCamundaId("group");
            idMappings.put(groupId, camundaGroupId);
        }
        
        // Ensure user and group exist
        ensureUserExists(userId);
        ensureGroupExists(groupId);

        // Check if membership exists
        if (!identityService.createUserQuery().userId(camundaUserId).memberOfGroup(camundaGroupId).list().isEmpty()) {
            return;
        }

        // Create membership
        log.info("Adding user {} to group {} (original: {} to {})", camundaUserId, camundaGroupId, userId, groupId);
        identityService.createMembership(camundaUserId, camundaGroupId);
    }

    /**
     * Initialize some default users and groups for testing
     */
    @Transactional
    public void initializeDefaultUsers() {
        // Create default users
        List<String> defaultUsers = List.of("admin", "user1", "user2", "manager");
        for (String user : defaultUsers) {
            ensureUserExists(user);
        }

        // Create default groups
        List<String> defaultGroups = List.of("admins", "users", "managers");
        for (String group : defaultGroups) {
            ensureGroupExists(group);
        }

        // Create memberships
        ensureUserInGroup("admin", "admins");
        ensureUserInGroup("user1", "users");
        ensureUserInGroup("user2", "users");
        ensureUserInGroup("manager", "managers");
    }
    
    /**
     * Synchronise les utilisateurs et groupes entre l'application et Camunda
     * Cette méthode peut être appelée périodiquement ou lors des déploiements
     * pour s'assurer que tous les utilisateurs et groupes sont correctement représentés
     * dans les tables Camunda avec des identifiants valides.
     * 
     * @param userIds List of user IDs to synchronize
     * @param groupIds List of group IDs to synchronize
     * @param userGroupMappings Map of user IDs to list of group IDs for membership
     */
    @Transactional
    public void synchronizeWithCamunda(List<String> userIds, List<String> groupIds, Map<String, List<String>> userGroupMappings) {
        // Ensure users exist
        if (userIds != null) {
            for (String userId : userIds) {
                ensureUserExists(userId);
            }
        }
        
        // Ensure groups exist
        if (groupIds != null) {
            for (String groupId : groupIds) {
                ensureGroupExists(groupId);
            }
        }
        
        // Create memberships
        if (userGroupMappings != null) {
            for (Map.Entry<String, List<String>> entry : userGroupMappings.entrySet()) {
                String userId = entry.getKey();
                List<String> groups = entry.getValue();
                
                // Récupérer l'ID Camunda de l'utilisateur
                String camundaUserId = idMappings.get(userId);
                if (camundaUserId == null) {
                    camundaUserId = generateCamundaId("user");
                    idMappings.put(userId, camundaUserId);
                }
                
                // Ensure user exists
                ensureUserExists(userId);
                
                // Add user to groups
                if (groups != null) {
                    for (String groupId : groups) {
                        // Récupérer l'ID Camunda du groupe
                        String camundaGroupId = idMappings.get(groupId);
                        if (camundaGroupId == null) {
                            camundaGroupId = generateCamundaId("group");
                            idMappings.put(groupId, camundaGroupId);
                        }
                        
                        // Ensure group exists
                        ensureGroupExists(groupId);
                        
                        // Create membership if it doesn't exist
                        if (identityService.createUserQuery()
                                .userId(camundaUserId)
                                .memberOfGroup(camundaGroupId)
                                .count() == 0) {
                            
                            log.info("Adding user {} to group {}", camundaUserId, camundaGroupId);
                            identityService.createMembership(camundaUserId, camundaGroupId);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Récupère l'ID Camunda correspondant à un ID original
     * Utile pour les services qui ont besoin de connaître l'ID Camunda
     * @param originalId L'ID original (email, nom de groupe, etc.)
     * @return L'ID Camunda correspondant ou null si non trouvé
     */
    public String getCamundaId(String originalId) {
        return idMappings.get(originalId);
    }

    /**
     * Méthode simplifiée pour synchroniser tous les utilisateurs d'une entité avec un groupe Camunda
     * Utile pour s'assurer que tous les membres d'une entité sont dans le groupe correspondant
     * 
     * @param entityId Identifiant de l'entité (sera utilisé comme identifiant de groupe)
     * @param userIds Liste des identifiants utilisateur à ajouter au groupe
     */
    @Transactional
    public void synchronizeEntityUsers(String entityId, List<String> userIds) {
        if (entityId == null || entityId.isEmpty() || userIds == null || userIds.isEmpty()) {
            return;
        }
        
        // S'assurer que le groupe existe
        ensureGroupExists(entityId);
        
        // Ajouter chaque utilisateur au groupe
        for (String userId : userIds) {
            ensureUserInGroup(userId, entityId);
        }
        
        log.info("Synchronisation de {} utilisateurs avec l'entité {} terminée", userIds.size(), entityId);
    }
}
