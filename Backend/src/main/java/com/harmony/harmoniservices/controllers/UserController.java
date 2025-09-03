package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.ApiSuccessResponse;
import com.harmony.harmoniservices.dto.UserDTO;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.mappers.UserMapper;
import com.harmony.harmoniservices.services.UserService;
import com.harmony.harmoniservices.services.DefaultPasswordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final DefaultPasswordService defaultPasswordService;

    public UserController(UserService userService, UserMapper userMapper, DefaultPasswordService defaultPasswordService) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.defaultPasswordService = defaultPasswordService;
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
        
        // Si aucun mot de passe n'est fourni, utiliser le mot de passe par défaut
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            String defaultPassword = defaultPasswordService.getActiveDefaultPassword().getValeur();
            user.setPassword(defaultPassword);
        }
        
        // Gérer le rôle vide
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER"); // Rôle par défaut
        }
        
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
     * Créer un utilisateur avec photo de profil
     * @param userDTO les données de l'utilisateur
     * @param profilePicture la photo de profil (optionnelle)
     * @return ResponseEntity with ApiSuccessResponse
     */
    @PostMapping("/with-profile-picture")
    public ResponseEntity<ApiSuccessResponse<UserDTO>> createUserWithProfilePicture(
            @Valid @RequestPart("user") UserDTO userDTO,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {
        
        UserEntity user = userMapper.toEntity(userDTO);
        
        // Si aucun mot de passe n'est fourni, utiliser le mot de passe par défaut
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            String defaultPassword = defaultPasswordService.getActiveDefaultPassword().getValeur();
            user.setPassword(defaultPassword);
        }
        
        // Gérer le rôle vide
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        }
        
        // Gérer la photo de profil
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String profilePicturePath = userService.saveProfilePicture(profilePicture);
            user.setProfilePicture(profilePicturePath);
        }
        
        UserEntity savedUser = userService.save(user);
        UserDTO savedUserDTO = userMapper.toDto(savedUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.of(savedUserDTO, "Utilisateur créé avec succès avec photo de profil", 201));
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
        
        // Réinitialiser avec le mot de passe par défaut actif
        String defaultPassword = defaultPasswordService.getActiveDefaultPassword().getValeur();
        userService.resetPassword(id, defaultPassword);
        
        return ResponseEntity.ok(ApiSuccessResponse.of("Mot de passe réinitialisé avec succès", 200));
    }

    /**
     * Désactiver un compte utilisateur
     * @param id the id of the user
     * @return ResponseEntity with ApiSuccessResponse
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiSuccessResponse<UserDTO>> deactivateUser(@PathVariable Long id) {
        // Vérifier si l'utilisateur existe
        if (!userService.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        
        UserEntity deactivatedUser = userService.deactivateUser(id);
        UserDTO userDTO = userMapper.toDto(deactivatedUser);
        
        return ResponseEntity.ok(ApiSuccessResponse.of(userDTO, "Compte utilisateur désactivé avec succès", 200));
    }

    /**
     * Activer un compte utilisateur
     * @param id the id of the user
     * @return ResponseEntity with ApiSuccessResponse
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiSuccessResponse<UserDTO>> activateUser(@PathVariable Long id) {
        // Vérifier si l'utilisateur existe
        if (!userService.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        
        UserEntity activatedUser = userService.activateUser(id);
        UserDTO userDTO = userMapper.toDto(activatedUser);
        
        return ResponseEntity.ok(ApiSuccessResponse.of(userDTO, "Compte utilisateur activé avec succès", 200));
    }
}
