package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.ProcessInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ProcessInstanceRepository extends JpaRepository<ProcessInstance, Long> {
    
    Optional<ProcessInstance> findByProcessInstanceId(String processInstanceId);
    
    List<ProcessInstance> findByProcessDefinitionKey(String processDefinitionKey);
    
    List<ProcessInstance> findByStartUserId(String startUserId);
    
    List<ProcessInstance> findByState(ProcessInstance.ProcessInstanceState state);
    
    List<ProcessInstance> findByProcessInstanceIdIn(Set<String> processInstanceIds);
    
    @Query("SELECT pi FROM ProcessInstance pi WHERE pi.state = 'ACTIVE' ORDER BY pi.startTime DESC")
    List<ProcessInstance> findActiveProcesses();
    
    @Query("SELECT pi FROM ProcessInstance pi WHERE pi.processDefinitionKey = :key AND pi.state = 'ACTIVE'")
    List<ProcessInstance> findActiveProcessesByDefinitionKey(@Param("key") String processDefinitionKey);
}
