package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
}