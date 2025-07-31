package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.TaskConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskConfigurationRepository extends JpaRepository<TaskConfiguration, Long> {
    
    List<TaskConfiguration> findByProcessDefinitionKey(String processDefinitionKey);
    
    Optional<TaskConfiguration> findByProcessDefinitionKeyAndTaskId(String processDefinitionKey, String taskId);
    
    List<TaskConfiguration> findByTaskType(String taskType);
    
    @Query("SELECT tc FROM TaskConfiguration tc WHERE tc.processDefinitionKey = :processKey AND tc.assigneeUser = :userId")
    List<TaskConfiguration> findByProcessAndAssigneeUser(@Param("processKey") String processDefinitionKey, @Param("userId") String userId);
    
    @Query("SELECT tc FROM TaskConfiguration tc WHERE tc.processDefinitionKey = :processKey AND tc.assigneeGroup = :groupId")
    List<TaskConfiguration> findByProcessAndAssigneeGroup(@Param("processKey") String processDefinitionKey, @Param("groupId") String groupId);
    
    @Query("SELECT tc FROM TaskConfiguration tc WHERE tc.processDefinitionKey = :processKey AND tc.assigneeEntity = :entityId")
    List<TaskConfiguration> findByProcessAndAssigneeEntity(@Param("processKey") String processDefinitionKey, @Param("entityId") String entityId);
}
