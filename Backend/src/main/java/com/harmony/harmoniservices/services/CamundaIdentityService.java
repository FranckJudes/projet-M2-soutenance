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
     * Utilise un mapping entre l'ID original et un ID Camunda conforme
     */
    @Transactional
    public void ensureUserExists(String userId) {
        if (userId == null || userId.isEmpty()) {
            return;
        }
        
        System.out.println("==================================>>> Ensuring user exists for ID: " + userId);
        
        // Vérifier d'abord si un mapping existe déjà
        Optional<CamundaIdMapping> existingMapping = camundaIdMappingRepository.findByOriginalId(userId);
        
        System.out.println("==================================>>> ID que j'ai retrouver====>" + existingMapping);

        String camundaId;
        if (existingMapping.isPresent()) {
            // Utiliser le mapping existant
            camundaId = existingMapping.get().getCamundaId();
            System.out.println("==================================>>> Found existing mapping: " + userId + " -> " + camundaId);
        } else {
            // Créer un nouveau mapping seulement si nécessaire
            camundaId = getCamundaId(userId);
            System.out.println("==================================>>> Created new mapping: " + userId + " -> " + camundaId);
        }
        
        // Vérifier si l'utilisateur existe dans Camunda
        if (identityService.createUserQuery().userId(camundaId).count() == 0) {
            log.info("==================================>>> Creating Camunda user with ID: {} (original: {})", camundaId, userId);
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
            user.setPassword("password"); // Mot de passe simple pour les tests
            identityService.saveUser(user);
            log.info("==================================>>> Successfully created Camunda user: {} -> {}", userId, camundaId);
        } else {
            log.debug("==================================>>> User already exists in Camunda: {} -> {}", userId, camundaId);
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
        
        if (id.length() > 64) {
            id = id.substring(0, 64);
        }
        
        return id;
    }

    /**
     * Ensure a group exists in Camunda identity system
     * Utilise un mapping entre l'ID original et un ID Camunda conforme
     */
    @Transactional
    public void ensureGroupExists(String groupId) {
        if (groupId == null || groupId.isEmpty()) {
            return;
        }
        
        String camundaId = getCamundaId(groupId);

        // Check if group exists
        if (identityService.createGroupQuery().groupId(camundaId).count() == 0) {
            log.info("Creating Camunda group with ID: {} (original: {})", camundaId, groupId);
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
        log.info("Adding user {} to group {} (Camunda IDs: {} -> {})", 
            userId, groupId, camundaUserId, camundaGroupId);
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
     * Obtient l'ID Camunda correspondant à un ID original
     * Si aucun mapping n'existe et createIfMissing est true, crée un nouveau mapping
     * 
     * @param originalId L'ID original
     * @param createIfMissing Si true, crée un nouveau mapping si aucun n'existe
     * @return L'ID Camunda correspondant, ou null si aucun mapping n'existe et createIfMissing est false
     */
    @Transactional
    public String getCamundaId(String originalId, boolean createIfMissing) {
        if (originalId == null || originalId.isEmpty()) {
            System.out.println("getCamundaId called with null or empty originalId");
            return null;
        }
        
        System.out.println("Searching Camunda ID mapping for original ID: " + originalId);
        Optional<CamundaIdMapping> mapping = camundaIdMappingRepository.findByOriginalId(originalId);
        
        if (mapping.isPresent()) {
            String camundaId = mapping.get().getCamundaId();
            System.out.println("Found Camunda ID mapping: " + originalId + " -> " + camundaId);
            return camundaId;
        }
        
        // Aucun mapping existant
        if (!createIfMissing) {
            System.out.println("No Camunda ID mapping found for original ID: " + originalId + " and createIfMissing is false");
            return null;
        }
        
        // Générer un nouvel ID Camunda
        System.out.println("No Camunda ID mapping found for original ID: " + originalId + ". Creating a new mapping.");
        
        CamundaIdMapping.EntityType entityType = CamundaIdMapping.EntityType.USER;
        String prefix = "user";
        
        String camundaId = generateCamundaId(prefix);
        // Sauvegarder le mapping
        CamundaIdMapping newMapping = CamundaIdMapping.builder()
            .originalId(originalId)
            .camundaId(camundaId)
            .entityType(entityType)
            .build();
        
        camundaIdMappingRepository.save(newMapping);
        System.out.println("Created new Camunda ID mapping: " + originalId + " -> " + camundaId);
        
        return camundaId;
    }
    
    /**
     * Méthode de compatibilité pour l'ancienne signature
     * Crée toujours un nouveau mapping si aucun n'existe
     * 
     * @param originalId L'ID original
     * @return L'ID Camunda correspondant
     */
    @Transactional
    public String getCamundaId(String originalId) {
        return getCamundaId(originalId, true);
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
        log.info("Starting synchronization with Camunda identity service");
        
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
                
                // Ensure user exists
                ensureUserExists(userId);
                
                // Add user to groups
                if (groups != null) {
                    for (String groupId : groups) {
                        // Ensure group exists
                        ensureGroupExists(groupId);
                        
                        // Create membership if it doesn't exist
                        if (identityService.createUserQuery()
                                .userId(userId)
                                .memberOfGroup(groupId)
                                .count() == 0) {
                            
                            log.info("Adding user {} to group {}", userId, groupId);
                            identityService.createMembership(userId, groupId);
                        }
                    }
                }
            }
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
