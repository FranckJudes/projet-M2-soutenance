package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "default_passwords")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefaultPassword {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "libelle", nullable = false)
    private String libelle;
    
    @Column(name = "valeur", nullable = false)
    private String valeur;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "active")
    private boolean active;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
