package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Form entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormDto {
    
    private Long id;
    private String nom;
    private String description;
    private List<MetadataDto> metadatas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for display purposes
    private Integer metadataCount;
}
