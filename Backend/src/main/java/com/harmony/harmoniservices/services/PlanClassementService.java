package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.PlanClassement;
import com.harmony.harmoniservices.dto.PlanClassementDto;
import com.harmony.harmoniservices.repository.PlanClassementRepository;
import com.harmony.harmoniservices.mappers.PlanClassementMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Cacheable(cacheNames = "planClassement:tree")
    public List<PlanClassementDto> getAllPlanClassement() {
        List<PlanClassement> allEntities = repository.findAll();
        
        // Filtrer pour ne récupérer que les éléments racines (parentId = null)
        List<PlanClassement> rootEntities = allEntities.stream()
                .filter(entity -> entity.getParentId() == null)
                .collect(Collectors.toList());
        
        // Convertir en DTO avec les enfants
        return rootEntities.stream()
                .map(entity -> {
                    PlanClassementDto dto = mapper.toDto(entity);
                    dto.setChildren(findChildrenRecursively(entity.getId(), allEntities));
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    private List<PlanClassementDto> findChildrenRecursively(Long parentId, List<PlanClassement> allEntities) {
        return allEntities.stream()
                .filter(entity -> parentId.equals(entity.getParentId()))
                .map(entity -> {
                    PlanClassementDto dto = mapper.toDto(entity);
                    dto.setChildren(findChildrenRecursively(entity.getId(), allEntities));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @CacheEvict(cacheNames = {"planClassement:tree", "planClassement:childrenByParent"}, allEntries = true)
    public PlanClassementDto createPlanClassement(PlanClassementDto dto) {
        PlanClassement entity = mapper.toEntity(dto);
        PlanClassement savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    @CacheEvict(cacheNames = {"planClassement:tree", "planClassement:childrenByParent"}, allEntries = true)
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

    @CacheEvict(cacheNames = {"planClassement:tree", "planClassement:childrenByParent"}, allEntries = true)
    public void deletePlanClassement(Long id) {
        repository.deleteById(id);
    }

    @Cacheable(cacheNames = "planClassement:childrenByParent", key = "#parentId")
    public List<PlanClassementDto> getChildrenByParentId(Long parentId) {
        return repository.findByParentId(parentId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}
