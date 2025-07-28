package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.EntiteOrganisationDto;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.mappers.EntiteOrganisationMapper;
import com.harmony.harmoniservices.models.EntiteOrganisation;
import com.harmony.harmoniservices.models.TypeEntite;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.EntiteOrganisationRepository;
import com.harmony.harmoniservices.repository.TypeEntiteRepository;
import com.harmony.harmoniservices.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for EntiteOrganisation operations
 */
@Service
public class EntiteOrganisationService {
    
    private final EntiteOrganisationRepository entiteOrganisationRepository;
    private final TypeEntiteRepository typeEntiteRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public EntiteOrganisationService(
            EntiteOrganisationRepository entiteOrganisationRepository,
            TypeEntiteRepository typeEntiteRepository,
            UserRepository userRepository) {
        this.entiteOrganisationRepository = entiteOrganisationRepository;
        this.typeEntiteRepository = typeEntiteRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Get all entities
     * 
     * @return list of all entities as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> getAllEntites() {
        List<EntiteOrganisation> entites = entiteOrganisationRepository.findAll();
        return EntiteOrganisationMapper.toDtoList(entites);
    }
    
    /**
     * Get all active entities
     * 
     * @return list of all active entities as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> getAllActiveEntites() {
        List<EntiteOrganisation> entites = entiteOrganisationRepository.findByActiveTrue();
        return EntiteOrganisationMapper.toDtoList(entites);
    }
    
    /**
     * Get root entities (entities without a parent)
     * 
     * @return list of root entities as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> getRootEntites() {
        List<EntiteOrganisation> rootEntites = entiteOrganisationRepository.findByParentIsNull();
        return EntiteOrganisationMapper.toDtoList(rootEntites);
    }
    
    /**
     * Get child entities for a parent
     * 
     * @param parentId the ID of the parent entity
     * @return list of child entities as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> getChildEntites(Long parentId) {
        List<EntiteOrganisation> childEntites = entiteOrganisationRepository.findByParentId(parentId);
        return EntiteOrganisationMapper.toDtoList(childEntites);
    }
    
    /**
     * Get an entity by ID
     * 
     * @param id the ID of the entity to get
     * @return the entity as a DTO
     * @throws ResourceNotFoundException if the entity is not found
     */
    @Transactional(readOnly = true)
    public EntiteOrganisationDto getEntiteById(Long id) {
        EntiteOrganisation entite = entiteOrganisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EntiteOrganisation not found with id: " + id));
        return EntiteOrganisationMapper.toDto(entite);
    }
    
    /**
     * Get an entity by code
     * 
     * @param code the code of the entity to get
     * @return the entity as a DTO
     * @throws ResourceNotFoundException if the entity is not found
     */
    @Transactional(readOnly = true)
    public EntiteOrganisationDto getEntiteByCode(String code) {
        EntiteOrganisation entite = entiteOrganisationRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("EntiteOrganisation not found with code: " + code));
        return EntiteOrganisationMapper.toDto(entite);
    }
    
