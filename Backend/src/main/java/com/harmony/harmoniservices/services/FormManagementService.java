package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.FormDto;
import com.harmony.harmoniservices.mappers.FormMapper;
import com.harmony.harmoniservices.models.Form;
import com.harmony.harmoniservices.models.Metadata;
import com.harmony.harmoniservices.repository.FormRepository;
import com.harmony.harmoniservices.repository.MetadataRepository;
import com.harmony.harmoniservices.requests.FormRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for Form operations
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FormManagementService {
    
    private final FormRepository formRepository;
    private final MetadataRepository metadataRepository;
    
    /**
     * Get all forms
     * @return list of FormDto
     */
    public List<FormDto> getAllForms() {
        List<Form> forms = formRepository.findAllWithMetadata();
        return FormMapper.toDtoList(forms);
    }
    
    /**
     * Get form by id
     * @param id the form id
     * @return FormDto
     * @throws RuntimeException if form not found
     */
    public FormDto getFormById(Long id) {
        Form form = formRepository.findByIdWithMetadata(id)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé avec l'ID : " + id));
        return FormMapper.toDto(form);
    }
    
    /**
     * Create a new form
     * @param request the FormRequest
     * @return created FormDto
     * @throws RuntimeException if name already exists or metadata not found
     */
    @Transactional
    public FormDto createForm(FormRequest request) {
        // Check if form name already exists
        if (formRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Un formulaire avec ce nom existe déjà : " + request.getNom());
        }
        
        // Validate and get metadata entities
        List<Metadata> metadatas = getMetadatasByIds(request.getMetadataIds());
        
        Form form = FormMapper.toEntity(request, metadatas);
        Form savedForm = formRepository.save(form);
        
        return FormMapper.toDto(savedForm);
    }
    
    /**
     * Update an existing form
     * @param id the form id
     * @param request the FormRequest with updated values
     * @return updated FormDto
     * @throws RuntimeException if form not found, name already exists, or metadata not found
     */
    @Transactional
    public FormDto updateForm(Long id, FormRequest request) {
        Form existingForm = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé avec l'ID : " + id));
        
        // Check if new name already exists (excluding current form)
        if (!existingForm.getNom().equals(request.getNom()) && 
            formRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Un formulaire avec ce nom existe déjà : " + request.getNom());
        }
        
        // Validate and get metadata entities
        List<Metadata> metadatas = getMetadatasByIds(request.getMetadataIds());
        
        FormMapper.updateFromRequest(existingForm, request, metadatas);
        Form updatedForm = formRepository.save(existingForm);
        
        return FormMapper.toDto(updatedForm);
    }
    
    /**
     * Delete a form
     * @param id the form id
     * @throws RuntimeException if form not found
     */
    @Transactional
    public void deleteForm(Long id) {
        if (!formRepository.existsById(id)) {
            throw new RuntimeException("Formulaire non trouvé avec l'ID : " + id);
        }
        formRepository.deleteById(id);
    }
    
    /**
     * Search forms by name
     * @param searchTerm the search term
     * @return list of matching FormDto
     */
    public List<FormDto> searchFormsByName(String searchTerm) {
        List<Form> forms = formRepository.findByNomContainingIgnoreCase(searchTerm);
        return FormMapper.toDtoList(forms);
    }
    
    /**
     * Check if form can be deleted (used for validation)
     * @param id the form id
     * @return true if form can be deleted
     */
    public boolean canDeleteForm(Long id) {
        // Add business logic here if needed (e.g., check if form is used elsewhere)
        return formRepository.existsById(id);
    }
    
    /**
     * Get metadata entities by their IDs
     * @param metadataIds list of metadata IDs
     * @return list of Metadata entities
     * @throws RuntimeException if any metadata is not found
     */
    private List<Metadata> getMetadatasByIds(List<Long> metadataIds) {
        List<Metadata> metadatas = metadataRepository.findAllById(metadataIds);
        
        if (metadatas.size() != metadataIds.size()) {
            throw new RuntimeException("Une ou plusieurs métadonnées n'ont pas été trouvées");
        }
        
        return metadatas;
    }
}
