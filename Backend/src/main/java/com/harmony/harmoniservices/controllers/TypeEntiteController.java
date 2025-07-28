package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.ApiSuccessResponse;
import com.harmony.harmoniservices.dto.TypeEntiteDto;
import com.harmony.harmoniservices.requests.TypeEntiteRequest;
import com.harmony.harmoniservices.services.TypeEntiteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for TypeEntite operations
 */
@RestController
@RequestMapping("/api/type-entites")
public class TypeEntiteController {
    
    private final TypeEntiteService typeEntiteService;
    
    @Autowired
    public TypeEntiteController(TypeEntiteService typeEntiteService) {
        this.typeEntiteService = typeEntiteService;
    }
    
    /**
     * Get all type entities
     * 
     * @return list of all type entities
     */
    @GetMapping
    public ResponseEntity<ApiSuccessResponse<List<TypeEntiteDto>>> getAllTypeEntites() {
        List<TypeEntiteDto> typeEntites = typeEntiteService.getAllTypeEntites();
        ApiSuccessResponse<List<TypeEntiteDto>> response = ApiSuccessResponse.of(
                typeEntites, "Types d'entités récupérés avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get a type entity by ID
     * 
     * @param id the ID of the type entity to get
     * @return the type entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<TypeEntiteDto>> getTypeEntiteById(@PathVariable Long id) {
        TypeEntiteDto typeEntite = typeEntiteService.getTypeEntiteById(id);
        ApiSuccessResponse<TypeEntiteDto> response = ApiSuccessResponse.of(
                typeEntite, "Type d'entité récupéré avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create a new type entity
     * 
     * @param request the type entity request to create
     * @return the created type entity
     */
    @PostMapping
    public ResponseEntity<ApiSuccessResponse<TypeEntiteDto>> createTypeEntite(@Valid @RequestBody TypeEntiteRequest request) {
        TypeEntiteDto typeEntiteDto = TypeEntiteDto.builder()
                .libele(request.getLibele())
                .description(request.getDescription())
                .build();
        TypeEntiteDto createdTypeEntite = typeEntiteService.createTypeEntite(typeEntiteDto);
        ApiSuccessResponse<TypeEntiteDto> response = ApiSuccessResponse.of(
                createdTypeEntite, "Type d'entité créé avec succès", HttpStatus.CREATED.value());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Update an existing type entity
     * 
     * @param id the ID of the type entity to update
     * @param request the new type entity data
     * @return the updated type entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<TypeEntiteDto>> updateTypeEntite(
            @PathVariable Long id,
            @Valid @RequestBody TypeEntiteRequest request) {
        TypeEntiteDto typeEntiteDto = TypeEntiteDto.builder()
                .id(id)
                .libele(request.getLibele())
                .description(request.getDescription())
                .build();
        TypeEntiteDto updatedTypeEntite = typeEntiteService.updateTypeEntite(id, typeEntiteDto);
        ApiSuccessResponse<TypeEntiteDto> response = ApiSuccessResponse.of(
                updatedTypeEntite, "Type d'entité mis à jour avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a type entity
     * 
     * @param id the ID of the type entity to delete
     * @return success response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<Void>> deleteTypeEntite(@PathVariable Long id) {
        typeEntiteService.deleteTypeEntite(id);
        ApiSuccessResponse<Void> response = ApiSuccessResponse.of(
                "Type d'entité supprimé avec succès", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
}
