package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.FormDto;
import com.harmony.harmoniservices.dto.MetadataDto;
import com.harmony.harmoniservices.models.Form;
import com.harmony.harmoniservices.models.Metadata;
import com.harmony.harmoniservices.requests.FormRequest;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper class for Form entity conversions
 */
public class FormMapper {
    
    /**
     * Convert Form entity to FormDto
     * @param form the Form entity
     * @return FormDto
     */
    public static FormDto toDto(Form form) {
        if (form == null) {
            return null;
        }
        
        List<MetadataDto> metadataDtos = form.getMetadatas() != null 
            ? form.getMetadatas().stream()
                .map(MetadataMapper::toDto)
                .collect(Collectors.toList())
            : null;
        
        return FormDto.builder()
                .id(form.getId())
                .nom(form.getNom())
                .description(form.getDescription())
                .metadatas(metadataDtos)
                .metadataCount(metadataDtos != null ? metadataDtos.size() : 0)
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert FormRequest to Form entity
     * @param request the FormRequest
     * @param metadatas the list of associated Metadata entities
     * @return Form entity
     */
    public static Form toEntity(FormRequest request, List<Metadata> metadatas) {
        if (request == null) {
            return null;
        }
        
        return Form.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .metadatas(metadatas)
                .build();
    }
    
    /**
     * Update Form entity from FormRequest
     * @param form the existing Form entity
     * @param request the FormRequest with updated values
     * @param metadatas the updated list of associated Metadata entities
     * @return updated Form entity
     */
    public static Form updateFromRequest(Form form, FormRequest request, List<Metadata> metadatas) {
        if (form == null || request == null) {
            return form;
        }
        
        form.setNom(request.getNom());
        form.setDescription(request.getDescription());
        form.setMetadatas(metadatas);
        
        return form;
    }
    
    /**
     * Convert list of Form entities to list of FormDtos
     * @param forms the list of Form entities
     * @return list of FormDtos
     */
    public static List<FormDto> toDtoList(List<Form> forms) {
        if (forms == null) {
            return null;
        }
        
        return forms.stream()
                .map(FormMapper::toDto)
                .collect(Collectors.toList());
    }
}
