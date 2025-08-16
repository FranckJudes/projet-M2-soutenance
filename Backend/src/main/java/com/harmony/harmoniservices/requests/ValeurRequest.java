package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request class for Valeur create/update operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValeurRequest {
    
    @NotBlank(message = "Le libellé est obligatoire")
    private String libele;
    
    private String description;
    
    private String code;  // Auto-generated if not provided
    
    private Integer ordre;  // Auto-generated if not provided
    
    @Builder.Default
    private Boolean actif = true;  // Defaults to true if not provided
    
    @NotNull(message = "Le domaine de valeur est obligatoire")
    private Long domaineValeurId;
}
