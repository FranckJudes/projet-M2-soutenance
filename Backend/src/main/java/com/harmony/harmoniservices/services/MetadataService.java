package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.MetadataDto;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.mappers.MetadataMapper;
import com.harmony.harmoniservices.models.Metadata;
import com.harmony.harmoniservices.repository.MetadataRepository;
import com.harmony.harmoniservices.requests.MetadataRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Metadata operations
 */
@Service
@RequiredArgsConstructor
public class MetadataService {
    
    private final MetadataRepository metadataRepository;
    
    /**
     * Get all Metadata entities
     * @return list of MetadataDto
     */
    public List<MetadataDto> getAllMetadata() {
        return metadataRepository.findAll().stream()
                .map(MetadataMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a Metadata by id
     * @param id the id of the Metadata
     * @return the MetadataDto
     * @throws ResourceNotFoundException if the Metadata is not found
     */
    public MetadataDto getMetadataById(Long id) {
        Metadata metadata = metadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Metadata", "id", id));
        return MetadataMapper.toDto(metadata);
    }
    
    /**
     * Create a new Metadata
     * @param request the MetadataRequest
     * @return the created MetadataDto
     */
    @Transactional
    public MetadataDto createMetadata(MetadataRequest request) {
        Metadata metadata = MetadataMapper.toEntity(request);
        Metadata savedMetadata = metadataRepository.save(metadata);
        return MetadataMapper.toDto(savedMetadata);
    }
    
    /**
     * Update a Metadata
     * @param id the id of the Metadata to update
     * @param request the MetadataRequest with updated values
     * @return the updated MetadataDto
     * @throws ResourceNotFoundException if the Metadata is not found
     */
    @Transactional
    public MetadataDto updateMetadata(Long id, MetadataRequest request) {
        Metadata metadata = metadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Metadata", "id", id));
        
        MetadataMapper.updateEntityFromRequest(metadata, request);
        Metadata updatedMetadata = metadataRepository.save(metadata);
        return MetadataMapper.toDto(updatedMetadata);
    }
    
    /**
     * Delete a Metadata
     * @param id the id of the Metadata to delete
     * @throws ResourceNotFoundException if the Metadata is not found
     */
    @Transactional
    public void deleteMetadata(Long id) {
        if (!metadataRepository.existsById(id)) {
            throw new ResourceNotFoundException("Metadata", "id", id);
        }
        metadataRepository.deleteById(id);
    }
}
