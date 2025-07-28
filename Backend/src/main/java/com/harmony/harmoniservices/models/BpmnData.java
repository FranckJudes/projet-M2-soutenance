package com.harmony.harmoniservices.models;

import java.util.List;

import lombok.Data;
@Data
public class BpmnData {
    private List<Task> tasks;
    private List<Event> events;
    private List<Gateway> gateways;
    private List<SequenceFlow> sequenceFlows;
    private List<DataObject> dataObjects;
    private List<DataStore> dataStores;
    private List<TextAnnotation> textAnnotations;
    private List<Lane> lanes;
    private List<LaneSet> laneSets;
    private List<SubProcess> subProcesses;
    private List<Pool> pools;
    private List<MessageFlow> messageFlows;

  
}
