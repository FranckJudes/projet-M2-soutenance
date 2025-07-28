package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for DomaineValeur entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomaineValeurDto {
    
    private Long id;
    private String libele;
    private String description;
    private String type;
}
