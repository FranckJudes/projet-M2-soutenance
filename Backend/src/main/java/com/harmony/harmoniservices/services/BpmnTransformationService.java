package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.TaskConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.bpmn.instance.Process;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BpmnTransformationService {

    private final CamundaIdentityService camundaIdentityService;

    /**
     * Transforms all tasks in a BPMN model to userTasks and applies configurations
     */
    public String transformBpmnWithConfigurations(String bpmnXml, List<TaskConfiguration> configurations) {
        try {
            BpmnModelInstance modelInstance = Bpmn.readModelFromStream(new ByteArrayInputStream(bpmnXml.getBytes()));
            
            // Get all processes in the model
            Collection<Process> processes = modelInstance.getModelElementsByType(Process.class);
            
            for (Process process : processes) {
                // Set process as executable to ensure Camunda deploys it
                process.setExecutable(true);
                
                // Set History Time To Live (required by Camunda)
                // Using deprecated helper which handles namespace correctly
                process.setCamundaHistoryTimeToLive(30);
                
                transformTasksInProcess(modelInstance, process, configurations);
                fixSubProcesses(modelInstance, process);
                fixExclusiveGateways(modelInstance, process);
            }
            
            // Convert back to XML
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Bpmn.writeModelToStream(outputStream, modelInstance);
            return outputStream.toString();
            
        } catch (Exception e) {
            throw new RuntimeException("Error transforming BPMN with configurations", e);
        }
    }

    private void transformTasksInProcess(BpmnModelInstance modelInstance, Process process, List<TaskConfiguration> configurations) {
        // Get all tasks in the process
        Collection<Task> tasks = process.getChildElementsByType(Task.class);
        
        for (Task task : tasks) {
            // Find configuration for this task
            TaskConfiguration config = findConfigurationForTask(task.getId(), configurations);
            
            if (config != null) {
                // Transform to UserTask if not already
                if (!(task instanceof UserTask)) {
                    UserTask userTask = transformToUserTask(modelInstance, task);
                    applyConfigurationToUserTask(userTask, config);
                } else {
                    applyConfigurationToUserTask((UserTask) task, config);
                }
            }
        }
    }

    private TaskConfiguration findConfigurationForTask(String taskId, List<TaskConfiguration> configurations) {
        return configurations.stream()
                .filter(config -> taskId.equals(config.getTaskId()))
                .findFirst()
                .orElse(null);
    }

    private UserTask transformToUserTask(BpmnModelInstance modelInstance, Task originalTask) {
        // Create new UserTask
        UserTask userTask = modelInstance.newInstance(UserTask.class);
        
        // Copy basic properties
        userTask.setId(originalTask.getId());
        userTask.setName(originalTask.getName());
        
        // Copy incoming and outgoing flows
        userTask.getIncoming().addAll(originalTask.getIncoming());
        userTask.getOutgoing().addAll(originalTask.getOutgoing());
        
        // Replace the original task with the user task
        originalTask.getParentElement().replaceChildElement(originalTask, userTask);
        
        return userTask;
    }

    private void applyConfigurationToUserTask(UserTask userTask, TaskConfiguration config) {
        log.info("Application de la configuration à la tâche: {} avec config: {}", userTask.getId(), config);
        
        // Gestion de l'assignation flexible selon le type
        String assigneeType = config.getAssigneeType();
        log.info("Type d'assignation détecté: {}", assigneeType);
        
        if ("user".equals(assigneeType) && config.getAssigneeUser() != null) {
            // Assignation utilisateur
            String camundaUserId = camundaIdentityService.getCamundaId(config.getAssigneeUser());
            if (camundaUserId == null) {
                log.error("ERREUR: Mapping Camunda manquant pour l'utilisateur {}. Synchronisation requise.", config.getAssigneeUser());
                throw new RuntimeException("Mapping Camunda manquant pour l'utilisateur: " + config.getAssigneeUser());
            }
            userTask.setCamundaAssignee(camundaUserId);
            log.info("Assignation utilisateur: {} -> {}", config.getAssigneeUser(), camundaUserId);
            
        } else if ("group".equals(assigneeType) && config.getAssigneeGroup() != null) {
            // Assignation groupe
            String camundaGroupId = camundaIdentityService.getCamundaId(config.getAssigneeGroup());
            if (camundaGroupId == null) {
                log.error("ERREUR: Mapping Camunda manquant pour le groupe {}. Synchronisation requise.", config.getAssigneeGroup());
                throw new RuntimeException("Mapping Camunda manquant pour le groupe: " + config.getAssigneeGroup());
            }
            userTask.setCamundaCandidateGroups(camundaGroupId);
            log.info("Assignation groupe: {} -> {}", config.getAssigneeGroup(), camundaGroupId);
            
        } else if ("entity".equals(assigneeType) && config.getAssigneeEntity() != null) {
            // Assignation entité (traitée comme un groupe spécial)
            String camundaEntityId = camundaIdentityService.getCamundaId(config.getAssigneeEntity());
            if (camundaEntityId == null) {
                log.error("ERREUR: Mapping Camunda manquant pour l'entité {}. Synchronisation requise.", config.getAssigneeEntity());
                throw new RuntimeException("Mapping Camunda manquant pour l'entité: " + config.getAssigneeEntity());
            }
            userTask.setCamundaCandidateGroups(camundaEntityId);
            log.info("Assignation entité: {} -> {}", config.getAssigneeEntity(), camundaEntityId);
            
        } else {
            // Assignation par défaut ou multiple
            boolean hasAssignment = false;
            
            // Assignation utilisateur (priorité la plus haute)
            if (config.getAssigneeUser() != null) {
                String camundaUserId = camundaIdentityService.getCamundaId(config.getAssigneeUser());
                if (camundaUserId != null) {
                    userTask.setCamundaAssignee(camundaUserId);
                    log.info("Assignation utilisateur par défaut: {} -> {}", config.getAssigneeUser(), camundaUserId);
                    hasAssignment = true;
                }
            }
            
            // Assignation groupe (si pas d'utilisateur)
            if (!hasAssignment && config.getAssigneeGroup() != null) {
                String camundaGroupId = camundaIdentityService.getCamundaId(config.getAssigneeGroup());
                if (camundaGroupId != null) {
                    userTask.setCamundaCandidateGroups(camundaGroupId);
                    log.info("Assignation groupe par défaut: {} -> {}", config.getAssigneeGroup(), camundaGroupId);
                    hasAssignment = true;
                }
            }
            
            // Assignation entité (si pas d'utilisateur ni groupe)
            if (!hasAssignment && config.getAssigneeEntity() != null) {
                String camundaEntityId = camundaIdentityService.getCamundaId(config.getAssigneeEntity());
                if (camundaEntityId != null) {
                    userTask.setCamundaCandidateGroups(camundaEntityId);
                    log.info("Assignation entité par défaut: {} -> {}", config.getAssigneeEntity(), camundaEntityId);
                    hasAssignment = true;
                }
            }
            
            if (!hasAssignment) {
                log.warn("Aucune assignation valide trouvée pour la tâche {}", userTask.getId());
            }
        }
        
        // Set task name if configured
        if (config.getTaskName() != null) {
            userTask.setName(config.getTaskName());
        }
        
        // Set priority if configured
        if (config.getPriority() != null) {
            userTask.setCamundaPriority(config.getPriority());
        }
        
        // Set due date based on duration if configured
        if (config.getDurationValue() != null && config.getDurationUnit() != null) {
            String dueDate = "${now().plusDays(" + convertDurationToDays(config.getDurationValue(), config.getDurationUnit()) + ")}";
            userTask.setCamundaDueDate(dueDate);
        }
        
        // Add form key if needed
        if (config.getAddFormResource() != null && config.getAddFormResource()) {
            userTask.setCamundaFormKey("embedded:app:forms/" + config.getTaskId() + ".html");
        }
    }
    
    /**
     * Fix subprocesses that don't have a startEvent for a top-level process
     */
    private void fixSubProcesses(BpmnModelInstance modelInstance, Process process) {
        handleSubProcesses(modelInstance, process);
    }

    /**
     * Fix subprocesses that don't have a startEvent for a nested subprocess
     */
    private void fixSubProcesses(BpmnModelInstance modelInstance, SubProcess parentSubProcess) {
        handleSubProcesses(modelInstance, parentSubProcess);
    }

    /**
     * Shared logic for fixing subprocesses
     */
    private void handleSubProcesses(BpmnModelInstance modelInstance, ModelElementInstance container) {
        Collection<SubProcess> subProcesses = ((ModelElementInstance) container).getChildElementsByType(SubProcess.class);
        
        for (SubProcess subProcess : subProcesses) {
            // Check if the subprocess has a startEvent
            Collection<StartEvent> startEvents = subProcess.getChildElementsByType(StartEvent.class);
            
            if (startEvents.isEmpty()) {
                // Create a new startEvent
                StartEvent startEvent = modelInstance.newInstance(StartEvent.class);
                startEvent.setId("StartEvent_" + subProcess.getId());
                startEvent.setName("Start");
                
                // Add the startEvent to the subprocess
                subProcess.addChildElement(startEvent);
                
                // Find the first element in the subprocess to connect to
                FlowNode firstNode = findFirstFlowNodeInSubProcess(subProcess);
                
                if (firstNode != null) {
                    // Create a sequence flow from startEvent to the first node
                    SequenceFlow flow = modelInstance.newInstance(SequenceFlow.class);
                    flow.setId("Flow_" + startEvent.getId() + "_to_" + firstNode.getId());
                    flow.setSource(startEvent);
                    flow.setTarget(firstNode);
                    
                    // Add the sequence flow to the subprocess
                    subProcess.addChildElement(flow);
                }
            }
            
            // Recursively fix nested subprocesses
            handleSubProcesses(modelInstance, subProcess);
        }
    }
    
    /**
     * Find the first flow node in a subprocess that doesn't have incoming sequence flows
     */
    private FlowNode findFirstFlowNodeInSubProcess(SubProcess subProcess) {
        // Try to find tasks without incoming flows
        Collection<Task> tasks = subProcess.getChildElementsByType(Task.class);
        for (Task task : tasks) {
            if (task.getIncoming().isEmpty()) {
                return task;
            }
        }
        
        // If no tasks without incoming flows, return the first task
        if (!tasks.isEmpty()) {
            return tasks.iterator().next();
        }
        
        // If no tasks, try to find any flow node
        Collection<FlowNode> flowNodes = subProcess.getChildElementsByType(FlowNode.class);
        if (!flowNodes.isEmpty()) {
            return flowNodes.iterator().next();
        }
        
        return null;
    }
    
    /**
     * Fix exclusive gateways that have outgoing sequence flows without conditions
     */
    private void fixExclusiveGateways(BpmnModelInstance modelInstance, ModelElementInstance container) {
        Collection<ExclusiveGateway> gateways = container.getChildElementsByType(ExclusiveGateway.class);
        
        for (ExclusiveGateway gateway : gateways) {
            Collection<SequenceFlow> outgoingFlows = gateway.getOutgoing();
            
            // Skip if there's only one outgoing flow
            if (outgoingFlows.size() <= 1) {
                continue;
            }
            
            // Check if there's already a default flow
            SequenceFlow defaultFlow = null;
            for (SequenceFlow flow : outgoingFlows) {
                if (flow.equals(gateway.getDefault())) {
                    defaultFlow = flow;
                    break;
                }
            }
            
            // Set conditions on flows without conditions
            boolean hasSetDefault = false;
            for (SequenceFlow flow : outgoingFlows) {
                // Skip the default flow
                if (flow.equals(defaultFlow)) {
                    continue;
                }
                
                // If no condition expression is set
                if (flow.getConditionExpression() == null) {
                    // If we haven't set a default flow yet, set this as default
                    if (!hasSetDefault && defaultFlow == null) {
                        gateway.setDefault(flow);
                        hasSetDefault = true;
                    } else {
                        // Otherwise, add a dummy condition
                        ConditionExpression condition = modelInstance.newInstance(ConditionExpression.class);
                        condition.setTextContent("${true}");
                        flow.setConditionExpression(condition);
                    }
                }
            }
        }
        
        // Recursively fix gateways in subprocesses
        if (container instanceof Process || container instanceof SubProcess) {
            Collection<SubProcess> subProcesses = ((ModelElementInstance) container).getChildElementsByType(SubProcess.class);
            for (SubProcess subProcess : subProcesses) {
                fixExclusiveGateways(modelInstance, subProcess);
            }
        }
    }

    private int convertDurationToDays(Integer durationValue, String durationUnit) {
        if (durationValue == null) return 0;
        
        return switch (durationUnit.toLowerCase()) {
            case "hours", "heures" -> Math.max(1, durationValue / 24);
            case "days", "jours" -> durationValue;
            case "weeks", "semaines" -> durationValue * 7;
            case "months", "mois" -> durationValue * 30;
            default -> durationValue;
        };
    }
}
