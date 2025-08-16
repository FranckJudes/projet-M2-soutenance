package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.DocumentTypeDto;
import com.harmony.harmoniservices.requests.DocumentTypeRequest;
import com.harmony.harmoniservices.services.DocumentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des types de documents
 */
@RestController
@RequestMapping("/api/document-types")
@RequiredArgsConstructor
@Slf4j
public class DocumentTypeController {

    private final DocumentTypeService documentTypeService;

    /**
     * Obtenir tous les types de documents actifs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> getAllActiveDocumentTypes(
            Authentication authentication) {
        try {
            log.info("Demande de récupération des types de documents actifs par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<DocumentTypeDto> documentTypes = documentTypeService.getAllActiveDocumentTypes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Types de documents récupérés avec succès",
                    documentTypes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des types de documents actifs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des types de documents : " + e.getMessage()));
        }
    }

    /**
     * Obtenir tous les types de documents (actifs et inactifs)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> getAllDocumentTypes(
            Authentication authentication) {
        try {
            log.info("Demande de récupération de tous les types de documents par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<DocumentTypeDto> documentTypes = documentTypeService.getAllDocumentTypes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Tous les types de documents récupérés avec succès",
                    documentTypes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération de tous les types de documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des types de documents : " + e.getMessage()));
        }
    }

    /**
     * Obtenir les types de documents simplifiés pour les sélections
     */
    @GetMapping("/simple")
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> getSimpleDocumentTypes(
            Authentication authentication) {
        try {
            log.info("Demande de récupération des types de documents simplifiés par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            List<DocumentTypeDto> documentTypes = documentTypeService.getSimpleDocumentTypes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Types de documents simplifiés récupérés avec succès",
                    documentTypes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des types de documents simplifiés", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des types de documents : " + e.getMessage()));
        }
    }

    /**
     * Obtenir un type de document par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> getDocumentTypeById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            log.info("Demande de récupération du type de document avec ID: {} par l'utilisateur: {}",
                    id, authentication != null ? authentication.getName() : "anonymous");

            DocumentTypeDto documentType = documentTypeService.getDocumentTypeById(id);

            return ResponseEntity.ok(ApiResponse.success(
                    "Type de document récupéré avec succès",
                    documentType));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du type de document avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Type de document non trouvé : " + e.getMessage()));
        }
    }

    /**
     * Obtenir un type de document par son code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> getDocumentTypeByCode(
            @PathVariable String code,
            Authentication authentication) {
        try {
            log.info("Demande de récupération du type de document avec code: {} par l'utilisateur: {}",
                    code, authentication != null ? authentication.getName() : "anonymous");

            DocumentTypeDto documentType = documentTypeService.getDocumentTypeByCode(code);

            return ResponseEntity.ok(ApiResponse.success(
                    "Type de document récupéré avec succès",
                    documentType));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du type de document avec code: {}", code, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Type de document non trouvé : " + e.getMessage()));
        }
    }

    /**
     * Créer un nouveau type de document
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DocumentTypeDto>> createDocumentType(
            @Valid @RequestBody DocumentTypeRequest request,
            Authentication authentication) {
        try {
            log.info("Demande de création d'un type de document par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            DocumentTypeDto createdDocumentType = documentTypeService.createDocumentType(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "Type de document créé avec succès",
                            createdDocumentType));

        } catch (Exception e) {
            log.error("Erreur lors de la création du type de document", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création du type de document : " + e.getMessage()));
        }
    }

    /**
     * Mettre à jour un type de document
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> updateDocumentType(
            @PathVariable Long id,
            @Valid @RequestBody DocumentTypeRequest request,
            Authentication authentication) {
        try {
            log.info("Demande de mise à jour du type de document avec ID: {} par l'utilisateur: {}",
                    id, authentication != null ? authentication.getName() : "anonymous");

            DocumentTypeDto updatedDocumentType = documentTypeService.updateDocumentType(id, request);

            return ResponseEntity.ok(ApiResponse.success(
                    "Type de document mis à jour avec succès",
                    updatedDocumentType));

        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du type de document avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour du type de document : " + e.getMessage()));
        }
    }

    /**
     * Supprimer un type de document
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocumentType(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            log.info("Demande de suppression du type de document avec ID: {} par l'utilisateur: {}",
                    id, authentication != null ? authentication.getName() : "anonymous");

            documentTypeService.deleteDocumentType(id);

            return ResponseEntity.ok(ApiResponse.success(
                    "Type de document supprimé avec succès"));

        } catch (Exception e) {
            log.error("Erreur lors de la suppression du type de document avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la suppression du type de document : " + e.getMessage()));
        }
    }

    /**
     * Changer le statut d'activation d'un type de document
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> toggleDocumentTypeStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive,
            Authentication authentication) {
        try {
            log.info("Demande de changement de statut du type de document avec ID: {} vers {} par l'utilisateur: {}",
                    id, isActive, authentication != null ? authentication.getName() : "anonymous");

            DocumentTypeDto updatedDocumentType = documentTypeService.toggleDocumentTypeStatus(id, isActive);

            return ResponseEntity.ok(ApiResponse.success(
                    "Statut du type de document mis à jour avec succès",
                    updatedDocumentType));

        } catch (Exception e) {
            log.error("Erreur lors du changement de statut du type de document avec ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors du changement de statut : " + e.getMessage()));
        }
    }

    /**
     * Rechercher des types de documents
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> searchDocumentTypes(
            @RequestParam String searchTerm,
            Authentication authentication) {
        try {
            log.info("Demande de recherche de types de documents avec le terme: {} par l'utilisateur: {}",
                    searchTerm, authentication != null ? authentication.getName() : "anonymous");

            List<DocumentTypeDto> documentTypes = documentTypeService.searchDocumentTypes(searchTerm);

            return ResponseEntity.ok(ApiResponse.success(
                    "Recherche de types de documents effectuée avec succès",
                    documentTypes));

        } catch (Exception e) {
            log.error("Erreur lors de la recherche de types de documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la recherche : " + e.getMessage()));
        }
    }

    /**
     * Obtenir des types de documents par extension de fichier
     */
    @GetMapping("/extension/{extension}")
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> getDocumentTypesByFileExtension(
            @PathVariable String extension,
            Authentication authentication) {
        try {
            log.info("Demande de récupération des types de documents pour l'extension: {} par l'utilisateur: {}",
                    extension, authentication != null ? authentication.getName() : "anonymous");

            List<DocumentTypeDto> documentTypes = documentTypeService.getDocumentTypesByFileExtension(extension);

            return ResponseEntity.ok(ApiResponse.success(
                    "Types de documents récupérés par extension avec succès",
                    documentTypes));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des types de documents par extension", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération : " + e.getMessage()));
        }
    }

    /**
     * Initialiser les types de documents par défaut
     */
    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<Void>> initializeDefaultDocumentTypes(
            Authentication authentication) {
        try {
            log.info("Demande d'initialisation des types de documents par défaut par l'utilisateur: {}",
                    authentication != null ? authentication.getName() : "anonymous");

            documentTypeService.initializeDefaultDocumentTypes();

            return ResponseEntity.ok(ApiResponse.success(
                    "Types de documents par défaut initialisés avec succès"));

        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation des types de documents par défaut", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de l'initialisation : " + e.getMessage()));
        }
    }
}
