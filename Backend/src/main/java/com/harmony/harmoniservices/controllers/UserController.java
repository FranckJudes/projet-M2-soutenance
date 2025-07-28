package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.ApiSuccessResponse;
import com.harmony.harmoniservices.dto.UserDTO;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.mappers.UserMapper;
import com.harmony.harmoniservices.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @GetMapping
    public ResponseEntity<ApiSuccessResponse<List<UserDTO>>> getAllUsers() {
        List<UserEntity> users = userService.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiSuccessResponse.of(userDTOs, "Liste des utilisateurs récupérée avec succès", 200));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<UserDTO>> getUserById(@PathVariable Long id) {
        Optional<UserEntity> user = userService.findById(id);
        if (!user.isPresent()) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        UserDTO userDTO = userMapper.toDto(user.get());
        return ResponseEntity.ok(ApiSuccessResponse.of(userDTO, "Utilisateur trouvé", 200));
    }

    @PostMapping
    public ResponseEntity<ApiSuccessResponse<UserDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
        UserEntity user = userMapper.toEntity(userDTO);
        UserEntity savedUser = userService.save(user);
        UserDTO savedUserDTO = userMapper.toDto(savedUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.of(savedUserDTO, "Utilisateur créé avec succès", 201));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<UserDTO>> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        // S'assurer que l'ID dans le chemin correspond à l'ID dans l'objet user
        if (userDTO.getId() == null) {
            userDTO.setId(id);
        } else if (!userDTO.getId().equals(id)) {
            throw new IllegalArgumentException("L'ID dans le chemin ne correspond pas à l'ID dans l'objet utilisateur");
        }
        
        // Vérifier si l'utilisateur existe
        if (!userService.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        
        UserEntity user = userMapper.toEntity(userDTO);
        UserEntity updatedUser = userService.update(user);
        UserDTO updatedUserDTO = userMapper.toDto(updatedUser);
        return ResponseEntity.ok(ApiSuccessResponse.of(updatedUserDTO, "Utilisateur mis à jour avec succès", 200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiSuccessResponse<Void>> deleteUser(@PathVariable Long id) {
        // Vérifier si l'utilisateur existe
        if (!userService.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        
        userService.deleteById(id);
        return ResponseEntity.ok(ApiSuccessResponse.of("Utilisateur supprimé avec succès", 200));
    }
    
    /**
     * Reset user password
     * @param id the id of the user
     * @return ResponseEntity with ApiSuccessResponse
     */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiSuccessResponse<Void>> resetUserPassword(@PathVariable Long id) {
        // Vérifier si l'utilisateur existe
        if (!userService.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        
        // Here we would implement the actual password reset logic
        // For now, we'll just return a success response
        return ResponseEntity.ok(ApiSuccessResponse.of("Mot de passe réinitialisé avec succès", 200));
    }
}
