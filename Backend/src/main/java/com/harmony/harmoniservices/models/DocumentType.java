package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entité pour les types de documents dans le système de classification
 */
@Entity
@Table(name = "document_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Size(max = 20)
    @Column(name = "icon", nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'file'")
    private String icon = "file";

    @Size(max = 7)
    @Column(name = "color", nullable = false, columnDefinition = "VARCHAR(7) DEFAULT '#1890ff'")
    private String color = "#1890ff";

    @Size(max = 10)
    @Column(name = "file_extension")
    private String fileExtension;

    @Size(max = 100)
    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer sortOrder = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Constructeur pour créer un type de document avec les paramètres essentiels
     */
    public DocumentType(String name, String description, String code, String icon, String color) {
        this.name = name;
        this.description = description;
        this.code = code;
        this.icon = icon != null ? icon : "file";
        this.color = color != null ? color : "#1890ff";
        this.isActive = true;
        this.sortOrder = 0;
    }
}
