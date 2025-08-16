package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.FormDto;
import com.harmony.harmoniservices.requests.FormRequest;
import com.harmony.harmoniservices.services.FormManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Form operations
 */
@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {
    
    private final FormManagementService formManagementService;
    
    /**
     * Get all forms
     * @return ResponseEntity with ApiResponse containing list of FormDto
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FormDto>>> getAllForms() {
        try {
            List<FormDto> forms = formManagementService.getAllForms();
            return ResponseEntity.ok(ApiResponse.success(
                    "Liste des formulaires récupérée avec succès",
                    forms
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des formulaires: " + e.getMessage()));
        }
    }
    
    /**
     * Get a form by id
     * @param id the id of the form
     * @return ResponseEntity with ApiResponse containing FormDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FormDto>> getFormById(@PathVariable Long id) {
        try {
            FormDto form = formManagementService.getFormById(id);
            return ResponseEntity.ok(ApiResponse.success(
                    "Formulaire récupéré avec succès",
                    form
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la récupération du formulaire: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new form
     * @param request the FormRequest
     * @return ResponseEntity with ApiResponse containing created FormDto
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FormDto>> createForm(
            @Valid @RequestBody FormRequest request) {
        try {
            FormDto createdForm = formManagementService.createForm(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                    "Formulaire créé avec succès",
                    createdForm
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création du formulaire: " + e.getMessage()));
        }
    }
    
    /**
     * Update a form
     * @param id the id of the form to update
     * @param request the FormRequest with updated values
     * @return ResponseEntity with ApiResponse containing updated FormDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FormDto>> updateForm(
            @PathVariable Long id,
            @Valid @RequestBody FormRequest request) {
        try {
            FormDto updatedForm = formManagementService.updateForm(id, request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Formulaire mis à jour avec succès",
                    updatedForm
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour du formulaire: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a form
     * @param id the id of the form to delete
     * @return ResponseEntity with ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteForm(@PathVariable Long id) {
        try {
            formManagementService.deleteForm(id);
            return ResponseEntity.ok(ApiResponse.success(
                    "Formulaire supprimé avec succès"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la suppression du formulaire: " + e.getMessage()));
        }
    }
    
    /**
     * Search forms by name
     * @param searchTerm the search term
     * @return ResponseEntity with ApiResponse containing list of matching FormDto
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FormDto>>> searchForms(
            @RequestParam String searchTerm) {
        try {
            List<FormDto> forms = formManagementService.searchFormsByName(searchTerm);
            return ResponseEntity.ok(ApiResponse.success(
                    "Recherche effectuée avec succès",
                    forms
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la recherche: " + e.getMessage()));
        }
    }
}
