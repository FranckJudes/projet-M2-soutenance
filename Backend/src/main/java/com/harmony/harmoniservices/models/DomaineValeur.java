package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a domain of values
 */
@Entity
@Table(name = "domaine_valeur")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomaineValeur {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String libele;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String type;
}
