package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.DomaineValeurDto;
import com.harmony.harmoniservices.requests.DomaineValeurRequest;
import com.harmony.harmoniservices.services.DomaineValeurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for DomaineValeur operations
 */
@RestController
@RequestMapping("/api/domaine-valeurs")
@RequiredArgsConstructor
public class DomaineValeurController {
    
    private final DomaineValeurService domaineValeurService;
    
    /**
     * Get all DomaineValeur entities
     * @return ResponseEntity with ApiResponse containing list of DomaineValeurDto
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DomaineValeurDto>>> getAllDomaineValeurs() {
        try {
            List<DomaineValeurDto> domaineValeurs = domaineValeurService.getAllDomaineValeurs();
            return ResponseEntity.ok(ApiResponse.success("Liste des domaines de valeurs récupérée avec succès", domaineValeurs));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors de la récupération des domaines de valeurs: " + e.getMessage()));
        }
    }
    
    /**
     * Get a DomaineValeur by id
     * @param id the id of the DomaineValeur
     * @return ResponseEntity with ApiResponse containing DomaineValeurDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DomaineValeurDto>> getDomaineValeurById(@PathVariable Long id) {
        try {
            DomaineValeurDto domaineValeur = domaineValeurService.getDomaineValeurById(id);
            return ResponseEntity.ok(ApiResponse.success("Domaine de valeur récupéré avec succès", domaineValeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la récupération du domaine de valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new DomaineValeur
     * @param request the DomaineValeurRequest
     * @return ResponseEntity with ApiResponse containing created DomaineValeurDto
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DomaineValeurDto>> createDomaineValeur(
            @Valid @RequestBody DomaineValeurRequest request) {
        try {
            DomaineValeurDto createdDomaineValeur = domaineValeurService.createDomaineValeur(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Domaine de valeur créé avec succès", createdDomaineValeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création du domaine de valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Update a DomaineValeur
     * @param id the id of the DomaineValeur to update
     * @param request the DomaineValeurRequest with updated values
     * @return ResponseEntity with ApiResponse containing updated DomaineValeurDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DomaineValeurDto>> updateDomaineValeur(
            @PathVariable Long id,
            @Valid @RequestBody DomaineValeurRequest request) {
        try {
            DomaineValeurDto updatedDomaineValeur = domaineValeurService.updateDomaineValeur(id, request);
            return ResponseEntity.ok(ApiResponse.success("Domaine de valeur mis à jour avec succès", updatedDomaineValeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour du domaine de valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a DomaineValeur
     * @param id the id of the DomaineValeur to delete
     * @return ResponseEntity with ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDomaineValeur(@PathVariable Long id) {
        try {
            domaineValeurService.deleteDomaineValeur(id);
            return ResponseEntity.ok(ApiResponse.success("Domaine de valeur supprimé avec succès", null));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la suppression du domaine de valeur: " + e.getMessage()));
        }
    }
}
