package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request class for Form create/update operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormRequest {
    
    @NotBlank(message = "Le nom du formulaire est obligatoire")
    private String nom;
    
    private String description;
    
    @NotEmpty(message = "Le formulaire doit contenir au moins une métadonnée")
    private List<Long> metadataIds;
}
