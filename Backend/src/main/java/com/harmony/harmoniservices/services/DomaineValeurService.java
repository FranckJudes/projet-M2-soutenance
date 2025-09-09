package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.DomaineValeurDto;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.mappers.DomaineValeurMapper;
import com.harmony.harmoniservices.models.DomaineValeur;
import com.harmony.harmoniservices.repository.DomaineValeurRepository;
import com.harmony.harmoniservices.requests.DomaineValeurRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for DomaineValeur operations
 */
@Service
@RequiredArgsConstructor
public class DomaineValeurService {
    
    private final DomaineValeurRepository domaineValeurRepository;
    
    /**
     * Get all DomaineValeur entities
     * @return list of DomaineValeurDto
     */
    @Cacheable(cacheNames = "domaineValeur:all")
    public List<DomaineValeurDto> getAllDomaineValeurs() {
        return domaineValeurRepository.findAll().stream()
                .map(DomaineValeurMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a DomaineValeur by id
     * @param id the id of the DomaineValeur
     * @return the DomaineValeurDto
     * @throws ResourceNotFoundException if the DomaineValeur is not found
     */
    @Cacheable(cacheNames = "domaineValeur:byId", key = "#id")
    public DomaineValeurDto getDomaineValeurById(Long id) {
        DomaineValeur domaineValeur = domaineValeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DomaineValeur", "id", id));
        return DomaineValeurMapper.toDto(domaineValeur);
    }
    
    /**
     * Create a new DomaineValeur
     * @param request the DomaineValeurRequest
     * @return the created DomaineValeurDto
     */
    @Transactional
    @CacheEvict(cacheNames = {"domaineValeur:all", "domaineValeur:byId"}, allEntries = true)
    public DomaineValeurDto createDomaineValeur(DomaineValeurRequest request) {
        DomaineValeur domaineValeur = DomaineValeurMapper.toEntity(request);
        DomaineValeur savedDomaineValeur = domaineValeurRepository.save(domaineValeur);
        return DomaineValeurMapper.toDto(savedDomaineValeur);
    }
    
    /**
     * Update a DomaineValeur
     * @param id the id of the DomaineValeur to update
     * @param request the DomaineValeurRequest with updated values
     * @return the updated DomaineValeurDto
     * @throws ResourceNotFoundException if the DomaineValeur is not found
     */
    @Transactional
    @CacheEvict(cacheNames = {"domaineValeur:all", "domaineValeur:byId"}, allEntries = true)
    public DomaineValeurDto updateDomaineValeur(Long id, DomaineValeurRequest request) {
        DomaineValeur domaineValeur = domaineValeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DomaineValeur", "id", id));
        
        DomaineValeurMapper.updateEntityFromRequest(domaineValeur, request);
        DomaineValeur updatedDomaineValeur = domaineValeurRepository.save(domaineValeur);
        return DomaineValeurMapper.toDto(updatedDomaineValeur);
    }
    
    /**
     * Delete a DomaineValeur
     * @param id the id of the DomaineValeur to delete
     * @throws ResourceNotFoundException if the DomaineValeur is not found
     */
    @Transactional
    @CacheEvict(cacheNames = {"domaineValeur:all", "domaineValeur:byId"}, allEntries = true)
    public void deleteDomaineValeur(Long id) {
        if (!domaineValeurRepository.existsById(id)) {
            throw new ResourceNotFoundException("DomaineValeur", "id", id);
        }
        domaineValeurRepository.deleteById(id);
    }
}
