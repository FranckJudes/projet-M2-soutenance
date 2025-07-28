package com.harmony.harmoniservices.dto.Requests;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Requête d'authentification")
public class AuthRequest {
    
    @Schema(
        description = "Adresse email de l'utilisateur",
        example = "jean.dupont@example.com",
        required = true
    )
    private String email;
    
    @Schema(
        description = "Mot de passe de l'utilisateur",
        example = "MonMotDePasse123",
        required = true,
        format = "password"
    )
    private String password;
}
