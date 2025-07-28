package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.ApiSuccessResponse;
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
     * @return ResponseEntity with ApiSuccessResponse containing list of MetadataDto
     */
    @GetMapping
    public ResponseEntity<ApiSuccessResponse<List<MetadataDto>>> getAllMetadata() {
        List<MetadataDto> metadatas = metadataService.getAllMetadata();
        return ResponseEntity.ok(ApiSuccessResponse.of(
                metadatas,
                "Liste des métadonnées récupérée avec succès",
                200
        ));
    }
    
    /**
     * Get a Metadata by id
     * @param id the id of the Metadata
     * @return ResponseEntity with ApiSuccessResponse containing MetadataDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<MetadataDto>> getMetadataById(@PathVariable Long id) {
        MetadataDto metadata = metadataService.getMetadataById(id);
        return ResponseEntity.ok(ApiSuccessResponse.of(
                metadata,
                "Métadonnée récupérée avec succès",
                200
        ));
    }
    
    /**
     * Create a new Metadata
     * @param request the MetadataRequest
     * @return ResponseEntity with ApiSuccessResponse containing created MetadataDto
     */
    @PostMapping
    public ResponseEntity<ApiSuccessResponse<MetadataDto>> createMetadata(
            @Valid @RequestBody MetadataRequest request) {
        MetadataDto createdMetadata = metadataService.createMetadata(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(
                createdMetadata,
                "Métadonnée créée avec succès",
                201
        ));
    }
    
    /**
     * Update a Metadata
     * @param id the id of the Metadata to update
     * @param request the MetadataRequest with updated values
     * @return ResponseEntity with ApiSuccessResponse containing updated MetadataDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<MetadataDto>> updateMetadata(
            @PathVariable Long id,
            @Valid @RequestBody MetadataRequest request) {
        MetadataDto updatedMetadata = metadataService.updateMetadata(id, request);
        return ResponseEntity.ok(ApiSuccessResponse.of(
                updatedMetadata,
                "Métadonnée mise à jour avec succès",
                200
        ));
    }
    
    /**
     * Delete a Metadata
     * @param id the id of the Metadata to delete
     * @return ResponseEntity with ApiSuccessResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<Void>> deleteMetadata(@PathVariable Long id) {
        metadataService.deleteMetadata(id);
        return ResponseEntity.ok(ApiSuccessResponse.of(
                "Métadonnée supprimée avec succès",
                200
        ));
    }
}
