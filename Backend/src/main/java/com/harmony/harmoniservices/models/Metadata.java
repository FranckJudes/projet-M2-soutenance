package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing metadata for form fields
 */
@Entity
@Table(name = "metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Metadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false)
    private String libelle;
    
    @Column
    private String question;
    
    @Column(name = "type_champ", nullable = false)
    private String typeChamp;
    
    @Column(name = "masque_saisie")
    private String masqueSaisie;
    
    @Column
    private Integer longeur;
    
    @Column(name = "concept_lie")
    private String conceptLie;
    
    @Column(name = "domaine_valeur_lie")
    private String domaineValeurLie;
    
    @Column(name = "valeur_defaut")
    private String valeurDefaut;
    
    @Column(name = "format_date")
    private String formatDate;
    
    @Column(name = "champ_incrementiel")
    private String champIncrementiel;
}
