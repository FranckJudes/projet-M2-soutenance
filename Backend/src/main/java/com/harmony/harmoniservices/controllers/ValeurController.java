package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.ValeurDto;
import com.harmony.harmoniservices.requests.ValeurRequest;
import com.harmony.harmoniservices.services.ValeurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Valeur operations
 */
@RestController
@RequestMapping("/api/valeurs")
@RequiredArgsConstructor
public class ValeurController {
    
    private final ValeurService valeurService;
    
    /**
     * Get all valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return ResponseEntity with ApiResponse containing list of ValeurDto
     */
    @GetMapping("/domaine/{domaineValeurId}")
    public ResponseEntity<ApiResponse<List<ValeurDto>>> getValeursByDomaineValeurId(@PathVariable Long domaineValeurId) {
        try {
            List<ValeurDto> valeurs = valeurService.getValeursByDomaineValeurId(domaineValeurId);
            return ResponseEntity.ok(ApiResponse.success("Liste des valeurs récupérée avec succès", valeurs));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la récupération des valeurs: " + e.getMessage()));
        }
    }
    
    /**
     * Get all active valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return ResponseEntity with ApiResponse containing list of active ValeurDto
     */
    @GetMapping("/domaine/{domaineValeurId}/active")
    public ResponseEntity<ApiResponse<List<ValeurDto>>> getActiveValeursByDomaineValeurId(@PathVariable Long domaineValeurId) {
        try {
            List<ValeurDto> valeurs = valeurService.getActiveValeursByDomaineValeurId(domaineValeurId);
            return ResponseEntity.ok(ApiResponse.success("Liste des valeurs actives récupérée avec succès", valeurs));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la récupération des valeurs actives: " + e.getMessage()));
        }
    }
    
    /**
     * Get a valeur by id
     * @param id the id of the valeur
     * @return ResponseEntity with ApiResponse containing ValeurDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ValeurDto>> getValeurById(@PathVariable Long id) {
        try {
            ValeurDto valeur = valeurService.getValeurById(id);
            return ResponseEntity.ok(ApiResponse.success("Valeur récupérée avec succès", valeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la récupération de la valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new valeur
     * @param request the ValeurRequest
     * @return ResponseEntity with ApiResponse containing created ValeurDto
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ValeurDto>> createValeur(@Valid @RequestBody ValeurRequest request) {
        try {
            ValeurDto createdValeur = valeurService.createValeur(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Valeur créée avec succès", createdValeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la création de la valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Update a valeur
     * @param id the id of the valeur to update
     * @param request the ValeurRequest with updated values
     * @return ResponseEntity with ApiResponse containing updated ValeurDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ValeurDto>> updateValeur(@PathVariable Long id, @Valid @RequestBody ValeurRequest request) {
        try {
            ValeurDto updatedValeur = valeurService.updateValeur(id, request);
            return ResponseEntity.ok(ApiResponse.success("Valeur mise à jour avec succès", updatedValeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Erreur lors de la mise à jour de la valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a valeur
     * @param id the id of the valeur to delete
     * @return ResponseEntity with ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteValeur(@PathVariable Long id) {
        try {
            valeurService.deleteValeur(id);
            return ResponseEntity.ok(ApiResponse.success("Valeur supprimée avec succès", null));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors de la suppression de la valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Toggle valeur active status
     * @param id the id of the valeur
     * @return ResponseEntity with ApiResponse containing updated ValeurDto
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<ValeurDto>> toggleValeurStatus(@PathVariable Long id) {
        try {
            ValeurDto updatedValeur = valeurService.toggleValeurStatus(id);
            String status = updatedValeur.getActif() ? "activée" : "désactivée";
            return ResponseEntity.ok(ApiResponse.success("Valeur " + status + " avec succès", updatedValeur));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("Erreur lors du changement de statut de la valeur: " + e.getMessage()));
        }
    }
    
    /**
     * Count valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return ResponseEntity with ApiResponse containing count
     */
    @GetMapping("/domaine/{domaineValeurId}/count")
    public ResponseEntity<ApiResponse<Long>> countValeursByDomaineValeurId(@PathVariable Long domaineValeurId) {
        try {
            Long count = valeurService.countValeursByDomaineValeurId(domaineValeurId);
            return ResponseEntity.ok(ApiResponse.success("Nombre de valeurs récupéré avec succès", count));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Erreur lors du comptage des valeurs: " + e.getMessage()));
        }
    }
}
