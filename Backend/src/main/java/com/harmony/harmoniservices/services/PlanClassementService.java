package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.PlanClassement;
import com.harmony.harmoniservices.dto.PlanClassementDto;
import com.harmony.harmoniservices.repository.PlanClassementRepository;
import com.harmony.harmoniservices.mappers.PlanClassementMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PlanClassementService {
    private final PlanClassementRepository repository;
    @Autowired
    private final PlanClassementMapper mapper;

    @Autowired
    public PlanClassementService(PlanClassementRepository repository, PlanClassementMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<PlanClassementDto> getAllPlanClassement() {
        return mapper.toDtoList(repository.findAll());
    }

    public PlanClassementDto createPlanClassement(PlanClassementDto dto) {
        PlanClassement entity = mapper.toEntity(dto);
        PlanClassement savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    public Optional<PlanClassementDto> updatePlanClassement(Long id, PlanClassementDto dto) {
        return repository.findById(id).map(existing -> {
            existing.setCodePlanClassement(dto.getCodePlanClassement());
            existing.setLibellePlanClassement(dto.getLibellePlanClassement());
            existing.setDescriptionPlanClassement(dto.getDescriptionPlanClassement());
            existing.setParentId(dto.getParentId());
            existing.setNumeroOrdre(dto.getNumeroOrdre());
            PlanClassement updatedEntity = repository.save(existing);
            return mapper.toDto(updatedEntity);
        });
    }

    public void deletePlanClassement(Long id) {
        repository.deleteById(id);
    }
}
