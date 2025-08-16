package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Valeur entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValeurDto {
    
    private Long id;
    private String libele;
    private String description;
    private String code;
    private Integer ordre;
    private Boolean actif;
    private Long domaineValeurId;
    private String domaineValeurLibele;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
