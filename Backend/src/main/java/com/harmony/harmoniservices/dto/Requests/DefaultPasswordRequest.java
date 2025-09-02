package com.harmony.harmoniservices.dto.Requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefaultPasswordRequest {
    
    @NotBlank(message = "Le libellé ne peut pas être vide")
    private String libelle;
    
    @NotBlank(message = "La valeur ne peut pas être vide")
    private String valeur;
}