    /**
     * Search entities by name
     * 
     * @param name the name to search for
     * @return list of matching entities as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> searchEntitesByName(String name) {
        List<EntiteOrganisation> entites = entiteOrganisationRepository.findByLibeleContainingIgnoreCase(name);
        return EntiteOrganisationMapper.toDtoList(entites);
    }
    
    /**
     * Create a new entity
     * 
     * @param entiteDto the DTO containing the entity data
     * @return the created entity as a DTO
     * @throws ResourceNotFoundException if the parent entity or type entity is not found
     */
    @Transactional
    public EntiteOrganisationDto createEntite(EntiteOrganisationDto entiteDto) {
        EntiteOrganisation entite = EntiteOrganisationMapper.toEntity(entiteDto);
        
        // Set parent if provided
        if (entiteDto.getParentId() != null) {
            EntiteOrganisation parent = entiteOrganisationRepository.findById(entiteDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent entity not found with id: " + entiteDto.getParentId()));
            EntiteOrganisationMapper.setParent(entite, parent);
        }
        
        // Set type entity if provided
        if (entiteDto.getTypeEntityId() != null) {
            TypeEntite typeEntite = typeEntiteRepository.findById(entiteDto.getTypeEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("TypeEntite not found with id: " + entiteDto.getTypeEntityId()));
            EntiteOrganisationMapper.setTypeEntite(entite, typeEntite);
        }
        
        // Set users if provided
        if (entiteDto.getUserIds() != null && !entiteDto.getUserIds().isEmpty()) {
            Set<UserEntity> users = entiteDto.getUserIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId)))
                    .collect(Collectors.toSet());
            EntiteOrganisationMapper.setUsers(entite, users);
        }
        
        entite = entiteOrganisationRepository.save(entite);
        return EntiteOrganisationMapper.toDto(entite);
    }
    
    /**
     * Update an existing entity
     * 
     * @param id the ID of the entity to update
     * @param entiteDto the DTO containing the new entity data
     * @return the updated entity as a DTO
     * @throws ResourceNotFoundException if the entity, parent entity, or type entity is not found
     */
    @Transactional
    public EntiteOrganisationDto updateEntite(Long id, EntiteOrganisationDto entiteDto) {
        EntiteOrganisation entite = entiteOrganisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EntiteOrganisation not found with id: " + id));
        
        EntiteOrganisationMapper.updateEntityFromDto(entite, entiteDto);
        
        // Update parent if provided
        if (entiteDto.getParentId() != null) {
            // Check for circular reference
            if (entiteDto.getParentId().equals(id)) {
                throw new IllegalArgumentException("An entity cannot be its own parent");
            }
            
            EntiteOrganisation parent = entiteOrganisationRepository.findById(entiteDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent entity not found with id: " + entiteDto.getParentId()));
            EntiteOrganisationMapper.setParent(entite, parent);
        } else {
            EntiteOrganisationMapper.setParent(entite, null);
        }
        
        // Update type entity if provided
        if (entiteDto.getTypeEntityId() != null) {
            TypeEntite typeEntite = typeEntiteRepository.findById(entiteDto.getTypeEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("TypeEntite not found with id: " + entiteDto.getTypeEntityId()));
            EntiteOrganisationMapper.setTypeEntite(entite, typeEntite);
        } else {
            EntiteOrganisationMapper.setTypeEntite(entite, null);
        }
        
        // Update users if provided
        if (entiteDto.getUserIds() != null) {
            Set<UserEntity> users = new HashSet<>();
            if (!entiteDto.getUserIds().isEmpty()) {
                users = entiteDto.getUserIds().stream()
                        .map(userId -> userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId)))
                        .collect(Collectors.toSet());
            }
            EntiteOrganisationMapper.setUsers(entite, users);
        }
        
        entite = entiteOrganisationRepository.save(entite);
        return EntiteOrganisationMapper.toDto(entite);
    }
    
    /**
     * Delete an entity
     * 
     * @param id the ID of the entity to delete
     * @throws ResourceNotFoundException if the entity is not found
     */
    @Transactional
    public void deleteEntite(Long id) {
        if (!entiteOrganisationRepository.existsById(id)) {
            throw new ResourceNotFoundException("EntiteOrganisation not found with id: " + id);
        }
        
        // Check if this entity has children
        List<EntiteOrganisation> children = entiteOrganisationRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new IllegalStateException("Cannot delete entity with ID " + id + " because it has child entities");
        }
        
        entiteOrganisationRepository.deleteById(id);
    }
    
    /**
     * Get entities by user ID
     * 
     * @param userId the ID of the user
     * @return list of entities associated with the user as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> getEntitiesByUserId(Long userId) {
        List<EntiteOrganisation> entites = entiteOrganisationRepository.findByUserId(userId);
        return EntiteOrganisationMapper.toDtoList(entites);
    }
    
    /**
     * Get users by entity ID
     * 
     * @param entityId the ID of the entity
     * @return list of users associated with the entity
     * @throws ResourceNotFoundException if the entity is not found
     */
    @Transactional(readOnly = true)
    public Set<UserEntity> getUsersByEntityId(Long entityId) {
        EntiteOrganisation entite = entiteOrganisationRepository.findById(entityId)
                .orElseThrow(() -> new ResourceNotFoundException("EntiteOrganisation not found with id: " + entityId));
        return entite.getUsers();
    }
    
    /**
     * Add a user to an entity
     * 
     * @param entityId the ID of the entity
     * @param userId the ID of the user to add
     * @throws ResourceNotFoundException if the entity or user is not found
     */
    @Transactional
    public void addUserToEntity(Long entityId, Long userId) {
        EntiteOrganisation entite = entiteOrganisationRepository.findById(entityId)
                .orElseThrow(() -> new ResourceNotFoundException("EntiteOrganisation not found with id: " + entityId));
        
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        EntiteOrganisationMapper.addUser(entite, user);
        entiteOrganisationRepository.save(entite);
    }
    
    /**
     * Remove a user from an entity
     * 
     * @param entityId the ID of the entity
     * @param userId the ID of the user to remove
     * @throws ResourceNotFoundException if the entity or user is not found
     */
    @Transactional
    public void removeUserFromEntity(Long entityId, Long userId) {
        EntiteOrganisation entite = entiteOrganisationRepository.findById(entityId)
                .orElseThrow(() -> new ResourceNotFoundException("EntiteOrganisation not found with id: " + entityId));
        
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        EntiteOrganisationMapper.removeUser(entite, user);
        entiteOrganisationRepository.save(entite);
    }
    
    /**
     * Get the complete organizational structure
     * 
     * @return list of root entities with their children as DTOs
     */
    @Transactional(readOnly = true)
    public List<EntiteOrganisationDto> getOrganigramme() {
        List<EntiteOrganisation> rootEntites = entiteOrganisationRepository.findByParentIsNull();
        return EntiteOrganisationMapper.toDtoList(rootEntites);
    }
}
