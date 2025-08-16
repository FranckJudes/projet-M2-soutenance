package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.ValeurDto;
import com.harmony.harmoniservices.models.DomaineValeur;
import com.harmony.harmoniservices.models.Valeur;
import com.harmony.harmoniservices.requests.ValeurRequest;

/**
 * Mapper for Valeur entity
 */
public class ValeurMapper {
    
    /**
     * Convert Valeur entity to ValeurDto
     * @param valeur the entity to convert
     * @return the corresponding DTO
     */
    public static ValeurDto toDto(Valeur valeur) {
        if (valeur == null) {
            return null;
        }
        
        return ValeurDto.builder()
                .id(valeur.getId())
                .libele(valeur.getLibele())
                .description(valeur.getDescription())
                .code(valeur.getCode())
                .ordre(valeur.getOrdre())
                .actif(valeur.getActif())
                .domaineValeurId(valeur.getDomaineValeur() != null ? valeur.getDomaineValeur().getId() : null)
                .domaineValeurLibele(valeur.getDomaineValeur() != null ? valeur.getDomaineValeur().getLibele() : null)
                .createdAt(valeur.getCreatedAt())
                .updatedAt(valeur.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert ValeurRequest to Valeur entity
     * @param request the request to convert
     * @param domaineValeur the domain valeur to associate
     * @return the corresponding entity
     */
    public static Valeur toEntity(ValeurRequest request, DomaineValeur domaineValeur) {
        if (request == null) {
            return null;
        }
        
        return Valeur.builder()
                .libele(request.getLibele())
                .description(request.getDescription())
                .code(request.getCode())
                .ordre(request.getOrdre())
                .actif(request.getActif() != null ? request.getActif() : true)
                .domaineValeur(domaineValeur)
                .build();
    }
    
    /**
     * Update Valeur entity with values from ValeurRequest
     * @param valeur the entity to update
     * @param request the request containing the new values
     */
    public static void updateEntityFromRequest(Valeur valeur, ValeurRequest request) {
        if (valeur == null || request == null) {
            return;
        }
        
        valeur.setLibele(request.getLibele());
        valeur.setDescription(request.getDescription());
        valeur.setCode(request.getCode());
        valeur.setOrdre(request.getOrdre());
        valeur.setActif(request.getActif() != null ? request.getActif() : true);
    }
}
