package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.ValeurDto;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.mappers.ValeurMapper;
import com.harmony.harmoniservices.models.DomaineValeur;
import com.harmony.harmoniservices.models.Valeur;
import com.harmony.harmoniservices.repository.DomaineValeurRepository;
import com.harmony.harmoniservices.repository.ValeurRepository;
import com.harmony.harmoniservices.requests.ValeurRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Valeur operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ValeurService {
    
    private final ValeurRepository valeurRepository;
    private final DomaineValeurRepository domaineValeurRepository;
    
    /**
     * Get all valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return list of ValeurDto
     */
    public List<ValeurDto> getValeursByDomaineValeurId(Long domaineValeurId) {
        if (!domaineValeurRepository.existsById(domaineValeurId)) {
            throw new ResourceNotFoundException("DomaineValeur", "id", domaineValeurId);
        }
        
        return valeurRepository.findByDomaineValeurIdOrderByOrdreAsc(domaineValeurId)
                .stream()
                .map(ValeurMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all active valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return list of active ValeurDto
     */
    public List<ValeurDto> getActiveValeursByDomaineValeurId(Long domaineValeurId) {
        if (!domaineValeurRepository.existsById(domaineValeurId)) {
            throw new ResourceNotFoundException("DomaineValeur", "id", domaineValeurId);
        }
        
        return valeurRepository.findByDomaineValeurIdAndActifTrueOrderByOrdreAsc(domaineValeurId)
                .stream()
                .map(ValeurMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a valeur by id
     * @param id the id of the valeur
     * @return the ValeurDto
     * @throws ResourceNotFoundException if the valeur is not found
     */
    public ValeurDto getValeurById(Long id) {
        Valeur valeur = valeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Valeur", "id", id));
        return ValeurMapper.toDto(valeur);
    }
    
    /**
     * Create a new valeur
     * @param request the ValeurRequest
     * @return the created ValeurDto
     * @throws ResourceNotFoundException if the domaine valeur is not found
     * @throws RuntimeException if the code already exists
     */
    public ValeurDto createValeur(ValeurRequest request) {
        // Check if domaineValeur exists
        DomaineValeur domaineValeur = domaineValeurRepository.findById(request.getDomaineValeurId())
                .orElseThrow(() -> new RuntimeException("Domaine de valeur non trouvé avec l'ID : " + request.getDomaineValeurId()));

        // Auto-generate code if not provided
        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateCodeFromLibele(request.getLibele());
        }
        
        // Ensure code uniqueness for this domaine
        code = ensureUniqueCode(code, request.getDomaineValeurId());
        request.setCode(code);
        
        // Auto-generate ordre if not provided
        if (request.getOrdre() == null) {
            Integer maxOrdre = valeurRepository.findMaxOrdreByDomaineValeurId(request.getDomaineValeurId());
            request.setOrdre(maxOrdre != null ? maxOrdre + 1 : 1);
        }

        Valeur valeur = ValeurMapper.toEntity(request, domaineValeur);
        Valeur savedValeur = valeurRepository.save(valeur);
        return ValeurMapper.toDto(savedValeur);
    }
    
    /**
     * Update a valeur
     * @param id the id of the valeur to update
     * @param request the ValeurRequest with updated values
     * @return the updated ValeurDto
     * @throws ResourceNotFoundException if the valeur is not found
     * @throws RuntimeException if the code already exists for another valeur
     */
    public ValeurDto updateValeur(Long id, ValeurRequest request) {
        Valeur valeur = valeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Valeur", "id", id));
        
        // Check if code already exists for another valeur in this domaine
        if (valeurRepository.existsByCodeAndDomaineValeurIdAndIdNot(request.getCode(), valeur.getDomaineValeur().getId(), id)) {
            throw new RuntimeException("Une valeur avec ce code existe déjà pour ce domaine");
        }
        
        ValeurMapper.updateEntityFromRequest(valeur, request);
        Valeur updatedValeur = valeurRepository.save(valeur);
        return ValeurMapper.toDto(updatedValeur);
    }
    
    /**
     * Delete a valeur
     * @param id the id of the valeur to delete
     * @throws ResourceNotFoundException if the valeur is not found
     */
    public void deleteValeur(Long id) {
        if (!valeurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Valeur", "id", id);
        }
        valeurRepository.deleteById(id);
    }
    
    /**
     * Delete all valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     */
    public void deleteAllValeursByDomaineValeurId(Long domaineValeurId) {
        valeurRepository.deleteByDomaineValeurId(domaineValeurId);
    }
    
    /**
     * Count valeurs by domaine valeur id
     * @param domaineValeurId the domaine valeur id
     * @return count of valeurs
     */
    public Long countValeursByDomaineValeurId(Long domaineValeurId) {
        return valeurRepository.countByDomaineValeurId(domaineValeurId);
    }
    
    /**
     * Toggle valeur active status
     * @param id the id of the valeur
     * @return the updated ValeurDto
     */
    public ValeurDto toggleValeurStatus(Long id) {
        Valeur valeur = valeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Valeur", "id", id));
        
        valeur.setActif(!valeur.getActif());
        Valeur updatedValeur = valeurRepository.save(valeur);
        return ValeurMapper.toDto(updatedValeur);
    }
    
    /**
     * Generate a code from the libele by removing spaces, accents and converting to uppercase
     * @param libele The libele to convert
     * @return The generated code
     */
    private String generateCodeFromLibele(String libele) {
        if (libele == null || libele.trim().isEmpty()) {
            return "VAL";
        }
        
        return libele.trim()
                .toUpperCase()
                .replaceAll("[àáâãäå]", "A")
                .replaceAll("[èéêë]", "E")
                .replaceAll("[ìíîï]", "I")
                .replaceAll("[òóôõö]", "O")
                .replaceAll("[ùúûü]", "U")
                .replaceAll("[ç]", "C")
                .replaceAll("[^A-Z0-9]", "_")
                .replaceAll("_{2,}", "_")
                .replaceAll("^_|_$", "")
                .substring(0, Math.min(libele.length(), 20));
    }
    
    /**
     * Ensure code uniqueness by appending a number if necessary
     * @param baseCode The base code
     * @param domaineValeurId The domaine valeur id
     * @return A unique code
     */
    private String ensureUniqueCode(String baseCode, Long domaineValeurId) {
        String uniqueCode = baseCode;
        int counter = 1;
        
        while (valeurRepository.existsByCodeAndDomaineValeurId(uniqueCode, domaineValeurId)) {
            uniqueCode = baseCode + "_" + counter;
            counter++;
        }
        
        return uniqueCode;
    }
}
