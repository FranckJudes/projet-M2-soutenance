package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un schéma de fichier dans le système de classification
 */
@Entity
@Table(name = "file_schemes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class FileScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String label;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private FileScheme parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FileScheme> children = new ArrayList<>();

    @Column(name = "color_series", length = 20)
    private String colorSeries = "#3498db";

    @Column(name = "icon_series", length = 50)
    private String iconSeries = "folder";

    @Column(name = "type", length = 10)
    private String type = "1";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id")
    private DocumentType documentType;

    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "workflow_id")
    private Long workflowId;

    @Column(name = "is_directory")
    private Boolean isDirectory = true;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructeurs utilitaires
    public FileScheme(String label, String description) {
        this.label = label;
        this.description = description;
        this.isDirectory = true;
        this.isActive = true;
        this.sortOrder = 0;
        this.colorSeries = "#3498db";
        this.iconSeries = "folder";
        this.type = "1";
    }

    public FileScheme(String label, String description, FileScheme parent) {
        this(label, description);
        this.parent = parent;
    }

    public FileScheme(String label, String description, DocumentType documentType) {
        this.label = label;
        this.description = description;
        this.documentType = documentType;
        this.isDirectory = false;
        this.isActive = true;
        this.sortOrder = 0;
        this.colorSeries = documentType != null ? documentType.getColor() : "#3498db";
        this.iconSeries = documentType != null ? documentType.getIcon() : "file";
        this.type = "1";
    }

    // Méthodes utilitaires
    public boolean isRoot() {
        return parent == null;
    }

    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }

    public void addChild(FileScheme child) {
        if (children == null) {
            children = new ArrayList<>();
        }
        children.add(child);
        child.setParent(this);
    }

    public void removeChild(FileScheme child) {
        if (children != null) {
            children.remove(child);
            child.setParent(null);
        }
    }

    public String getFullPath() {
        if (parent == null) {
            return label;
        }
        return parent.getFullPath() + " / " + label;
    }

    public int getDepth() {
        int depth = 0;
        FileScheme current = this.parent;
        while (current != null) {
            depth++;
            current = current.getParent();
        }
        return depth;
    }

    @Override
    public String toString() {
        return "FileScheme{" +
                "id=" + id +
                ", label='" + label + '\'' +
                ", isDirectory=" + isDirectory +
                ", parentId=" + (parent != null ? parent.getId() : null) +
                '}';
    }
}
