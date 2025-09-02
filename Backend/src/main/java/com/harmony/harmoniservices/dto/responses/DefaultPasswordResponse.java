package com.harmony.harmoniservices.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefaultPasswordResponse {
    private Long id;
    private String libelle;
    private String valeur;
    private LocalDateTime dateCreation;
    private boolean active;
}
