package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeUtilisateurDTO {
    private Long id;
    private String libeleGroupeUtilisateur;
    private String descriptionGroupeUtilisateur;
    private String type;
}
