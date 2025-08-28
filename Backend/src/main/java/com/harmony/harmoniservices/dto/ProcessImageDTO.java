package com.harmony.harmoniservices.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessImageDTO {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String description;
    private Integer displayOrder;
    private LocalDateTime uploadedAt;
    private String filePath; // Chemin vers l'image sur le système de fichiers
    private String imageData; // Gardé pour la compatibilité mais peut être nul avec le nouveau système
}
