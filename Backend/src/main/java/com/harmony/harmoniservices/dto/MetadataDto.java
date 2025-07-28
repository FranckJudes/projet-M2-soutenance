package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Metadata entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetadataDto {
    
    private Long id;
    private String nom;
    private String libelle;
    private String question;
    private String typeChamp;
    private String masqueSaisie;
    private Integer longeur;
    private String conceptLie;
    private String domaineValeurLie;
    private String valeurDefaut;
    private String formatDate;
    private String champIncrementiel;
}
