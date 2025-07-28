package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.DomaineValeurDto;
import com.harmony.harmoniservices.models.DomaineValeur;
import com.harmony.harmoniservices.requests.DomaineValeurRequest;

/**
 * Mapper for DomaineValeur entity
 */
public class DomaineValeurMapper {
    
    /**
     * Convert DomaineValeur entity to DomaineValeurDto
     * @param domaineValeur the entity to convert
     * @return the corresponding DTO
     */
    public static DomaineValeurDto toDto(DomaineValeur domaineValeur) {
        if (domaineValeur == null) {
            return null;
        }
        
        return DomaineValeurDto.builder()
                .id(domaineValeur.getId())
                .libele(domaineValeur.getLibele())
                .description(domaineValeur.getDescription())
                .type(domaineValeur.getType())
                .build();
    }
    
    /**
     * Convert DomaineValeurRequest to DomaineValeur entity
     * @param request the request to convert
     * @return the corresponding entity
     */
    public static DomaineValeur toEntity(DomaineValeurRequest request) {
        if (request == null) {
            return null;
        }
        
        return DomaineValeur.builder()
                .libele(request.getLibele())
                .description(request.getDescription())
                .type(request.getType())
                .build();
    }
    
    /**
     * Update DomaineValeur entity with values from DomaineValeurRequest
     * @param domaineValeur the entity to update
     * @param request the request containing the new values
     */
    public static void updateEntityFromRequest(DomaineValeur domaineValeur, DomaineValeurRequest request) {
        if (domaineValeur == null || request == null) {
            return;
        }
        
        domaineValeur.setLibele(request.getLibele());
        domaineValeur.setDescription(request.getDescription());
        domaineValeur.setType(request.getType());
    }
}
