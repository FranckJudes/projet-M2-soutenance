package com.harmony.harmoniservices.dto;

import com.harmony.harmoniservices.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDTO {
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
