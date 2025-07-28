package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.UserDTO;
import com.harmony.harmoniservices.models.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserEntity toEntity(UserDTO userDto) {
        if (userDto == null) {
            return null;
        }
        return UserEntity.builder()
                .id(userDto.getId())
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .phone(userDto.getPhone())
                .profilePicture(userDto.getProfilePicture())
                .status(userDto.getStatus())
                .role(userDto.getRole())
                .theme(userDto.getTheme())
                .createdAt(userDto.getCreatedAt())
                .updatedAt(userDto.getUpdatedAt())
                .build();
    }

    public UserDTO toDto(UserEntity userEntity) {
        if (userEntity == null) {
            return null;
        }
        return UserDTO.builder()
                .id(userEntity.getId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .username(userEntity.getUsername())
                .email(userEntity.getEmail())
                .phone(userEntity.getPhone())
                .profilePicture(userEntity.getProfilePicture())
                .status(userEntity.getStatus())
                .role(userEntity.getRole())
                .theme(userEntity.getTheme())
                .createdAt(userEntity.getCreatedAt())
                .updatedAt(userEntity.getUpdatedAt())
                .build();
    }
}