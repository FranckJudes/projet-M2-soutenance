package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.TypeEntiteDto;
import com.harmony.harmoniservices.models.TypeEntite;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for TypeEntite entity and DTO
 */
public class TypeEntiteMapper {
    
    /**
     * Convert TypeEntite entity to DTO
     * 
     * @param typeEntite the entity to convert
     * @return the corresponding DTO
     */
    public static TypeEntiteDto toDto(TypeEntite typeEntite) {
        if (typeEntite == null) {
            return null;
        }
        
        return TypeEntiteDto.builder()
                .id(typeEntite.getId())
                .libele(typeEntite.getLibele())
                .description(typeEntite.getDescription())
                .build();
    }
    
    /**
     * Convert TypeEntiteDto to entity
     * 
     * @param typeEntiteDto the DTO to convert
     * @return the corresponding entity
     */
    public static TypeEntite toEntity(TypeEntiteDto typeEntiteDto) {
        if (typeEntiteDto == null) {
            return null;
        }
        
        return TypeEntite.builder()
                .id(typeEntiteDto.getId())
                .libele(typeEntiteDto.getLibele())
                .description(typeEntiteDto.getDescription())
                .build();
    }
    
    /**
     * Update an existing TypeEntite entity with data from a DTO
     * 
     * @param typeEntite the entity to update
     * @param typeEntiteDto the DTO containing the new data
     */
    public static void updateEntityFromDto(TypeEntite typeEntite, TypeEntiteDto typeEntiteDto) {
        if (typeEntite == null || typeEntiteDto == null) {
            return;
        }
        
        typeEntite.setLibele(typeEntiteDto.getLibele());
        typeEntite.setDescription(typeEntiteDto.getDescription());
    }
    
    /**
     * Convert a list of TypeEntite entities to DTOs
     * 
     * @param typeEntites the list of entities to convert
     * @return the list of corresponding DTOs
     */
    public static List<TypeEntiteDto> toDtoList(List<TypeEntite> typeEntites) {
        if (typeEntites == null) {
            return List.of();
        }
        
        return typeEntites.stream()
                .map(TypeEntiteMapper::toDto)
                .collect(Collectors.toList());
    }
}
