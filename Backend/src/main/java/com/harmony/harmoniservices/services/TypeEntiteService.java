package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.TypeEntiteDto;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.mappers.TypeEntiteMapper;
import com.harmony.harmoniservices.models.TypeEntite;
import com.harmony.harmoniservices.repository.TypeEntiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for TypeEntite operations
 */
@Service
public class TypeEntiteService {
    
    private final TypeEntiteRepository typeEntiteRepository;
    
    @Autowired
    public TypeEntiteService(TypeEntiteRepository typeEntiteRepository) {
        this.typeEntiteRepository = typeEntiteRepository;
    }
    
    /**
     * Get all type entities
     * 
     * @return list of all type entities as DTOs
     */
    @Transactional(readOnly = true)
    public List<TypeEntiteDto> getAllTypeEntites() {
        List<TypeEntite> typeEntites = typeEntiteRepository.findAll();
        return TypeEntiteMapper.toDtoList(typeEntites);
    }
    
    /**
     * Get a type entity by ID
     * 
     * @param id the ID of the type entity to get
     * @return the type entity as a DTO
     * @throws ResourceNotFoundException if the type entity is not found
     */
    @Transactional(readOnly = true)
    public TypeEntiteDto getTypeEntiteById(Long id) {
        TypeEntite typeEntite = typeEntiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TypeEntite not found with id: " + id));
        return TypeEntiteMapper.toDto(typeEntite);
    }
    
    /**
     * Create a new type entity
     * 
     * @param typeEntiteDto the DTO containing the type entity data
     * @return the created type entity as a DTO
     */
    @Transactional
    public TypeEntiteDto createTypeEntite(TypeEntiteDto typeEntiteDto) {
        TypeEntite typeEntite = TypeEntiteMapper.toEntity(typeEntiteDto);
        typeEntite = typeEntiteRepository.save(typeEntite);
        return TypeEntiteMapper.toDto(typeEntite);
    }
    
    /**
     * Update an existing type entity
     * 
     * @param id the ID of the type entity to update
     * @param typeEntiteDto the DTO containing the new type entity data
     * @return the updated type entity as a DTO
     * @throws ResourceNotFoundException if the type entity is not found
     */
    @Transactional
    public TypeEntiteDto updateTypeEntite(Long id, TypeEntiteDto typeEntiteDto) {
        TypeEntite typeEntite = typeEntiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TypeEntite not found with id: " + id));
        
        TypeEntiteMapper.updateEntityFromDto(typeEntite, typeEntiteDto);
        typeEntite = typeEntiteRepository.save(typeEntite);
        return TypeEntiteMapper.toDto(typeEntite);
    }
    
    /**
     * Delete a type entity
     * 
     * @param id the ID of the type entity to delete
     * @throws ResourceNotFoundException if the type entity is not found
     */
    @Transactional
    public void deleteTypeEntite(Long id) {
        if (!typeEntiteRepository.existsById(id)) {
            throw new ResourceNotFoundException("TypeEntite not found with id: " + id);
        }
        typeEntiteRepository.deleteById(id);
    }
    
    /**
     * Check if a type entity exists by ID
     * 
     * @param id the ID to check
     * @return true if the type entity exists, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return typeEntiteRepository.existsById(id);
    }
}
