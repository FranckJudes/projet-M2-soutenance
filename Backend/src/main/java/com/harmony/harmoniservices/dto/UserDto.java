package com.harmony.harmoniservices.dto;

import com.harmony.harmoniservices.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for UserEntity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phone;
    private String profilePicture;
    private UserStatus status;
    private String role;
    private String theme;
}
