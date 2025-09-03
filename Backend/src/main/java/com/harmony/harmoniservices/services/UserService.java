package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.enums.UserStatus;
import com.harmony.harmoniservices.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for managing users.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    /**
     * Constructor for UserService.
     * 
     * @param userRepository the user repository
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Finds all users.
     * 
     * @return a list of all users
     */
    public List<UserEntity> findAll() {
        return userRepository.findAll();
    }

    /**
     * Finds a user by ID.
     * 
     * @param id the ID of the user to find
     * @return an optional containing the user if found, or an empty optional if not found
     */
    public Optional<UserEntity> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Saves a user.
     * 
     * @param user the user to save
     * @return the saved user
     */
    public UserEntity save(UserEntity user) {
        return userRepository.save(user);
    }

    /**
     * Deletes a user by ID.
     * 
     * @param id the ID of the user to delete
     */
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Checks if a user exists by ID.
     * 
     * @param id the ID of the user to check
     * @return true if the user exists, false otherwise
     */
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    /**
     * Updates a user.
     * 
     * @param user the user to update
     * @return the updated user
     */
    public UserEntity update(UserEntity user) {
        return userRepository.save(user);
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur.
     * 
     * @param userId l'ID de l'utilisateur
     * @param newPassword le nouveau mot de passe
     * @return l'utilisateur mis à jour
     */
    public UserEntity resetPassword(Long userId, String newPassword) {
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            user.setPassword(newPassword);
            return userRepository.save(user);
        }
        throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
    }

    /**
     * Désactive un compte utilisateur.
     * 
     * @param userId l'ID de l'utilisateur
     * @return l'utilisateur désactivé
     */
    public UserEntity deactivateUser(Long userId) {
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            user.setStatus(UserStatus.INACTIVE);
            return userRepository.save(user);
        }
        throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
    }

    /**
     * Active un compte utilisateur.
     * 
     * @param userId l'ID de l'utilisateur
     * @return l'utilisateur activé
     */
    public UserEntity activateUser(Long userId) {
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            user.setStatus(UserStatus.ACTIVE);
            return userRepository.save(user);
        }
        throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
    }

    /**
     * Sauvegarde une photo de profil.
     * 
     * @param file le fichier de la photo de profil
     * @return le chemin de la photo sauvegardée
     */
    public String saveProfilePicture(MultipartFile file) {
        try {
            // Créer le répertoire s'il n'existe pas
            String uploadDir = "uploads/profile-pictures/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Générer un nom unique pour le fichier
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Sauvegarder le fichier
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            return uploadDir + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde de la photo de profil: " + e.getMessage());
        }
    }
}