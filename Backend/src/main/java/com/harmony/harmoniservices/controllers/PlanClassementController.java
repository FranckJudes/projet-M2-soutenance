package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.PlanClassementDto;
import com.harmony.harmoniservices.services.PlanClassementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/plan-classements")
public class PlanClassementController {
    private final PlanClassementService service;

    @Autowired
    public PlanClassementController(PlanClassementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PlanClassementDto>> getAllPlanClassement() {
        return ResponseEntity.ok(service.getAllPlanClassement());
    }

    @PostMapping
    public ResponseEntity<PlanClassementDto> createPlanClassement(@RequestBody PlanClassementDto dto) {
        PlanClassementDto created = service.createPlanClassement(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanClassementDto> updatePlanClassement(@PathVariable Long id, @RequestBody PlanClassementDto dto) {
        Optional<PlanClassementDto> updated = service.updatePlanClassement(id, dto);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanClassement(@PathVariable Long id) {
        service.deletePlanClassement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/children/{parentId}")
    public ResponseEntity<List<PlanClassementDto>> getChildrenByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(service.getChildrenByParentId(parentId));
    }
}
