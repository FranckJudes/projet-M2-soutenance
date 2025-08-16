package com.harmony.harmoniservices.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * DTO pour les schémas de fichiers
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileSchemeDto {
    
    private Long id;
    private String label;
    private String description;
    private Long parentId;
    private String parentLabel;
    private List<FileSchemeDto> children = new ArrayList<>();
    private String colorSeries;
    private String iconSeries;
    private String type;
    private DocumentTypeDto documentType;
    private Long planId;
    private Long documentId;
    private Long workflowId;
    private Boolean isDirectory;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer depth;
    private String fullPath;
    private Long childrenCount;
    
    /**
     * Constructeur pour créer un DTO simple sans les enfants
     */
    public FileSchemeDto(Long id, String label, String description, Long parentId, 
                        String colorSeries, String iconSeries, Boolean isDirectory) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.parentId = parentId;
        this.colorSeries = colorSeries;
        this.iconSeries = iconSeries;
        this.isDirectory = isDirectory;
        this.isActive = true;
        this.children = new ArrayList<>();
    }
    
    /**
     * Ajouter un enfant à ce schéma
     */
    public void addChild(FileSchemeDto child) {
        if (this.children == null) {
            this.children = new ArrayList<>();
        }
        this.children.add(child);
        child.setParentId(this.id);
        child.setParentLabel(this.label);
    }
    
    /**
     * Vérifier si ce schéma a des enfants
     */
    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }
    
    /**
     * Vérifier si c'est un schéma racine
     */
    public boolean isRoot() {
        return parentId == null;
    }
    
    /**
     * Calculer la profondeur basée sur le chemin complet
     */
    public void calculateDepth() {
        if (fullPath != null) {
            this.depth = (int) fullPath.chars().filter(ch -> ch == '/').count();
        } else {
            this.depth = 0;
        }
    }
    
    /**
     * Mettre à jour le nombre d'enfants
     */
    public void updateChildrenCount() {
        this.childrenCount = children != null ? (long) children.size() : 0L;
    }
}
