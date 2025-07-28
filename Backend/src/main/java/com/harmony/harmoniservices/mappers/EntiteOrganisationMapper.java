package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.EntiteOrganisationDto;
import com.harmony.harmoniservices.models.EntiteOrganisation;
import com.harmony.harmoniservices.models.TypeEntite;
import com.harmony.harmoniservices.models.UserEntity;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper for EntiteOrganisation entity and DTO
 */
public class EntiteOrganisationMapper {
    
    /**
     * Convert EntiteOrganisation entity to DTO
     * 
     * @param entite the entity to convert
     * @return the corresponding DTO
     */
    public static EntiteOrganisationDto toDto(EntiteOrganisation entite) {
        if (entite == null) {
            return null;
        }
        
        EntiteOrganisationDto dto = EntiteOrganisationDto.builder()
                .id(entite.getId())
                .libele(entite.getLibele())
                .description(entite.getDescription())
                .code(entite.getCode())
                .active(entite.getActive())
                .build();
        
        if (entite.getParent() != null) {
            dto.setParentId(entite.getParent().getId());
            dto.setParentLibele(entite.getParent().getLibele());
        }
        
        if (entite.getTypeEntite() != null) {
            dto.setTypeEntityId(entite.getTypeEntite().getId());
            dto.setTypeEntityLibele(entite.getTypeEntite().getLibele());
        }
        
        if (entite.getUsers() != null && !entite.getUsers().isEmpty()) {
            dto.setUserIds(entite.getUsers().stream()
                    .map(UserEntity::getId)
                    .collect(Collectors.toSet()));
        }
        
        return dto;
    }
    
    /**
     * Convert EntiteOrganisationDto to entity
     * This method creates a new entity without relationships.
     * Relationships should be set separately.
     * 
     * @param dto the DTO to convert
     * @return the corresponding entity
     */
    public static EntiteOrganisation toEntity(EntiteOrganisationDto dto) {
        if (dto == null) {
            return null;
        }
        
        return EntiteOrganisation.builder()
                .id(dto.getId())
                .libele(dto.getLibele())
                .description(dto.getDescription())
                .code(dto.getCode())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }
    
    /**
     * Update an existing EntiteOrganisation entity with data from a DTO
     * This method updates only the basic fields, not the relationships.
     * 
     * @param entite the entity to update
     * @param dto the DTO containing the new data
     */
    public static void updateEntityFromDto(EntiteOrganisation entite, EntiteOrganisationDto dto) {
        if (entite == null || dto == null) {
            return;
        }
        
        entite.setLibele(dto.getLibele());
        entite.setDescription(dto.getDescription());
        entite.setCode(dto.getCode());
        
        if (dto.getActive() != null) {
            entite.setActive(dto.getActive());
        }
    }
    
    /**
     * Set the parent relationship in an EntiteOrganisation entity
     * 
     * @param entite the entity to update
     * @param parent the parent entity to set
     */
    public static void setParent(EntiteOrganisation entite, EntiteOrganisation parent) {
        if (entite != null) {
            entite.setParent(parent);
        }
    }
    
    /**
     * Set the type entity relationship in an EntiteOrganisation entity
     * 
     * @param entite the entity to update
     * @param typeEntite the type entity to set
     */
    public static void setTypeEntite(EntiteOrganisation entite, TypeEntite typeEntite) {
        if (entite != null) {
            entite.setTypeEntite(typeEntite);
        }
    }
    
    /**
     * Set the users relationship in an EntiteOrganisation entity
     * 
     * @param entite the entity to update
     * @param users the set of users to set
     */
    public static void setUsers(EntiteOrganisation entite, Set<UserEntity> users) {
        if (entite != null) {
            entite.setUsers(users != null ? users : new HashSet<>());
        }
    }
    
    /**
     * Add a user to an EntiteOrganisation entity
     * 
     * @param entite the entity to update
     * @param user the user to add
     */
    public static void addUser(EntiteOrganisation entite, UserEntity user) {
        if (entite != null && user != null) {
            if (entite.getUsers() == null) {
                entite.setUsers(new HashSet<>());
            }
            entite.getUsers().add(user);
        }
    }
    
    /**
     * Remove a user from an EntiteOrganisation entity
     * 
     * @param entite the entity to update
     * @param user the user to remove
     */
    public static void removeUser(EntiteOrganisation entite, UserEntity user) {
        if (entite != null && user != null && entite.getUsers() != null) {
            entite.getUsers().remove(user);
        }
    }
    
    /**
     * Convert a list of EntiteOrganisation entities to DTOs
     * 
     * @param entites the list of entities to convert
     * @return the list of corresponding DTOs
     */
    public static List<EntiteOrganisationDto> toDtoList(List<EntiteOrganisation> entites) {
        if (entites == null) {
            return List.of();
        }
        
        return entites.stream()
                .map(EntiteOrganisationMapper::toDto)
                .collect(Collectors.toList());
    }
}
