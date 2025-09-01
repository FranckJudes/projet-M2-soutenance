package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.PlanClassementDto;
import com.harmony.harmoniservices.models.PlanClassement;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PlanClassementMapper {
    public PlanClassementDto toDto(PlanClassement entity) {
        PlanClassementDto dto = new PlanClassementDto();
        dto.setId(entity.getId());
        dto.setCodePlanClassement(entity.getCodePlanClassement());
        dto.setLibellePlanClassement(entity.getLibellePlanClassement());
        dto.setDescriptionPlanClassement(entity.getDescriptionPlanClassement());
        dto.setParentId(entity.getParentId());
        dto.setNumeroOrdre(entity.getNumeroOrdre());
        return dto;
    }

    public PlanClassement toEntity(PlanClassementDto dto) {
        PlanClassement entity = new PlanClassement();
        entity.setId(dto.getId());
        entity.setCodePlanClassement(dto.getCodePlanClassement());
        entity.setLibellePlanClassement(dto.getLibellePlanClassement());
        entity.setDescriptionPlanClassement(dto.getDescriptionPlanClassement());
        entity.setParentId(dto.getParentId());
        entity.setNumeroOrdre(dto.getNumeroOrdre());
        return entity;
    }

    public List<PlanClassementDto> toDtoList(List<PlanClassement> entities) {
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PlanClassement> toEntityList(List<PlanClassementDto> dtos) {
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
