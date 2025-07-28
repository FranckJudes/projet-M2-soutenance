package com.harmony.harmoniservices.requests;

import com.harmony.harmoniservices.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request class for User create/update operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    
    private String firstName;
    
    private String lastName;
    
    private String username;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    private String phone;
    
    private String password;
    
    private String profilePicture;
    
    private UserStatus status;
    
    private String role;
    
    private String theme;
}
