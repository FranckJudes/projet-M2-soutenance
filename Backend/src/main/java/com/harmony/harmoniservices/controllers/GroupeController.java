package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.GroupeUtilisateurDTO;
import com.harmony.harmoniservices.mappers.GroupeMapper;
import com.harmony.harmoniservices.models.GroupeEntity;
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

    @Autowired
    public GroupeController(GroupeService groupeService, GroupeMapper groupeMapper) {
        this.groupeService = groupeService;
        this.groupeMapper = groupeMapper;
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
}
