package com.harmony.harmoniservices.models;

import jakarta.persistence.*;

@Entity
@Table(name = "plan_classement")
public class PlanClassement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_plan_classement")
    private String codePlanClassement;

    @Column(name = "libelle_plan_classement")
    private String libellePlanClassement;

    @Column(name = "description_plan_classement")
    private String descriptionPlanClassement;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "numero_ordre")
    private Integer numeroOrdre;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodePlanClassement() {
        return codePlanClassement;
    }

    public void setCodePlanClassement(String codePlanClassement) {
        this.codePlanClassement = codePlanClassement;
    }

    public String getLibellePlanClassement() {
        return libellePlanClassement;
    }

    public void setLibellePlanClassement(String libellePlanClassement) {
        this.libellePlanClassement = libellePlanClassement;
    }

    public String getDescriptionPlanClassement() {
        return descriptionPlanClassement;
    }

    public void setDescriptionPlanClassement(String descriptionPlanClassement) {
        this.descriptionPlanClassement = descriptionPlanClassement;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Integer getNumeroOrdre() {
        return numeroOrdre;
    }

    public void setNumeroOrdre(Integer numeroOrdre) {
        this.numeroOrdre = numeroOrdre;
    }
}
