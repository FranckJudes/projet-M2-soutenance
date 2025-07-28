package com.harmony.harmoniservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * DTO for EntiteOrganisation entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntiteOrganisationDto {
    
    private Long id;
    
    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 100, message = "Le libellé ne peut pas dépasser 100 caractères")
    private String libele;
    
    private String description;
    
    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;
    
    private Long parentId;
    
    private String parentLibele;
    
    private Long typeEntityId;
    
    private String typeEntityLibele;
    
    private Boolean active;
    
    private Set<Long> userIds;
}
