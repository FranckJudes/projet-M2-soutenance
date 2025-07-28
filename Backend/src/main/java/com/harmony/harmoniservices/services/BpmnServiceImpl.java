package com.harmony.harmoniservices.services;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.instance.*;
import org.springframework.stereotype.Service;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;

import com.harmony.harmoniservices.models.*;
import com.harmony.harmoniservices.enums.TriggerType;
import com.harmony.harmoniservices.enums.TypeEvent;
import com.harmony.harmoniservices.enums.TypeGateway;
import com.harmony.harmoniservices.enums.TypeTask;

@Service
public class BpmnServiceImpl  {

    
    public BpmnData parseBpmnFile(InputStream bpmnInputStream) {
        try {
            BpmnModelInstance modelInstance = Bpmn.readModelFromStream(bpmnInputStream);
            BpmnData bpmnData = new BpmnData();

            bpmnData.setTasks(extractTasks(modelInstance));
            bpmnData.setEvents(extractEvents(modelInstance));
            bpmnData.setGateways(extractGateways(modelInstance));
            bpmnData.setSequenceFlows(extractSequenceFlows(modelInstance));
            bpmnData.setDataObjects(extractDataObjects(modelInstance));
            bpmnData.setDataStores(extractDataStores(modelInstance));
            bpmnData.setTextAnnotations(extractTextAnnotations(modelInstance));
            bpmnData.setLanes(extractLanes(modelInstance));
            bpmnData.setLaneSets(extractLaneSets(modelInstance));
            bpmnData.setSubProcesses(setSubProcesses(modelInstance));
            bpmnData.setPools(extractPools(modelInstance));
            bpmnData.setMessageFlows(extractMessageFlows(modelInstance));

            return bpmnData;
        } catch (Exception e) {
            throw new RuntimeException("Error parsing BPMN file", e);
        }
    }

    
    public List<com.harmony.harmoniservices.models.Task> extractTasks(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.Task.class)
                .stream()
                .filter(task -> !(task.getParentElement() instanceof org.camunda.bpm.model.bpmn.instance.SubProcess))
                .map(task -> com.harmony.harmoniservices.models.Task.builder()
                        .id(task.getId())
                        .name(task.getName())
                        .typeTask(mapBpmnTaskTypeToEnum(task.getElementType().getTypeName()))
                        .description(!task.getDocumentations().isEmpty()
                                ? task.getDocumentations().iterator().next().getTextContent()
                                : null)
                        .build())
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.Event> extractEvents(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.Event.class)
                .stream()
                .map(event -> com.harmony.harmoniservices.models.Event.builder()
                        .id(event.getId())
                        .name(event.getName())
                        .typeEvent(mapBpmnEventTypeToEnum(event.getElementType().getTypeName()))
                        .triggerType(determineTriggerType(event))
                        .eventDefinition(determineEventDefinition(event))
                        .build())
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.Gateway> extractGateways(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.Gateway.class)
                .stream()
                .map(gateway -> com.harmony.harmoniservices.models.Gateway.builder()
                        .id(gateway.getId())
                        .name(gateway.getName())
                        .typeGateway(mapBpmnGatewayTypeToEnum(gateway.getElementType().getTypeName()))
                        .documentation(gateway.getDocumentations().isEmpty()
                                ? null : gateway.getDocumentations().iterator().next().getTextContent())
                        .build())
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.SequenceFlow> extractSequenceFlows(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.SequenceFlow.class)
                .stream()
                .map(flow -> {
                    com.harmony.harmoniservices.models.Task sourceTask =
                            com.harmony.harmoniservices.models.Task.builder()
                                    .id(flow.getSource().getId())
                                    .build();
                    com.harmony.harmoniservices.models.Task targetTask =
                            com.harmony.harmoniservices.models.Task.builder()
                                    .id(flow.getTarget().getId())
                                    .build();
                    return com.harmony.harmoniservices.models.SequenceFlow.builder()
                            .id(flow.getId())
                            .name(flow.getName())
                            .source(sourceTask)
                            .target(targetTask)
                            .conditionExpression(flow.getConditionExpression() != null
                                    ? flow.getConditionExpression().getTextContent()
                                    : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.DataObject> extractDataObjects(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.DataObject.class)
                .stream()
                .map(obj -> new com.harmony.harmoniservices.models.DataObject(
                        obj.getId(),
                        obj.getName(),
                        null,
                        !obj.getDocumentations().isEmpty() ?
                                obj.getDocumentations().iterator().next().getTextContent() : null
                ))
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.DataStore> extractDataStores(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.DataStore.class)
                .stream()
                .map(store -> new com.harmony.harmoniservices.models.DataStore(
                        store.getId(),
                        store.getName(),
                        null,
                        !store.getDocumentations().isEmpty() ?
                                store.getDocumentations().iterator().next().getTextContent() : null
                ))
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.LaneSet> extractLaneSets(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.LaneSet.class)
                .stream()
                .map(camundaLaneSet -> com.harmony.harmoniservices.models.LaneSet.builder()
                        .id(camundaLaneSet.getId())
                        .name(camundaLaneSet.getName())
                        .build())
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.Lane> extractLanes(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.Lane.class)
                .stream()
                .map(lane -> new com.harmony.harmoniservices.models.Lane())
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.SubProcess> setSubProcesses(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.SubProcess.class)
                .stream()
                .filter(subProcess -> !(subProcess.getParentElement() instanceof org.camunda.bpm.model.bpmn.instance.SubProcess))
                .map(this::extractSubProcessWithNested)
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.Pool> extractPools(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(Participant.class)
                .stream()
                .map(p -> com.harmony.harmoniservices.models.Pool.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .build())
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.MessageFlow> extractMessageFlows(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.MessageFlow.class)
                .stream()
                .map(mf -> new com.harmony.harmoniservices.models.MessageFlow(
                        mf.getId(),
                        mf.getName(),
                        mf.getSource().getId(),
                        mf.getTarget().getId(),
                        null
                ))
                .collect(Collectors.toList());
    }

    
    public List<com.harmony.harmoniservices.models.TextAnnotation> extractTextAnnotations(BpmnModelInstance modelInstance) {
        return modelInstance.getModelElementsByType(org.camunda.bpm.model.bpmn.instance.TextAnnotation.class)
                .stream()
                .map(annotation -> new com.harmony.harmoniservices.models.TextAnnotation(
                        annotation.getId(),
                        annotation.getTextContent(),
                        null
                ))
                .collect(Collectors.toList());
    }

    
    public TriggerType determineTriggerType(org.camunda.bpm.model.bpmn.instance.Event event) {
        if (event.getDocumentations().isEmpty())
            return TriggerType.NONE;

        String eventDefType = event.getDocumentations()
                .iterator()
                .next()
                .getElementType()
                .getTypeName()
                .toUpperCase();

        switch (eventDefType) {
            case "MESSAGEEVENTDEFINITION":
                return TriggerType.MESSAGE;
            case "SIGNALEVENTDEFINITION":
                return TriggerType.SIGNAL;
            case "TIMEREVENTDEFINITION":
                return TriggerType.TIMER;
            case "CONDITIONALEVENTDEFINITION":
                return TriggerType.CONDITIONAL;
            case "ERROREVENTDEFINITION":
                return TriggerType.ERROR;
            case "ESCALATIONEVENTDEFINITION":
                return TriggerType.ESCALATION;
            case "COMPENSATIONEVENTDEFINITION":
                return TriggerType.COMPENSATION;
            case "LINKEVENTDEFINITION":
                return TriggerType.LINK;
            case "TERMINATEEVENTDEFINITION":
                return TriggerType.TERMINATE;
            default:
                return TriggerType.NONE;
        }
    }

    
    public String determineEventDefinition(org.camunda.bpm.model.bpmn.instance.Event event) {
        if (event.getDocumentations().isEmpty())
            return null;

        var eventDefinition = event.getDocumentations().iterator().next();
        StringBuilder definition = new StringBuilder();

        definition.append(eventDefinition.getElementType().getTypeName());

        if (eventDefinition instanceof MessageEventDefinition) {
            MessageEventDefinition med = (MessageEventDefinition) eventDefinition;
            if (med.getMessage() != null)
                definition.append(": ").append(med.getMessage().getName());
        } else if (eventDefinition instanceof TimerEventDefinition) {
            TimerEventDefinition ted = (TimerEventDefinition) eventDefinition;
            if (ted.getTimeDuration() != null)
                definition.append(": Duration=").append(ted.getTimeDuration().getTextContent());
            else if (ted.getTimeDate() != null)
                definition.append(": Date=").append(ted.getTimeDate().getTextContent());
            else if (ted.getTimeCycle() != null)
                definition.append(": Cycle=").append(ted.getTimeCycle().getTextContent());
        } else if (eventDefinition instanceof ErrorEventDefinition) {
            ErrorEventDefinition eed = (ErrorEventDefinition) eventDefinition;
            if (eed.getError() != null)
                definition.append(": ").append(eed.getError().getErrorCode());
        } else if (eventDefinition instanceof SignalEventDefinition) {
            SignalEventDefinition sed = (SignalEventDefinition) eventDefinition;
            if (sed.getSignal() != null)
                definition.append(": ").append(sed.getSignal().getName());
        }

        return definition.toString();
    }

    
    public TypeTask mapBpmnTaskTypeToEnum(String bpmnTaskType) {
        switch (bpmnTaskType.toLowerCase()) {
            case "usertask":
                return TypeTask.USER;
            case "servicetask":
                return TypeTask.SERVICE;
            case "scripttask":
                return TypeTask.SCRIPT;
            case "businessruletask":
                return TypeTask.BUSINESS_RULE;
            case "sendtask":
                return TypeTask.SEND;
            case "receivetask":
                return TypeTask.RECEIVE;
            case "manualtask":
                return TypeTask.MANUAL;
            default:
                return TypeTask.NONE;
        }
    }

    
    public TypeEvent mapBpmnEventTypeToEnum(String bpmnEventType) {
        switch (bpmnEventType.toLowerCase()) {
            case "startevent":
                return TypeEvent.START;
            case "endevent":
                return TypeEvent.END;
            case "intermediatecatchevent":
                return TypeEvent.INTERMEDIATE_CATCH_EVENT;
            case "intermediatethrowevent":
                return TypeEvent.INTERMEDIATE_THROW_EVENT;
            case "boundaryevent":
                return TypeEvent.BOUNDARY_EVENT;
            case "messageintermediatecatchevent":
                return TypeEvent.MESSAGE_INTERMEDITE_CATCH_EVENT;
            case "messageintermediatethrowevent":
                return TypeEvent.MESSAGE_INTERMEDITE_THROW_EVENT;
            case "signalintermediatecatchevent":
                return TypeEvent.SIGNAL_INTERMEDITE_CATCH_EVENT;
            case "signalintermediatethrowevent":
                return TypeEvent.SIGNAL_INTERMEDITE_THROW_EVENT;
            case "timerintermediatecatchevent":
                return TypeEvent.TIMER_INTERMEDITE_CATCH_EVENT;
            case "timerintermediatethrowevent":
                return TypeEvent.TIMER_INTERMEDITE_THROW_EVENT;
            case "compensationintermediatecatchevent":
                return TypeEvent.COMPENSATION_INTERMEDITE_CATCH_EVENT;
            case "compensationintermediatethrowevent":
                return TypeEvent.COMPENSATION_INTERMEDITE_THROW_EVENT;
            case "linkintermediatecatchevent":
                return TypeEvent.LINK_INTERMEDITE_CATCH_EVENT;
            case "linkintermediatethrowevent":
                return TypeEvent.LINK_INTERMEDITE_THROW_EVENT;
            case "terminateintermediatecatchevent":
                return TypeEvent.TERMINATE_INTERMEDITE_CATCH_EVENT;
            case "terminateintermediatethrowevent":
                return TypeEvent.TERMINATE_INTERMEDITE_THROW_EVENT;
            case "intermediateevent":
                return TypeEvent.INTERMEDIATE;
            default:
                return TypeEvent.UNKNOWN;
        }
    }

    
    public TypeGateway mapBpmnGatewayTypeToEnum(String bpmnGatewayType) {
        switch (bpmnGatewayType.toLowerCase()) {
            case "exclusivegateway":
                return TypeGateway.EXCLUSIVE;
            case "parallelgateway":
                return TypeGateway.PARALLEL;
            case "inclusivegateway":
                return TypeGateway.INCLUSIVE;
            case "complexgateway":
                return TypeGateway.COMPLEX;
            case "eventbasedgateway":
                return TypeGateway.EVENT_BASED;
            default:
                return TypeGateway.UNKNOWN;
        }
    }

    // Méthodes helpers internes

    private com.harmony.harmoniservices.models.SubProcess extractSubProcessWithNested(org.camunda.bpm.model.bpmn.instance.SubProcess bpmnSubProcess) {
        com.harmony.harmoniservices.models.SubProcess entitySubProcess =
                com.harmony.harmoniservices.models.SubProcess.builder()
                        .id(bpmnSubProcess.getId())
                        .name(bpmnSubProcess.getName())
                        .documentation(!bpmnSubProcess.getDocumentations().isEmpty()
                                ? bpmnSubProcess.getDocumentations().iterator().next().getTextContent()
                                : null)
                        .tasks(new ArrayList<>())
                        .events(new ArrayList<>())
                        .gateways(new ArrayList<>())
                        .sequenceFlows(new ArrayList<>())
                        .subProcesses(new ArrayList<>())
                        .build();

        List<com.harmony.harmoniservices.models.Task> tasks = extractTasksFromSubProcess(bpmnSubProcess, entitySubProcess);
        List<com.harmony.harmoniservices.models.Event> events = extractEventsFromSubProcess(bpmnSubProcess, entitySubProcess);
        List<com.harmony.harmoniservices.models.Gateway> gateways = extractGatewaysFromSubProcess(bpmnSubProcess, entitySubProcess);
        List<com.harmony.harmoniservices.models.SequenceFlow> sequenceFlows = extractSequenceFlowsFromSubProcess(bpmnSubProcess, entitySubProcess);

        entitySubProcess.getTasks().addAll(tasks);
        entitySubProcess.getEvents().addAll(events);
        entitySubProcess.getGateways().addAll(gateways);
        entitySubProcess.getSequenceFlows().addAll(sequenceFlows);

        List<com.harmony.harmoniservices.models.SubProcess> nestedSubProcesses =
                bpmnSubProcess.getChildElementsByType(org.camunda.bpm.model.bpmn.instance.SubProcess.class)
                        .stream()
                        .map(this::extractSubProcessWithNested)
                        .collect(Collectors.toList());

        entitySubProcess.getSubProcesses().addAll(nestedSubProcesses);

        return entitySubProcess;
    }

    private List<com.harmony.harmoniservices.models.Task> extractTasksFromSubProcess(
            org.camunda.bpm.model.bpmn.instance.SubProcess bpmnSubProcess,
            com.harmony.harmoniservices.models.SubProcess entitySubProcess) {
        return bpmnSubProcess.getChildElementsByType(org.camunda.bpm.model.bpmn.instance.Task.class)
                .stream()
                .map(task -> com.harmony.harmoniservices.models.Task.builder()
                        .id(task.getId())
                        .name(task.getName())
                        .typeTask(mapBpmnTaskTypeToEnum(task.getElementType().getTypeName()))
                        .description(!task.getDocumentations().isEmpty()
                                ? task.getDocumentations().iterator().next().getTextContent()
                                : null)
                        .subProcess(entitySubProcess)
                        .build())
                .collect(Collectors.toList());
    }

    private List<com.harmony.harmoniservices.models.Event> extractEventsFromSubProcess(
            org.camunda.bpm.model.bpmn.instance.SubProcess bpmnSubProcess,
            com.harmony.harmoniservices.models.SubProcess entitySubProcess) {
        return bpmnSubProcess.getChildElementsByType(org.camunda.bpm.model.bpmn.instance.Event.class)
                .stream()
                .map(event -> com.harmony.harmoniservices.models.Event.builder()
                        .id(event.getId())
                        .name(event.getName())
                        .typeEvent(mapBpmnEventTypeToEnum(event.getElementType().getTypeName()))
                        .triggerType(determineTriggerType(event))
                        .eventDefinition(determineEventDefinition(event))
                        .subProcess(entitySubProcess)
                        .build())
                .collect(Collectors.toList());
    }

    private List<com.harmony.harmoniservices.models.Gateway> extractGatewaysFromSubProcess(
            org.camunda.bpm.model.bpmn.instance.SubProcess bpmnSubProcess,
            com.harmony.harmoniservices.models.SubProcess entitySubProcess) {
        return bpmnSubProcess.getChildElementsByType(org.camunda.bpm.model.bpmn.instance.Gateway.class)
                .stream()
                .map(gateway -> com.harmony.harmoniservices.models.Gateway.builder()
                        .id(gateway.getId())
                        .name(gateway.getName())
                        .typeGateway(mapBpmnGatewayTypeToEnum(gateway.getElementType().getTypeName()))
                        .documentation(gateway.getDocumentations().isEmpty()
                                ? null
                                : gateway.getDocumentations().iterator().next().getTextContent())
                        .subProcess(entitySubProcess)
                        .build())
                .collect(Collectors.toList());
    }

    private List<com.harmony.harmoniservices.models.SequenceFlow> extractSequenceFlowsFromSubProcess(
            org.camunda.bpm.model.bpmn.instance.SubProcess bpmnSubProcess,
            com.harmony.harmoniservices.models.SubProcess entitySubProcess) {
        return bpmnSubProcess.getChildElementsByType(org.camunda.bpm.model.bpmn.instance.SequenceFlow.class)
                .stream()
                .map(flow -> com.harmony.harmoniservices.models.SequenceFlow.builder()
                        .id(flow.getId())
                        .name(flow.getName())
                        .source(com.harmony.harmoniservices.models.Task.builder()
                                .id(flow.getSource().getId())
                                .build())
                        .target(com.harmony.harmoniservices.models.Task.builder()
                                .id(flow.getTarget().getId())
                                .build())
                        .conditionExpression(flow.getConditionExpression() != null
                                ? flow.getConditionExpression().getTextContent()
                                : null)
                        .subProcess(entitySubProcess)
                        .build())
                .collect(Collectors.toList());
    }
}