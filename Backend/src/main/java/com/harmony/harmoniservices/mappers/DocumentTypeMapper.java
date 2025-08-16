package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.DocumentTypeDto;
import com.harmony.harmoniservices.models.DocumentType;
import com.harmony.harmoniservices.requests.DocumentTypeRequest;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour convertir entre DocumentType entité, DTO et Request
 */
public class DocumentTypeMapper {

    /**
     * Convertir une entité DocumentType en DTO
     * @param documentType l'entité à convertir
     * @return le DTO correspondant
     */
    public static DocumentTypeDto toDto(DocumentType documentType) {
        if (documentType == null) {
            return null;
        }

        DocumentTypeDto dto = new DocumentTypeDto();
        dto.setId(documentType.getId());
        dto.setName(documentType.getName());
        dto.setDescription(documentType.getDescription());
        dto.setCode(documentType.getCode());
        dto.setIcon(documentType.getIcon());
        dto.setColor(documentType.getColor());
        dto.setFileExtension(documentType.getFileExtension());
        dto.setMimeType(documentType.getMimeType());
        dto.setIsActive(documentType.getIsActive());
        dto.setSortOrder(documentType.getSortOrder());
        dto.setCreatedAt(documentType.getCreatedAt());
        dto.setUpdatedAt(documentType.getUpdatedAt());

        return dto;
    }

    /**
     * Convertir une liste d'entités DocumentType en liste de DTOs
     * @param documentTypes la liste d'entités à convertir
     * @return la liste de DTOs correspondante
     */
    public static List<DocumentTypeDto> toDtoList(List<DocumentType> documentTypes) {
        if (documentTypes == null) {
            return null;
        }
        return documentTypes.stream()
                .map(DocumentTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convertir une requête DocumentTypeRequest en entité DocumentType
     * @param request la requête à convertir
     * @return l'entité correspondante
     */
    public static DocumentType toEntity(DocumentTypeRequest request) {
        if (request == null) {
            return null;
        }

        DocumentType documentType = new DocumentType();
        documentType.setName(request.getName());
        documentType.setDescription(request.getDescription());
        documentType.setCode(request.getCode() != null ? request.getCode().toUpperCase() : null);
        documentType.setIcon(request.getIcon() != null ? request.getIcon() : "file");
        documentType.setColor(request.getColor() != null ? request.getColor() : "#1890ff");
        documentType.setFileExtension(request.getFileExtension());
        documentType.setMimeType(request.getMimeType());
        documentType.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        documentType.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return documentType;
    }

    /**
     * Mettre à jour une entité DocumentType existante avec les données d'une requête
     * @param existingDocumentType l'entité existante à mettre à jour
     * @param request la requête contenant les nouvelles données
     */
    public static void updateFromRequest(DocumentType existingDocumentType, DocumentTypeRequest request) {
        if (existingDocumentType == null || request == null) {
            return;
        }

        existingDocumentType.setName(request.getName());
        existingDocumentType.setDescription(request.getDescription());
        existingDocumentType.setCode(request.getCode() != null ? request.getCode().toUpperCase() : null);
        existingDocumentType.setIcon(request.getIcon() != null ? request.getIcon() : "file");
        existingDocumentType.setColor(request.getColor() != null ? request.getColor() : "#1890ff");
        existingDocumentType.setFileExtension(request.getFileExtension());
        existingDocumentType.setMimeType(request.getMimeType());
        existingDocumentType.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        existingDocumentType.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
    }

    /**
     * Créer un DTO simplifié pour les sélections (sans toutes les informations de date)
     * @param documentType l'entité à convertir
     * @return un DTO simplifié
     */
    public static DocumentTypeDto toSimpleDto(DocumentType documentType) {
        if (documentType == null) {
            return null;
        }

        return new DocumentTypeDto(
                documentType.getId(),
                documentType.getName(),
                documentType.getDescription(),
                documentType.getCode(),
                documentType.getIcon(),
                documentType.getColor(),
                documentType.getIsActive()
        );
    }

    /**
     * Convertir une liste d'entités en DTOs simplifiés
     * @param documentTypes la liste d'entités
     * @return la liste de DTOs simplifiés
     */
    public static List<DocumentTypeDto> toSimpleDtoList(List<DocumentType> documentTypes) {
        if (documentTypes == null) {
            return null;
        }
        return documentTypes.stream()
                .map(DocumentTypeMapper::toSimpleDto)
                .collect(Collectors.toList());
    }
}
