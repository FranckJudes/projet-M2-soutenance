package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "process_images")
public class ProcessImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_definition_id", nullable = false)
    @JsonBackReference
    private ProcessDefinition processDefinition;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(length = 500)
    private String filePath; // Chemin vers le fichier sur le système de fichiers

    @Lob
    @Column(nullable = true)  // Changé à nullable pour supporter le nouveau système de fichiers
    private byte[] imageData;

    private String description;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }

    // Helper method to get image as base64 (pour la compatibilité avec l'ancien système)
    public String getImageDataAsBase64() {
        if (imageData != null) {
            return java.util.Base64.getEncoder().encodeToString(imageData);
        }
        return null; // Retourner null pour le nouveau système de fichiers
    }
}
