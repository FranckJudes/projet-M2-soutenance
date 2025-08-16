package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.MetadataDto;
import com.harmony.harmoniservices.requests.MetadataRequest;
import com.harmony.harmoniservices.services.MetadataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Metadata operations
 */
@RestController
@RequestMapping("/api/metadatas")
@RequiredArgsConstructor
public class MetadataController {
    
    private final MetadataService metadataService;
    
    /**
     * Get all Metadata entities
     * @return ResponseEntity with ApiResponse containing list of MetadataDto
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MetadataDto>>> getAllMetadata() {
        try {
            List<MetadataDto> metadatas = metadataService.getAllMetadata();
            return ResponseEntity.ok(ApiResponse.success(
                    "Liste des métadonnées récupérée avec succès",
                    metadatas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des métadonnées: " + e.getMessage()));
        }
    }
    
    /**
     * Get a Metadata by id
     * @param id the id of the Metadata
     * @return ResponseEntity with ApiResponse containing MetadataDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MetadataDto>> getMetadataById(@PathVariable Long id) {
        try {
            MetadataDto metadata = metadataService.getMetadataById(id);
            return ResponseEntity.ok(ApiResponse.success(
                    "Métadonnée récupérée avec succès",
                    metadata
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la récupération de la métadonnée: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new Metadata
     * @param request the MetadataRequest
     * @return ResponseEntity with ApiResponse containing created MetadataDto
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MetadataDto>> createMetadata(
            @Valid @RequestBody MetadataRequest request) {
        try {
            MetadataDto createdMetadata = metadataService.createMetadata(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                    "Métadonnée créée avec succès",
                    createdMetadata
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création de la métadonnée: " + e.getMessage()));
        }
    }
    
    /**
     * Update a Metadata
     * @param id the id of the Metadata to update
     * @param request the MetadataRequest with updated values
     * @return ResponseEntity with ApiResponse containing updated MetadataDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MetadataDto>> updateMetadata(
            @PathVariable Long id,
            @Valid @RequestBody MetadataRequest request) {
        try {
            MetadataDto updatedMetadata = metadataService.updateMetadata(id, request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Métadonnée mise à jour avec succès",
                    updatedMetadata
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour de la métadonnée: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a Metadata
     * @param id the id of the Metadata to delete
     * @return ResponseEntity with ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMetadata(@PathVariable Long id) {
        try {
            metadataService.deleteMetadata(id);
            return ResponseEntity.ok(ApiResponse.success(
                    "Métadonnée supprimée avec succès"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la suppression de la métadonnée: " + e.getMessage()));
        }
    }
}
