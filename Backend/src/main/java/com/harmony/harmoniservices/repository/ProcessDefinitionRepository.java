package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.ProcessDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessDefinitionRepository extends JpaRepository<ProcessDefinition, Long> {
    
    Optional<ProcessDefinition> findByProcessDefinitionKey(String processDefinitionKey);
    
    Optional<ProcessDefinition> findByProcessDefinitionId(String processDefinitionId);
    
    List<ProcessDefinition> findByActiveTrue();
    
    @Query("SELECT pd FROM ProcessDefinition pd WHERE pd.processDefinitionKey = :key ORDER BY pd.version DESC")
    List<ProcessDefinition> findByProcessDefinitionKeyOrderByVersionDesc(@Param("key") String processDefinitionKey);
    
    @Query("SELECT pd FROM ProcessDefinition pd WHERE pd.processDefinitionKey = :key AND pd.active = true ORDER BY pd.version DESC")
    Optional<ProcessDefinition> findLatestActiveByProcessDefinitionKey(@Param("key") String processDefinitionKey);
}
