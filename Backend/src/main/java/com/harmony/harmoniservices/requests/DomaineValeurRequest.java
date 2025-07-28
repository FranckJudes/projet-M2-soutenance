package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request class for DomaineValeur create/update operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomaineValeurRequest {
    
    @NotBlank(message = "Le libellé est obligatoire")
    private String libele;
    
    private String description;
    
    @NotBlank(message = "Le type est obligatoire")
    private String type;
}
