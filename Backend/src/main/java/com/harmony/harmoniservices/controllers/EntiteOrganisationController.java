package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.ApiSuccessResponse;
import com.harmony.harmoniservices.dto.EntiteOrganisationDto;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.requests.EntiteOrganisationRequest;
import com.harmony.harmoniservices.requests.EntiteUserRequest;
import com.harmony.harmoniservices.services.EntiteOrganisationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST Controller for EntiteOrganisation operations
 */
@RestController
@RequestMapping("/api/entites-organisation")
public class EntiteOrganisationController {
    
    private final EntiteOrganisationService entiteOrganisationService;
    
    @Autowired
    public EntiteOrganisationController(EntiteOrganisationService entiteOrganisationService) {
        this.entiteOrganisationService = entiteOrganisationService;
    }
    
    /**
     * Get all entities
     * 
     * @return list of all entities
     */
    @GetMapping
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> getAllEntites() {
        List<EntiteOrganisationDto> entites = entiteOrganisationService.getAllEntites();
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                entites, "Entités récupérées avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all active entities
     * 
     * @return list of all active entities
     */
    @GetMapping("/active")
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> getAllActiveEntites() {
        List<EntiteOrganisationDto> entites = entiteOrganisationService.getAllActiveEntites();
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                entites, "Entités actives récupérées avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get root entities (entities without a parent)
     * 
     * @return list of root entities
     */
    @GetMapping("/roots")
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> getRootEntites() {
        List<EntiteOrganisationDto> rootEntites = entiteOrganisationService.getRootEntites();
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                rootEntites, "Entités racines récupérées avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get child entities for a parent
     * 
     * @param parentId the ID of the parent entity
     * @return list of child entities
     */
    @GetMapping("/children/{parentId}")
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> getChildEntites(@PathVariable Long parentId) {
        List<EntiteOrganisationDto> childEntites = entiteOrganisationService.getChildEntites(parentId);
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                childEntites, "Entités enfants récupérées avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get an entity by ID
     * 
     * @param id the ID of the entity to get
     * @return the entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<EntiteOrganisationDto>> getEntiteById(@PathVariable Long id) {
        EntiteOrganisationDto entite = entiteOrganisationService.getEntiteById(id);
        ApiSuccessResponse<EntiteOrganisationDto> response = ApiSuccessResponse.of(
                entite, "Entité récupérée avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get an entity by code
     * 
     * @param code the code of the entity to get
     * @return the entity
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiSuccessResponse<EntiteOrganisationDto>> getEntiteByCode(@PathVariable String code) {
        EntiteOrganisationDto entite = entiteOrganisationService.getEntiteByCode(code);
        ApiSuccessResponse<EntiteOrganisationDto> response = ApiSuccessResponse.of(
                entite, "Entité récupérée avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search entities by name
     * 
     * @param name the name to search for
     * @return list of matching entities
     */
    @GetMapping("/search")
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> searchEntitesByName(@RequestParam String name) {
        List<EntiteOrganisationDto> entites = entiteOrganisationService.searchEntitesByName(name);
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                entites, "Entités recherchées avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create a new entity
     * 
     * @param request the entity request to create
     * @return the created entity
     */
    @PostMapping
    public ResponseEntity<ApiSuccessResponse<EntiteOrganisationDto>> createEntite(@Valid @RequestBody EntiteOrganisationRequest request) {
        EntiteOrganisationDto entiteDto = EntiteOrganisationDto.builder()
                .libele(request.getLibele())
                .description(request.getDescription())
                .code(request.getCode())
                .parentId(request.getParentId())
                .typeEntityId(request.getTypeEntityId())
                .active(request.getActive())
                .userIds(request.getUserIds())
                .build();
        EntiteOrganisationDto createdEntite = entiteOrganisationService.createEntite(entiteDto);
        ApiSuccessResponse<EntiteOrganisationDto> response = ApiSuccessResponse.of(
                createdEntite, "Entité créée avec succès", HttpStatus.CREATED.value());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Update an existing entity
     * 
     * @param id the ID of the entity to update
     * @param request the new entity data
     * @return the updated entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<EntiteOrganisationDto>> updateEntite(
            @PathVariable Long id,
            @Valid @RequestBody EntiteOrganisationRequest request) {
        EntiteOrganisationDto entiteDto = EntiteOrganisationDto.builder()
                .id(id)
                .libele(request.getLibele())
                .description(request.getDescription())
                .code(request.getCode())
                .parentId(request.getParentId())
                .typeEntityId(request.getTypeEntityId())
                .active(request.getActive())
                .userIds(request.getUserIds())
                .build();
        EntiteOrganisationDto updatedEntite = entiteOrganisationService.updateEntite(id, entiteDto);
        ApiSuccessResponse<EntiteOrganisationDto> response = ApiSuccessResponse.of(
                updatedEntite, "Entité mise à jour avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete an entity
     * 
     * @param id the ID of the entity to delete
     * @return success response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<Void>> deleteEntite(@PathVariable Long id) {
        entiteOrganisationService.deleteEntite(id);
        ApiSuccessResponse<Void> response = ApiSuccessResponse.of(
                "Entité supprimée avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get entities by user ID
     * 
     * @param userId the ID of the user
     * @return list of entities associated with the user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> getEntitiesByUserId(@PathVariable Long userId) {
        List<EntiteOrganisationDto> entites = entiteOrganisationService.getEntitiesByUserId(userId);
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                entites, "Entités de l'utilisateur récupérées avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get users by entity ID
     * 
     * @param entityId the ID of the entity
     * @return list of user IDs associated with the entity
     */
    @GetMapping("/{entityId}/users")
    public ResponseEntity<ApiSuccessResponse<Set<Long>>> getUsersByEntityId(@PathVariable Long entityId) {
        Set<UserEntity> users = entiteOrganisationService.getUsersByEntityId(entityId);
        Set<Long> userIds = users.stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
        ApiSuccessResponse<Set<Long>> response = ApiSuccessResponse.of(
                userIds, "Utilisateurs récupérés avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Add a user to an entity
     * 
     * @param entityId the ID of the entity
     * @param userId the ID of the user to add
     * @return success response
     */
    @PostMapping("/{entityId}/users/{userId}")
    public ResponseEntity<ApiSuccessResponse<Void>> addUserToEntity(
            @PathVariable Long entityId,
            @PathVariable Long userId) {
        entiteOrganisationService.addUserToEntity(entityId, userId);
        ApiSuccessResponse<Void> response = ApiSuccessResponse.of(
                "Utilisateur ajouté avec succès à l'entité", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Add multiple users to an entity
     * 
     * @param entityId the ID of the entity
     * @param request the request containing user IDs to add
     * @return success response
     */
    @PostMapping("/{entityId}/users/batch")
    public ResponseEntity<ApiSuccessResponse<Void>> addUsersToEntity(
            @PathVariable Long entityId,
            @Valid @RequestBody EntiteUserRequest request) {
        for (Long userId : request.getUserIds()) {
            entiteOrganisationService.addUserToEntity(entityId, userId);
        }
        ApiSuccessResponse<Void> response = ApiSuccessResponse.of(
                "Utilisateurs ajoutés avec succès à l'entité", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove a user from an entity
     * 
     * @param entityId the ID of the entity
     * @param userId the ID of the user to remove
     * @return success response
     */
    @DeleteMapping("/{entityId}/users/{userId}")
    public ResponseEntity<ApiSuccessResponse<Void>> removeUserFromEntity(
            @PathVariable Long entityId,
            @PathVariable Long userId) {
        entiteOrganisationService.removeUserFromEntity(entityId, userId);
        ApiSuccessResponse<Void> response = ApiSuccessResponse.of(
                "Utilisateur retiré avec succès de l'entité", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove multiple users from an entity
     * 
     * @param entityId the ID of the entity
     * @param request the request containing user IDs to remove
     * @return success response
     */
    @DeleteMapping("/{entityId}/users/batch")
    public ResponseEntity<ApiSuccessResponse<Void>> removeUsersFromEntity(
            @PathVariable Long entityId,
            @Valid @RequestBody EntiteUserRequest request) {
        for (Long userId : request.getUserIds()) {
            entiteOrganisationService.removeUserFromEntity(entityId, userId);
        }
        ApiSuccessResponse<Void> response = ApiSuccessResponse.of(
                "Utilisateurs retirés avec succès de l'entité", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get the complete organizational structure
     * 
     * @return list of root entities with their children
     */
    @GetMapping("/organigramme")
    public ResponseEntity<ApiSuccessResponse<List<EntiteOrganisationDto>>> getOrganigramme() {
        List<EntiteOrganisationDto> organigramme = entiteOrganisationService.getOrganigramme();
        ApiSuccessResponse<List<EntiteOrganisationDto>> response = ApiSuccessResponse.of(
                organigramme, "Organigramme récupéré avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
}
