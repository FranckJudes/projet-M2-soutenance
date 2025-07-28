package com.harmony.harmoniservices.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.harmony.harmoniservices.models.TaskConfigurationEntity;

public interface TaskConfigurationRepository extends JpaRepository<TaskConfigurationEntity, Long> {
    
    Optional<TaskConfigurationEntity> findByTaskId(String taskId);
    
    List<TaskConfigurationEntity> findByTaskIdIn(List<String> taskIds);
    
    void deleteByTaskId(String taskId);
} 