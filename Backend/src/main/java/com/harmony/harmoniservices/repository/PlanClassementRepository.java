package com.harmony.harmoniservices.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.harmony.harmoniservices.models.PlanClassement;

@Repository
public interface PlanClassementRepository extends JpaRepository<PlanClassement, Long> {}
