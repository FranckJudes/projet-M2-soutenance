package com.harmony.harmoniservices.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity pour les configurations des tâches BPMN
 */
@Entity
@Table(name = "task_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class TaskConfigurationEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Référence à la tâche BPMN
    @Column(name = "task_id", nullable = false)
    private String taskId;
    
    // Paramètres d'habilitation
    @ElementCollection
    @CollectionTable(name = "task_required_roles", joinColumns = @JoinColumn(name = "task_configuration_id"))
    @Column(name = "role")
    private List<String> requiredRoles;
    
    @ManyToMany
    @JoinTable(
        name = "task_authorized_groups", 
        joinColumns = @JoinColumn(name = "task_configuration_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private List<GroupeEntity> authorizedGroups;
    
    @Column(name = "need_supervisor_validation")
    private Boolean needSupervisorValidation;
    
    // Paramètres de planification
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "max_duration_minutes")
    private Integer maxDurationInMinutes;
    
    @Column(name = "cron_expression")
    private String cronExpression;
    
    @Column(name = "is_recurring")
    private Boolean isRecurring;
    
    // Paramètres de ressources
    @Column(name = "min_required_resources")
    private Integer minRequiredResources;
    
    @Column(name = "max_required_resources")
    private Integer maxRequiredResources;
    
    @ElementCollection
    @CollectionTable(name = "task_required_skills", joinColumns = @JoinColumn(name = "task_configuration_id"))
    @Column(name = "skill")
    private List<String> requiredSkills;
    
    @Column(name = "priority")
    private Integer priority;
    
    // Paramètres de notification
    @Column(name = "send_notification_on_start")
    private Boolean sendNotificationOnStart;
    
    @Column(name = "send_notification_on_completion")
    private Boolean sendNotificationOnCompletion;
    
    @Column(name = "send_notification_on_delay")
    private Boolean sendNotificationOnDelay;
    
    @ElementCollection
    @CollectionTable(name = "task_notification_recipients", joinColumns = @JoinColumn(name = "task_configuration_id"))
    @Column(name = "recipient")
    private List<String> notificationRecipients;
    
    @Column(name = "notification_template")
    private String notificationTemplate;
    
    // Statut d'exécution
    @Column(name = "execution_status")
    private String executionStatus;
    
    // Données d'exécution
    @Column(name = "last_execution_date")
    private LocalDateTime lastExecutionDate;
    
    @Column(name = "last_execution_result")
    private String lastExecutionResult;
    
    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private UserEntity assignedUser;
    
    // Métadonnées
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
} 