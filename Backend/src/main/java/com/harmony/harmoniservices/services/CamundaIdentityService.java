package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.CamundaIdMapping;
import com.harmony.harmoniservices.repository.CamundaIdMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.IdentityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CamundaIdentityService {

    private final IdentityService identityService;
    private final CamundaIdMappingRepository camundaIdMappingRepository;
    
    /**
     * Getter pour le service d'identité Camunda
     * @return Le service d'identité Camunda
     */
    public IdentityService getIdentityService() {
        return identityService;
    }

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
        Optional<CamundaIdMapping> existingMapping = camundaIdMappingRepository.findByOriginalId(userId);
        String camundaId;
        
        // Si pas de mapping, en créer un nouveau
        if (existingMapping.isEmpty()) {
            camundaId = generateCamundaId("user");
            CamundaIdMapping mapping = CamundaIdMapping.builder()
                .originalId(userId)
                .camundaId(camundaId)
                .resourceType("USER")
                .build();
            camundaIdMappingRepository.save(mapping);
            log.info("Created new Camunda ID mapping: {} -> {}", userId, camundaId);
        } else {
            camundaId = existingMapping.get().getCamundaId();
            log.debug("Found existing Camunda ID mapping: {} -> {}", userId, camundaId);
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
        Optional<CamundaIdMapping> existingMapping = camundaIdMappingRepository.findByOriginalId(groupId);
        String camundaId;
        
        // Si pas de mapping, en créer un nouveau
        if (existingMapping.isEmpty()) {
            camundaId = generateCamundaId("group");
            CamundaIdMapping mapping = CamundaIdMapping.builder()
                .originalId(groupId)
                .camundaId(camundaId)
                .resourceType("GROUP")
                .build();
            camundaIdMappingRepository.save(mapping);
            log.info("Created new Camunda ID mapping for group: {} -> {}", groupId, camundaId);
        } else {
            camundaId = existingMapping.get().getCamundaId();
            log.debug("Found existing Camunda ID mapping for group: {} -> {}", groupId, camundaId);
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

        // Ensure user and group exist first
        ensureUserExists(userId);
        ensureGroupExists(groupId);
        
        // Récupérer les IDs Camunda
        String camundaUserId = getCamundaId(userId);
        String camundaGroupId = getCamundaId(groupId);
        
        if (camundaUserId == null || camundaGroupId == null) {
            log.error("Failed to get Camunda IDs for user {} or group {}", userId, groupId);
            return;
        }
        
        // Check if membership exists
        boolean membershipExists = !identityService.createUserQuery()
            .userId(camundaUserId)
            .memberOfGroup(camundaGroupId)
            .list()
            .isEmpty();
            
        if (membershipExists) {
            log.debug("User {} is already member of group {} (Camunda IDs: {} -> {})", 
                userId, groupId, camundaUserId, camundaGroupId);
            return;
        }

        // Create membership
        log.info("Adding user {} to group {} (original: {} to {})", camundaUserId, camundaGroupId, userId, groupId);
        identityService.createMembership(camundaUserId, camundaGroupId);
        
        // Vérifier que le membership a bien été créé
        membershipExists = !identityService.createUserQuery()
            .userId(camundaUserId)
            .memberOfGroup(camundaGroupId)
            .list()
            .isEmpty();
            
        if (membershipExists) {
            log.info("Successfully added user {} to group {} (Camunda IDs: {} -> {})",
                userId, groupId, camundaUserId, camundaGroupId);
        } else {
            log.error("Failed to add user {} to group {} (Camunda IDs: {} -> {})",
                userId, groupId, camundaUserId, camundaGroupId);
        }
    }

    /**
     * Initialize some default users and groups for testing
     */
    // @Transactional
    // public void initializeDefaultUsers() {
    //     // Create default users
    //     List<String> defaultUsers = List.of("admin", "user1", "user2", "manager");
    //     for (String user : defaultUsers) {
    //         ensureUserExists(user);
    //     }

    //     // Create default groups
    //     List<String> defaultGroups = List.of("admins", "users", "managers");
    //     for (String group : defaultGroups) {
    //         ensureGroupExists(group);
    //     }

    //     // Create memberships
    //     ensureUserInGroup("admin", "admins");
    //     ensureUserInGroup("user1", "users");
    //     ensureUserInGroup("user2", "users");
    //     ensureUserInGroup("manager", "managers");
    // }
    
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
                String camundaUserId = getCamundaId(userId);
                if (camundaUserId == null) {
                    // Cet utilisateur n'a pas encore été synchronisé, on le fait maintenant
                    ensureUserExists(userId);
                    camundaUserId = getCamundaId(userId);
                }
                
                // Ensure user exists
                ensureUserExists(userId);
                
                // Add user to groups
                if (groups != null) {
                    for (String groupId : groups) {
                        // Récupérer l'ID Camunda du groupe
                        String camundaGroupId = getCamundaId(groupId);
                        if (camundaGroupId == null) {
                            // Ce groupe n'a pas encore été synchronisé, on le fait maintenant
                            ensureGroupExists(groupId);
                            camundaGroupId = getCamundaId(groupId);
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
        if (originalId == null || originalId.isEmpty()) {
            log.warn("getCamundaId called with null or empty originalId");
            return null;
        }
        
        log.debug("Searching Camunda ID mapping for original ID: {}", originalId);
        Optional<CamundaIdMapping> mapping = camundaIdMappingRepository.findByOriginalId(originalId);
        
        if (mapping.isPresent()) {
            String camundaId = mapping.get().getCamundaId();
            log.debug("Found Camunda ID mapping: {} -> {}", originalId, camundaId);
            return camundaId;
        } else {
            log.warn("No Camunda ID mapping found for original ID: {}", originalId);
            return null;
        }
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
