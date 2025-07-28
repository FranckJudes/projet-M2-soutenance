package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Request class for managing users in an EntiteOrganisation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntiteUserRequest {
    
    @NotNull(message = "La liste des identifiants utilisateurs est obligatoire")
    private Set<Long> userIds;
}
