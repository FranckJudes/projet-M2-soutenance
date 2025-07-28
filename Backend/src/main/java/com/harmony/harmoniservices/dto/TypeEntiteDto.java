package com.harmony.harmoniservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for TypeEntite entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypeEntiteDto {
    
    private Long id;
    
    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 100, message = "Le libellé ne peut pas dépasser 100 caractères")
    private String libele;
    
    private String description;
}
