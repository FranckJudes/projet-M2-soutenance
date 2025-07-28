package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Request class for creating or updating an EntiteOrganisation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntiteOrganisationRequest {
    
    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 100, message = "Le libellé ne peut pas dépasser 100 caractères")
    private String libele;
    
    private String description;
    
    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;
    
    private Long parentId;
    
    private Long typeEntityId;
    
    private Boolean active;
    
    private Set<Long> userIds;
}
