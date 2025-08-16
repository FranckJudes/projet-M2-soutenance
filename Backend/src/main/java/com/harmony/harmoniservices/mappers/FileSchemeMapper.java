package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.FileSchemeDto;
import com.harmony.harmoniservices.models.FileScheme;
import com.harmony.harmoniservices.requests.FileSchemeRequest;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour convertir entre FileScheme entité, DTO et Request
 */
public class FileSchemeMapper {

    /**
     * Convertir une entité FileScheme en DTO
     * @param fileScheme l'entité à convertir
     * @return le DTO correspondant
     */
    public static FileSchemeDto toDto(FileScheme fileScheme) {
        if (fileScheme == null) {
            return null;
        }

        FileSchemeDto dto = new FileSchemeDto();
        dto.setId(fileScheme.getId());
        dto.setLabel(fileScheme.getLabel());
        dto.setDescription(fileScheme.getDescription());
        dto.setParentId(fileScheme.getParent() != null ? fileScheme.getParent().getId() : null);
        dto.setParentLabel(fileScheme.getParent() != null ? fileScheme.getParent().getLabel() : null);
        dto.setColorSeries(fileScheme.getColorSeries());
        dto.setIconSeries(fileScheme.getIconSeries());
        dto.setType(fileScheme.getType());
        dto.setDocumentType(fileScheme.getDocumentType() != null ? 
            DocumentTypeMapper.toSimpleDto(fileScheme.getDocumentType()) : null);
        dto.setPlanId(fileScheme.getPlanId());
        dto.setDocumentId(fileScheme.getDocumentId());
        dto.setWorkflowId(fileScheme.getWorkflowId());
        dto.setIsDirectory(fileScheme.getIsDirectory());
        dto.setIsActive(fileScheme.getIsActive());
        dto.setSortOrder(fileScheme.getSortOrder());
        dto.setCreatedAt(fileScheme.getCreatedAt());
        dto.setUpdatedAt(fileScheme.getUpdatedAt());
        dto.setFullPath(fileScheme.getFullPath());
        dto.setDepth(fileScheme.getDepth());
        
        // Convertir les enfants (sans récursion profonde pour éviter les cycles)
        if (fileScheme.getChildren() != null && !fileScheme.getChildren().isEmpty()) {
            List<FileSchemeDto> childrenDtos = fileScheme.getChildren().stream()
                    .map(FileSchemeMapper::toSimpleDto)
                    .collect(Collectors.toList());
            dto.setChildren(childrenDtos);
            dto.setChildrenCount((long) childrenDtos.size());
        } else {
            dto.setChildrenCount(0L);
        }

        return dto;
    }

    /**
     * Convertir une entité FileScheme en DTO simple (sans enfants pour éviter la récursion)
     * @param fileScheme l'entité à convertir
     * @return le DTO simple correspondant
     */
    public static FileSchemeDto toSimpleDto(FileScheme fileScheme) {
        if (fileScheme == null) {
            return null;
        }

        FileSchemeDto dto = new FileSchemeDto();
        dto.setId(fileScheme.getId());
        dto.setLabel(fileScheme.getLabel());
        dto.setDescription(fileScheme.getDescription());
        dto.setParentId(fileScheme.getParent() != null ? fileScheme.getParent().getId() : null);
        dto.setParentLabel(fileScheme.getParent() != null ? fileScheme.getParent().getLabel() : null);
        dto.setColorSeries(fileScheme.getColorSeries());
        dto.setIconSeries(fileScheme.getIconSeries());
        dto.setType(fileScheme.getType());
        dto.setDocumentType(fileScheme.getDocumentType() != null ? 
            DocumentTypeMapper.toSimpleDto(fileScheme.getDocumentType()) : null);
        dto.setPlanId(fileScheme.getPlanId());
        dto.setDocumentId(fileScheme.getDocumentId());
        dto.setWorkflowId(fileScheme.getWorkflowId());
        dto.setIsDirectory(fileScheme.getIsDirectory());
        dto.setIsActive(fileScheme.getIsActive());
        dto.setSortOrder(fileScheme.getSortOrder());
        dto.setCreatedAt(fileScheme.getCreatedAt());
        dto.setUpdatedAt(fileScheme.getUpdatedAt());
        dto.setFullPath(fileScheme.getFullPath());
        dto.setDepth(fileScheme.getDepth());
        dto.setChildrenCount(fileScheme.hasChildren() ? (long) fileScheme.getChildren().size() : 0L);

        return dto;
    }

