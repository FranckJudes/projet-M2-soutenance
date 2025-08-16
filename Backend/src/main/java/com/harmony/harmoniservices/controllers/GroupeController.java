package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.GroupeUtilisateurDTO;
import com.harmony.harmoniservices.dto.UserDTO;
import com.harmony.harmoniservices.mappers.GroupeMapper;
import com.harmony.harmoniservices.mappers.UserMapper;
import com.harmony.harmoniservices.models.GroupeEntity;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.services.GroupeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groupes")
public class GroupeController {

    private final GroupeService groupeService;
    private final GroupeMapper groupeMapper;
    private final UserMapper userMapper;

    @Autowired
    public GroupeController(GroupeService groupeService, GroupeMapper groupeMapper, UserMapper userMapper) {
        this.groupeService = groupeService;
        this.groupeMapper = groupeMapper;
        this.userMapper = userMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupeUtilisateurDTO>>> getAllGroupes() {
        try {
            List<GroupeEntity> groupes = groupeService.findAll();
            List<GroupeUtilisateurDTO> groupeDTOs = groupes.stream()
                    .map(groupeMapper::toDomain)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Liste des groupes récupérée avec succès", groupeDTOs));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des groupes: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupeUtilisateurDTO>> getGroupeById(@PathVariable Long id) {
        try {
            Optional<GroupeEntity> groupe = groupeService.findById(id);
            if (groupe.isPresent()) {
                GroupeUtilisateurDTO groupeDTO = groupeMapper.toDomain(groupe.get());
                return ResponseEntity.ok(ApiResponse.success("Groupe trouvé", groupeDTO));
            } else {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.fail("Groupe avec id " + id + " non trouvé"));
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération du groupe: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupeUtilisateurDTO>> createGroupe(@Valid @RequestBody GroupeUtilisateurDTO groupeDTO) {
        try {
            GroupeEntity groupe = groupeMapper.toEntity(groupeDTO);
            GroupeEntity savedGroupe = groupeService.save(groupe);
            GroupeUtilisateurDTO savedGroupeDTO = groupeMapper.toDomain(savedGroupe);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Groupe créé avec succès", savedGroupeDTO));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création du groupe: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupeUtilisateurDTO>> updateGroupe(@PathVariable Long id, @Valid @RequestBody GroupeUtilisateurDTO groupeDTO) {
        try {
            // S'assurer que l'ID dans le chemin correspond à l'ID dans l'objet groupe
            if (groupeDTO.getId() == null) {
                groupeDTO.setId(id);
            } else if (!groupeDTO.getId().equals(id)) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("L'ID dans le chemin ne correspond pas à l'ID dans l'objet groupe"));
            }
            
            // Vérifier si le groupe existe
            if (!groupeService.existsById(id)) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Groupe avec id " + id + " non trouvé"));
            }
            
            GroupeEntity groupe = groupeMapper.toEntity(groupeDTO);
            GroupeEntity updatedGroupe = groupeService.update(groupe);
            GroupeUtilisateurDTO updatedGroupeDTO = groupeMapper.toDomain(updatedGroupe);
            return ResponseEntity.ok(ApiResponse.success("Groupe mis à jour avec succès", updatedGroupeDTO));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour du groupe: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroupe(@PathVariable Long id) {
        try {
            // Vérifier si le groupe existe
            if (!groupeService.existsById(id)) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Groupe avec id " + id + " non trouvé"));
            }
            
            groupeService.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Groupe supprimé avec succès", null));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la suppression du groupe: " + e.getMessage()));
        }
    }

    // === ENDPOINTS DE GESTION DES UTILISATEURS DANS LES GROUPES ===

    /**
     * Récupère tous les utilisateurs d'un groupe spécifique
     */
    @GetMapping("/{groupId}/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersInGroup(@PathVariable Long groupId) {
        try {
            List<UserEntity> users = groupeService.getUsersInGroup(groupId);
            List<UserDTO> userDTOs = users.stream()
                    .map(userMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Utilisateurs du groupe récupérés avec succès", userDTOs));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des utilisateurs: " + e.getMessage()));
        }
    }

    /**
     * Récupère tous les utilisateurs qui ne sont dans aucun groupe
     */
    @GetMapping("/users/without-group")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersWithoutGroup() {
        try {
            List<UserEntity> users = groupeService.getUsersWithoutGroup();
            List<UserDTO> userDTOs = users.stream()
                    .map(userMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Utilisateurs sans groupe récupérés avec succès", userDTOs));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des utilisateurs: " + e.getMessage()));
        }
    }

    /**
     * Ajoute des utilisateurs à un groupe
     */
    @PostMapping("/{groupId}/users")
    public ResponseEntity<ApiResponse<Void>> addUsersToGroup(@PathVariable Long groupId, @RequestBody List<Long> userIds) {
        try {
            groupeService.addUsersToGroup(groupId, userIds);
            return ResponseEntity.ok(ApiResponse.success("Utilisateurs ajoutés au groupe avec succès", null));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de l'ajout des utilisateurs: " + e.getMessage()));
        }
    }

    /**
     * Retire un utilisateur d'un groupe
     */
    @DeleteMapping("/{groupId}/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeUserFromGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        try {
            groupeService.removeUserFromGroup(groupId, userId);
            return ResponseEntity.ok(ApiResponse.success("Utilisateur retiré du groupe avec succès", null));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors du retrait de l'utilisateur: " + e.getMessage()));
        }
    }

    /**
     * DTO pour créer un groupe avec des utilisateurs
     */
    public static class CreateGroupWithUsersRequest {
        private String name;
        private String description;
        private String type;
        private List<Long> userIds;

        // Getters et setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public List<Long> getUserIds() { return userIds; }
        public void setUserIds(List<Long> userIds) { this.userIds = userIds; }
    }

    /**
     * Crée un groupe avec des utilisateurs
     */
    @PostMapping("/with-users")
    public ResponseEntity<ApiResponse<GroupeUtilisateurDTO>> createGroupWithUsers(@Valid @RequestBody CreateGroupWithUsersRequest request) {
        try {
            // Créer l'entité groupe à partir de la requête
            GroupeEntity groupe = GroupeEntity.builder()
                    .libele_groupe_utilisateur(request.getName())
                    .description_groupe_utilisateur(request.getDescription())
                    .build();
            
            // Créer le groupe avec les utilisateurs
            GroupeEntity savedGroupe = groupeService.createGroupWithUsers(groupe, request.getUserIds());
            
            // Convertir en DTO pour la réponse
            GroupeUtilisateurDTO groupeDTO = groupeMapper.toDomain(savedGroupe);
            
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Groupe créé avec utilisateurs avec succès", groupeDTO));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création du groupe avec utilisateurs: " + e.getMessage()));
        }
    }
}
