package com.harmony.harmoniservices.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour les types de documents
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeDto {
    
    private Long id;
    private String name;
    private String description;
    private String code;
    private String icon;
    private String color;
    private String fileExtension;
    private String mimeType;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Constructeur pour créer un DTO avec les informations essentielles
     */
    public DocumentTypeDto(Long id, String name, String description, String code, 
                          String icon, String color, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.code = code;
        this.icon = icon;
        this.color = color;
        this.isActive = isActive;
    }
}
