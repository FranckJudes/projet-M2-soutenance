package com.harmony.harmoniservices.dto.Requests;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Requête d'inscription d'un nouvel utilisateur")
public class RegisterRequest {
    
    @Schema(
        description = "Adresse email de l'utilisateur",
        example = "jean.dupont@example.com",
        required = true
    )
    private String email;
    
    @Schema(
        description = "Mot de passe de l'utilisateur (minimum 8 caractères, doit contenir des lettres et des chiffres)",
        example = "MonMotDePasse123",
        required = true,
        minLength = 8,
        format = "password"
    )
    private String password;
    
    @Schema(
        description = "Prénom de l'utilisateur",
        example = "Jean",
        required = true
    )
    private String firstName;
    
    @Schema(
        description = "Nom de famille de l'utilisateur",
        example = "Dupont",
        required = true
    )
    private String lastName;
    
    // @Schema(
    //     description = "Rôle de l'utilisateur dans l'application",
    //     example = "USER",
    //     allowableValues = {"USER", "ADMIN", "MODERATOR"},
    //     defaultValue = "USER"
    // )
    private String role;
}
