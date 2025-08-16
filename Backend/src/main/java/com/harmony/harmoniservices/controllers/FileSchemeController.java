package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.FileSchemeDto;
import com.harmony.harmoniservices.requests.FileSchemeRequest;
import com.harmony.harmoniservices.services.FileSchemeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des schémas de fichiers
 */
@RestController
@RequestMapping("/api/file-schemes")
@RequiredArgsConstructor
@Slf4j
public class FileSchemeController {

    private final FileSchemeService fileSchemeService;

    /**
     * Obtenir tous les schémas de fichiers actifs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getAllActiveFileSchemes(
            Authentication authentication) {
        try {
            log.info("Demande de récupération des schémas de fichiers actifs par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> fileSchemes = fileSchemeService.getAllActiveFileSchemes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Schémas de fichiers récupérés avec succès",
                    fileSchemes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des schémas de fichiers actifs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des schémas : " + e.getMessage()));
        }
    }

    /**
     * Obtenir tous les schémas de fichiers (actifs et inactifs)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getAllFileSchemes(
            Authentication authentication) {
        try {
            log.info("Demande de récupération de tous les schémas de fichiers par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> fileSchemes = fileSchemeService.getAllFileSchemes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Tous les schémas de fichiers récupérés avec succès",
                    fileSchemes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération de tous les schémas de fichiers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des schémas : " + e.getMessage()));
        }
    }

    /**
     * Obtenir l'arbre des schémas de fichiers
     */
    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getFileSchemeTree(
            Authentication authentication) {
        try {
            log.info("Demande de récupération de l'arbre des schémas par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> tree = fileSchemeService.getFileSchemeTree();

            return ResponseEntity.ok(ApiResponse.success(
                    "Arbre des schémas de fichiers récupéré avec succès",
                    tree));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'arbre des schémas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération de l'arbre : " + e.getMessage()));
        }
    }

    /**
     * Obtenir un schéma de fichier par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileSchemeDto>> getFileSchemeById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            log.info("Demande de récupération du schéma avec ID: {} par l'utilisateur: {}",
                    id, authentication != null ? authentication.getName() : "anonymous");

            FileSchemeDto fileScheme = fileSchemeService.getFileSchemeById(id);

            return ResponseEntity.ok(ApiResponse.success(
                    "Schéma de fichier récupéré avec succès",
                    fileScheme));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du schéma avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Schéma de fichier non trouvé : " + e.getMessage()));
        }
    }

    /**
     * Obtenir les enfants d'un schéma par ID parent
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getChildrenByParentId(
            @PathVariable Long parentId,
            Authentication authentication) {
        try {
            log.info("Demande de récupération des enfants du parent ID: {} par l'utilisateur: {}",
                    parentId, authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> children = fileSchemeService.getChildrenByParentId(parentId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Enfants du schéma récupérés avec succès",
                    children));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des enfants du parent ID: {}", parentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des enfants : " + e.getMessage()));
        }
    }

    /**
     * Créer un nouveau schéma de fichier
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FileSchemeDto>> createFileScheme(
            @Valid @RequestBody FileSchemeRequest request,
            Authentication authentication) {
        try {
            log.info("Demande de création d'un schéma de fichier par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            FileSchemeDto createdFileScheme = fileSchemeService.createFileScheme(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "Schéma de fichier créé avec succès",
                            createdFileScheme));

        } catch (Exception e) {
            log.error("Erreur lors de la création du schéma de fichier", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création du schéma : " + e.getMessage()));
        }
    }

    /**
     * Mettre à jour un schéma de fichier
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FileSchemeDto>> updateFileScheme(
            @PathVariable Long id,
            @Valid @RequestBody FileSchemeRequest request,
            Authentication authentication) {
        try {
            log.info("Demande de mise à jour du schéma avec ID: {} par l'utilisateur: {}",
                    id, authentication != null ? authentication.getName() : "anonymous");

            FileSchemeDto updatedFileScheme = fileSchemeService.updateFileScheme(id, request);

            return ResponseEntity.ok(ApiResponse.success(
                    "Schéma de fichier mis à jour avec succès",
                    updatedFileScheme));

        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du schéma avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour du schéma : " + e.getMessage()));
        }
    }

    /**
     * Supprimer un schéma de fichier
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFileScheme(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            log.info("Demande de suppression du schéma avec ID: {} par l'utilisateur: {}",
                    id, authentication != null ? authentication.getName() : "anonymous");

            fileSchemeService.deleteFileScheme(id);

            return ResponseEntity.ok(ApiResponse.success(
                    "Schéma de fichier supprimé avec succès"));

        } catch (Exception e) {
            log.error("Erreur lors de la suppression du schéma avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la suppression du schéma : " + e.getMessage()));
        }
    }

    /**
     * Changer le statut d'activation d'un schéma
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FileSchemeDto>> toggleFileSchemeStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive,
            Authentication authentication) {
        try {
            log.info("Demande de changement de statut du schéma avec ID: {} vers {} par l'utilisateur: {}",
                    id, isActive, authentication != null ? authentication.getName() : "anonymous");

            FileSchemeDto updatedFileScheme = fileSchemeService.toggleFileSchemeStatus(id, isActive);

            return ResponseEntity.ok(ApiResponse.success(
                    "Statut du schéma mis à jour avec succès",
                    updatedFileScheme));

        } catch (Exception e) {
            log.error("Erreur lors du changement de statut du schéma avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors du changement de statut : " + e.getMessage()));
        }
    }

    /**
     * Rechercher des schémas de fichiers
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> searchFileSchemes(
            @RequestParam String searchTerm,
            Authentication authentication) {
        try {
            log.info("Demande de recherche de schémas avec le terme: {} par l'utilisateur: {}",
                    searchTerm, authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> fileSchemes = fileSchemeService.searchFileSchemes(searchTerm);

            return ResponseEntity.ok(ApiResponse.success(
                    "Recherche de schémas effectuée avec succès",
                    fileSchemes));

        } catch (Exception e) {
            log.error("Erreur lors de la recherche de schémas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la recherche : " + e.getMessage()));
        }
    }

    /**
     * Obtenir tous les dossiers
     */
    @GetMapping("/directories")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getAllDirectories(
            Authentication authentication) {
        try {
            log.info("Demande de récupération de tous les dossiers par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> directories = fileSchemeService.getAllDirectories();

            return ResponseEntity.ok(ApiResponse.success(
                    "Dossiers récupérés avec succès",
                    directories));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des dossiers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des dossiers : " + e.getMessage()));
        }
    }

    /**
     * Obtenir tous les fichiers
     */
    @GetMapping("/files")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getAllFiles(
            Authentication authentication) {
        try {
            log.info("Demande de récupération de tous les fichiers par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> files = fileSchemeService.getAllFiles();

            return ResponseEntity.ok(ApiResponse.success(
                    "Fichiers récupérés avec succès",
                    files));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des fichiers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des fichiers : " + e.getMessage()));
        }
    }

    /**
     * Obtenir les schémas par type de document
     */
    @GetMapping("/by-document-type/{documentTypeId}")
    public ResponseEntity<ApiResponse<List<FileSchemeDto>>> getFileSchemesByDocumentType(
            @PathVariable Long documentTypeId,
            Authentication authentication) {
        try {
            log.info("Demande de récupération des schémas pour le type de document: {} par l'utilisateur: {}",
                    documentTypeId, authentication != null ? authentication.getName() : "anonymous");

            List<FileSchemeDto> fileSchemes = fileSchemeService.getFileSchemesByDocumentType(documentTypeId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Schémas par type de document récupérés avec succès",
                    fileSchemes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des schémas par type de document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération : " + e.getMessage()));
        }
    }

    /**
     * Nettoyer les schémas orphelins
     */
    @PostMapping("/cleanup-orphaned")
    public ResponseEntity<ApiResponse<Integer>> cleanupOrphanedSchemes(
            Authentication authentication) {
        try {
            log.info("Demande de nettoyage des schémas orphelins par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            int cleanedCount = fileSchemeService.cleanupOrphanedSchemes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Nettoyage des schémas orphelins effectué avec succès",
                    cleanedCount));

        } catch (Exception e) {
            log.error("Erreur lors du nettoyage des schémas orphelins", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors du nettoyage : " + e.getMessage()));
        }
    }

    /**
     * Initialiser les schémas par défaut
     */
    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<Void>> initializeDefaultFileSchemes(
            Authentication authentication) {
        try {
            log.info("Demande d'initialisation des schémas par défaut par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            fileSchemeService.initializeDefaultFileSchemes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Schémas de fichiers par défaut initialisés avec succès"));

        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation des schémas par défaut", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de l'initialisation : " + e.getMessage()));
        }
    }
}
