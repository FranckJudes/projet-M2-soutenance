package com.harmony.harmoniservices.dto;

public class PlanClassementDto {
    private Long id;
    private String codePlanClassement;
    private String libellePlanClassement;
    private String descriptionPlanClassement;
    private Long parentId;
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
