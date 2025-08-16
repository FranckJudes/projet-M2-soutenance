package com.harmony.harmoniservices.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request DTO pour les types de documents
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeRequest {

    @NotBlank(message = "Le nom du type de document est obligatoire")
    @Size(min = 1, max = 100, message = "Le nom doit contenir entre 1 et 100 caractères")
    private String name;

    @Size(max = 255, message = "La description ne peut dépasser 255 caractères")
    private String description;

    @NotBlank(message = "Le code du type de document est obligatoire")
    @Size(min = 1, max = 50, message = "Le code doit contenir entre 1 et 50 caractères")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Le code ne peut contenir que des lettres majuscules, chiffres et underscores")
    private String code;

    @Size(max = 20, message = "L'icône ne peut dépasser 20 caractères")
    private String icon = "file";

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "La couleur doit être au format hexadécimal (#RRGGBB)")
    private String color = "#1890ff";

    @Size(max = 10, message = "L'extension de fichier ne peut dépasser 10 caractères")
    private String fileExtension;

    @Size(max = 100, message = "Le type MIME ne peut dépasser 100 caractères")
    private String mimeType;

    private Boolean isActive = true;

    private Integer sortOrder = 0;

    /**
     * Constructeur pour créer une requête avec les informations essentielles
     */
    public DocumentTypeRequest(String name, String description, String code) {
        this.name = name;
        this.description = description;
        this.code = code;
        this.icon = "file";
        this.color = "#1890ff";
        this.isActive = true;
        this.sortOrder = 0;
    }

    /**
     * Méthode utilitaire pour normaliser le code (toujours en majuscules)
     */
    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase() : null;
    }
}
