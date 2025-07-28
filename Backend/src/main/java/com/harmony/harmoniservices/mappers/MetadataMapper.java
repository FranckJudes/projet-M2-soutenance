package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.MetadataDto;
import com.harmony.harmoniservices.models.Metadata;
import com.harmony.harmoniservices.requests.MetadataRequest;

/**
 * Mapper for Metadata entity
 */
public class MetadataMapper {
    
    /**
     * Convert Metadata entity to MetadataDto
     * @param metadata the entity to convert
     * @return the corresponding DTO
     */
    public static MetadataDto toDto(Metadata metadata) {
        if (metadata == null) {
            return null;
        }
        
        return MetadataDto.builder()
                .id(metadata.getId())
                .nom(metadata.getNom())
                .libelle(metadata.getLibelle())
                .question(metadata.getQuestion())
                .typeChamp(metadata.getTypeChamp())
                .masqueSaisie(metadata.getMasqueSaisie())
                .longeur(metadata.getLongeur())
                .conceptLie(metadata.getConceptLie())
                .domaineValeurLie(metadata.getDomaineValeurLie())
                .valeurDefaut(metadata.getValeurDefaut())
                .formatDate(metadata.getFormatDate())
                .champIncrementiel(metadata.getChampIncrementiel())
                .build();
    }
    
    /**
     * Convert MetadataRequest to Metadata entity
     * @param request the request to convert
     * @return the corresponding entity
     */
    public static Metadata toEntity(MetadataRequest request) {
        if (request == null) {
            return null;
        }
        
        return Metadata.builder()
                .nom(request.getNom())
                .libelle(request.getLibelle())
                .question(request.getQuestion())
                .typeChamp(request.getTypeChamp())
                .masqueSaisie(request.getMasqueSaisie())
                .longeur(request.getLongeur())
                .conceptLie(request.getConceptLie())
                .domaineValeurLie(request.getDomaineValeurLie())
                .valeurDefaut(request.getValeurDefaut())
                .formatDate(request.getFormatDate())
                .champIncrementiel(request.getChampIncrementiel())
                .build();
    }
    
    /**
     * Update Metadata entity with values from MetadataRequest
     * @param metadata the entity to update
     * @param request the request containing the new values
     */
    public static void updateEntityFromRequest(Metadata metadata, MetadataRequest request) {
        if (metadata == null || request == null) {
            return;
        }
        
        metadata.setNom(request.getNom());
        metadata.setLibelle(request.getLibelle());
        metadata.setQuestion(request.getQuestion());
        metadata.setTypeChamp(request.getTypeChamp());
        metadata.setMasqueSaisie(request.getMasqueSaisie());
        metadata.setLongeur(request.getLongeur());
        metadata.setConceptLie(request.getConceptLie());
        metadata.setDomaineValeurLie(request.getDomaineValeurLie());
        metadata.setValeurDefaut(request.getValeurDefaut());
        metadata.setFormatDate(request.getFormatDate());
        metadata.setChampIncrementiel(request.getChampIncrementiel());
    }
}
