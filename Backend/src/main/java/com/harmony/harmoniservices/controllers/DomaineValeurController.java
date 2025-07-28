package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.ApiSuccessResponse;
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
     * @return ResponseEntity with ApiSuccessResponse containing list of DomaineValeurDto
     */
    @GetMapping
    public ResponseEntity<ApiSuccessResponse<List<DomaineValeurDto>>> getAllDomaineValeurs() {
        List<DomaineValeurDto> domaineValeurs = domaineValeurService.getAllDomaineValeurs();
        return ResponseEntity.ok(ApiSuccessResponse.of(
                domaineValeurs,
                "Liste des domaines de valeurs récupérée avec succès",
                200
        ));
    }
    
    /**
     * Get a DomaineValeur by id
     * @param id the id of the DomaineValeur
     * @return ResponseEntity with ApiSuccessResponse containing DomaineValeurDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<DomaineValeurDto>> getDomaineValeurById(@PathVariable Long id) {
        DomaineValeurDto domaineValeur = domaineValeurService.getDomaineValeurById(id);
        return ResponseEntity.ok(ApiSuccessResponse.of(
                domaineValeur,
                "Domaine de valeur récupéré avec succès",
                200
        ));
    }
    
    /**
     * Create a new DomaineValeur
     * @param request the DomaineValeurRequest
     * @return ResponseEntity with ApiSuccessResponse containing created DomaineValeurDto
     */
    @PostMapping
    public ResponseEntity<ApiSuccessResponse<DomaineValeurDto>> createDomaineValeur(
            @Valid @RequestBody DomaineValeurRequest request) {
        DomaineValeurDto createdDomaineValeur = domaineValeurService.createDomaineValeur(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(
                createdDomaineValeur,
                "Domaine de valeur créé avec succès",
                201
        ));
    }
    
    /**
     * Update a DomaineValeur
     * @param id the id of the DomaineValeur to update
     * @param request the DomaineValeurRequest with updated values
     * @return ResponseEntity with ApiSuccessResponse containing updated DomaineValeurDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<DomaineValeurDto>> updateDomaineValeur(
            @PathVariable Long id,
            @Valid @RequestBody DomaineValeurRequest request) {
        DomaineValeurDto updatedDomaineValeur = domaineValeurService.updateDomaineValeur(id, request);
        return ResponseEntity.ok(ApiSuccessResponse.of(
                updatedDomaineValeur,
                "Domaine de valeur mis à jour avec succès",
                200
        ));
    }
    
    /**
     * Delete a DomaineValeur
     * @param id the id of the DomaineValeur to delete
     * @return ResponseEntity with ApiSuccessResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<Void>> deleteDomaineValeur(@PathVariable Long id) {
        domaineValeurService.deleteDomaineValeur(id);
        return ResponseEntity.ok(ApiSuccessResponse.of(
                "Domaine de valeur supprimé avec succès",
                200
        ));
    }
}