    /**
     * Convertir une liste d'entités FileScheme en liste de DTOs
     * @param fileSchemes la liste d'entités à convertir
     * @return la liste de DTOs correspondante
     */
    public static List<FileSchemeDto> toDtoList(List<FileScheme> fileSchemes) {
        if (fileSchemes == null) {
            return null;
        }
        return fileSchemes.stream()
                .map(FileSchemeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convertir une liste d'entités en DTOs simples
     * @param fileSchemes la liste d'entités
     * @return la liste de DTOs simples
     */
    public static List<FileSchemeDto> toSimpleDtoList(List<FileScheme> fileSchemes) {
        if (fileSchemes == null) {
            return null;
        }
        return fileSchemes.stream()
                .map(FileSchemeMapper::toSimpleDto)
                .collect(Collectors.toList());
    }

    /**
     * Convertir une requête FileSchemeRequest en entité FileScheme
     * @param request la requête à convertir
     * @return l'entité correspondante
     */
    public static FileScheme toEntity(FileSchemeRequest request) {
        if (request == null) {
            return null;
        }

        FileScheme fileScheme = new FileScheme();
        fileScheme.setLabel(request.getLabel());
        fileScheme.setDescription(request.getDescription());
        fileScheme.setColorSeries(request.getColorSeries() != null ? request.getColorSeries() : "#3498db");
        fileScheme.setIconSeries(request.getIconSeries() != null ? request.getIconSeries() : 
            (Boolean.TRUE.equals(request.getIsDirectory()) ? "folder" : "file"));
        fileScheme.setType(request.getType() != null ? request.getType() : "1");
        fileScheme.setPlanId(request.getPlanId());
        fileScheme.setDocumentId(request.getDocumentId());
        fileScheme.setWorkflowId(request.getWorkflowId());
        fileScheme.setIsDirectory(request.getIsDirectory() != null ? request.getIsDirectory() : true);
        fileScheme.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        fileScheme.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        // Note: parent et documentType sont définis séparément dans le service avec les entités récupérées

        return fileScheme;
    }

    /**
     * Mettre à jour une entité FileScheme existante avec les données d'une requête
     * @param existingFileScheme l'entité existante à mettre à jour
     * @param request la requête contenant les nouvelles données
     */
    public static void updateFromRequest(FileScheme existingFileScheme, FileSchemeRequest request) {
        if (existingFileScheme == null || request == null) {
            return;
        }

        existingFileScheme.setLabel(request.getLabel());
        existingFileScheme.setDescription(request.getDescription());
        existingFileScheme.setColorSeries(request.getColorSeries() != null ? request.getColorSeries() : "#3498db");
        existingFileScheme.setIconSeries(request.getIconSeries() != null ? request.getIconSeries() : 
            (Boolean.TRUE.equals(request.getIsDirectory()) ? "folder" : "file"));
        existingFileScheme.setType(request.getType() != null ? request.getType() : "1");
        existingFileScheme.setPlanId(request.getPlanId());
        existingFileScheme.setDocumentId(request.getDocumentId());
        existingFileScheme.setWorkflowId(request.getWorkflowId());
        existingFileScheme.setIsDirectory(request.getIsDirectory() != null ? request.getIsDirectory() : true);
        existingFileScheme.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        existingFileScheme.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        // Note: parent et documentType sont gérés séparément dans le service
    }

    /**
     * Convertir une entité FileScheme en structure arborescente DTO
     * @param fileScheme l'entité racine
     * @return le DTO avec tous les enfants récursivement
     */
    public static FileSchemeDto toTreeDto(FileScheme fileScheme) {
        if (fileScheme == null) {
            return null;
        }

        FileSchemeDto dto = toSimpleDto(fileScheme);
        
        // Convertir récursivement tous les enfants
        if (fileScheme.getChildren() != null && !fileScheme.getChildren().isEmpty()) {
            List<FileSchemeDto> childrenDtos = fileScheme.getChildren().stream()
                    .map(FileSchemeMapper::toTreeDto)
                    .collect(Collectors.toList());
            dto.setChildren(childrenDtos);
            dto.setChildrenCount((long) childrenDtos.size());
        }

        return dto;
    }

    /**
     * Convertir une liste d'entités racines en structure arborescente
     * @param rootSchemes la liste des schémas racines
     * @return la liste de DTOs arborescents
     */
    public static List<FileSchemeDto> toTreeDtoList(List<FileScheme> rootSchemes) {
        if (rootSchemes == null) {
            return null;
        }
        return rootSchemes.stream()
                .map(FileSchemeMapper::toTreeDto)
                .collect(Collectors.toList());
    }
}
