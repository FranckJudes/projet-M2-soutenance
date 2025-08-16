package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request DTO pour les schémas de fichiers
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileSchemeRequest {

    @NotBlank(message = "Le label du schéma de fichier est obligatoire")
    @Size(min = 1, max = 255, message = "Le label doit contenir entre 1 et 255 caractères")
    private String label;

    @Size(max = 500, message = "La description ne peut dépasser 500 caractères")
    private String description;

    private Long parentId;

    @Size(max = 20, message = "La série de couleurs ne peut dépasser 20 caractères")
    private String colorSeries = "#3498db";

    @Size(max = 50, message = "La série d'icônes ne peut dépasser 50 caractères")
    private String iconSeries = "folder";

    @Size(max = 10, message = "Le type ne peut dépasser 10 caractères")
    private String type = "1";

    private Long documentTypeId;

    private Long planId;

    private Long documentId;

    private Long workflowId;

    private Boolean isDirectory = true;

    private Boolean isActive = true;

    private Integer sortOrder = 0;

    /**
     * Constructeur pour créer une requête simple de dossier
     */
    public FileSchemeRequest(String label, String description) {
        this.label = label;
        this.description = description;
        this.isDirectory = true;
        this.isActive = true;
        this.sortOrder = 0;
        this.colorSeries = "#3498db";
        this.iconSeries = "folder";
        this.type = "1";
    }

    /**
     * Constructeur pour créer une requête de dossier avec parent
     */
    public FileSchemeRequest(String label, String description, Long parentId) {
        this(label, description);
        this.parentId = parentId;
    }

    /**
     * Constructeur pour créer une requête de fichier avec type de document
     */
    public FileSchemeRequest(String label, String description, Long documentTypeId, Long parentId) {
        this.label = label;
        this.description = description;
        this.documentTypeId = documentTypeId;
        this.parentId = parentId;
        this.isDirectory = false;
        this.isActive = true;
        this.sortOrder = 0;
        this.colorSeries = "#3498db";
        this.iconSeries = "file";
        this.type = "1";
    }

    /**
     * Méthode utilitaire pour définir les valeurs par défaut pour un dossier
     */
    public void setAsDirectory() {
        this.isDirectory = true;
        this.iconSeries = "folder";
        this.documentTypeId = null;
    }

    /**
     * Méthode utilitaire pour définir les valeurs par défaut pour un fichier
     */
    public void setAsFile() {
        this.isDirectory = false;
        this.iconSeries = "file";
    }

    /**
     * Validation personnalisée pour s'assurer qu'un fichier a un type de document
     */
    public boolean isValid() {
        // Si c'est un fichier, il doit avoir un type de document
        if (Boolean.FALSE.equals(isDirectory) && documentTypeId == null) {
            return false;
        }
        
        // Si c'est un dossier, il ne doit pas avoir de type de document
        if (Boolean.TRUE.equals(isDirectory) && documentTypeId != null) {
            return false;
        }
        
        return true;
    }

    /**
     * Méthode utilitaire pour obtenir un message d'erreur de validation
     */
    public String getValidationError() {
        if (Boolean.FALSE.equals(isDirectory) && documentTypeId == null) {
            return "Un fichier doit avoir un type de document associé";
        }
        
        if (Boolean.TRUE.equals(isDirectory) && documentTypeId != null) {
            return "Un dossier ne peut pas avoir de type de document associé";
        }
        
        return null;
    }
}
