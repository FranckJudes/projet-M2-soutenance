package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request class for Metadata create/update operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetadataRequest {
    
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;
    
    private String question;
    
    @NotBlank(message = "Le type de champ est obligatoire")
    private String typeChamp;
    
    private String masqueSaisie;
    
    private Integer longeur;
    
    private String conceptLie;
    
    private String domaineValeurLie;
    
    private String valeurDefaut;
    
    private String formatDate;
    
    private String champIncrementiel;
}
