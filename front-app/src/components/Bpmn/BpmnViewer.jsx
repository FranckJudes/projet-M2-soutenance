import React, { useState, useCallback } from "react";
import { ReactFlow, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { calculateLayout } from "./layoutUtils";
import { isInSubProcess, saveTaskMetadata } from "./bpmnUtils";
import Breadcrumb from "./Breadcrumb";
import FileUpload from "./FileUpload";
import SubProcessViewer from "./SubProcessViewer";
import TaskConfigModal from "./TaskConfigModal";

const BpmnViewer = () => {
  const [bpmnData, setBpmnData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState("TB");
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [currentSubProcessNodes, setCurrentSubProcessNodes] = useState([]);
  const [currentSubProcessEdges, setCurrentSubProcessEdges] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskConfigModalVisible, setIsTaskConfigModalVisible] = useState(false);
  const [bpmnXml, setBpmnXml] = useState(null);

  // Transformer les données BPMN en nœuds et arêtes pour le diagramme principal
  const transformBpmnToXyflow = (bpmnData, direction) => {
    const nodes = [];
    const edges = [];

    // Ajouter les tâches, événements, passerelles et sous-processus
    if (Array.isArray(bpmnData.tasks)) {
      bpmnData.tasks.forEach((task) => {
        if (!isInSubProcess(task.id, bpmnData.subProcesses)) {
          nodes.push({
            id: task.id,
            type: "task",
            data: { label: task.name },
            position: { x: 0, y: 0 },
          });
        }
      });
    }

    if (Array.isArray(bpmnData.events)) {
      bpmnData.events.forEach((event) => {
        if (!isInSubProcess(event.id, bpmnData.subProcesses)) {
          nodes.push({
            id: event.id,
            type: "event",
            data: { label: event.typeEvent },
            position: { x: 0, y: 0 },
          });
        }
      });
    }

    if (Array.isArray(bpmnData.gateways)) {
      bpmnData.gateways.forEach((gateway) => {
        if (!isInSubProcess(gateway.id, bpmnData.subProcesses)) {
          nodes.push({
            id: gateway.id,
            type: "gateway",
            data: { label: gateway.name || gateway.typeGateway },
            position: { x: 0, y: 0 },
          });
        }
      });
    }

    if (Array.isArray(bpmnData.subProcesses)) {
      bpmnData.subProcesses.forEach((subProcess) => {
        nodes.push({
          id: subProcess.id,
          type: "subProcess",
          data: { 
            label: subProcess.name || "Sous-processus",
            hasSubProcesses: Array.isArray(subProcess.subProcesses) && subProcess.subProcesses.length > 0
          },
          position: { x: 0, y: 0 },
          style: { backgroundColor: "#f0f0f0", border: "2px solid #ccc", padding: "10px" },
        });
      });
    }

    if (Array.isArray(bpmnData.sequenceFlows)) {
      bpmnData.sequenceFlows.forEach((flow) => {
        if (!isInSubProcess(flow.source.id, bpmnData.subProcesses) && !isInSubProcess(flow.target.id, bpmnData.subProcesses)) {
          edges.push({
            id: flow.id,
            source: flow.source.id,
            target: flow.target.id,
            label: flow.name || "",
            markerEnd: {
              type: "arrow",
              color: "#000",
            },
          });
        }
      });
    }

    return calculateLayout(nodes, edges, direction);
  };

  // Fonction pour créer les nœuds et arêtes d'un sous-processus
  const createSubProcessElements = (subProcess) => {
    const nodes = [];
    const edges = [];

    if (Array.isArray(subProcess.tasks)) {
      subProcess.tasks.forEach((task) => {
        nodes.push({
          id: task.id,
          type: "task",
          data: { label: task.name || "Tâche" },
          position: { x: 0, y: 0 },
        });
      });
    }

    if (Array.isArray(subProcess.events)) {
      subProcess.events.forEach((event) => {
        nodes.push({
          id: event.id,
          type: "event",
          data: { label: event.typeEvent || "Événement" },
          position: { x: 0, y: 0 },
        });
      });
    }

    if (Array.isArray(subProcess.gateways)) {
      subProcess.gateways.forEach((gateway) => {
        nodes.push({
          id: gateway.id,
          type: "gateway",
          data: { label: gateway.name || gateway.typeGateway || "Passerelle" },
          position: { x: 0, y: 0 },
        });
      });
    }

    if (Array.isArray(subProcess.subProcesses)) {
      subProcess.subProcesses.forEach((nestedSubProcess) => {
        nodes.push({
          id: nestedSubProcess.id,
          type: "subProcess",
          data: { 
            label: nestedSubProcess.name || "Sous-processus",
            hasSubProcesses: Array.isArray(nestedSubProcess.subProcesses) && nestedSubProcess.subProcesses.length > 0
          },
          position: { x: 0, y: 0 },
          style: { backgroundColor: "#e6f7ff", border: "2px solid #1890ff", padding: "10px" },
        });
      });
    }

    if (Array.isArray(subProcess.sequenceFlows)) {
      subProcess.sequenceFlows.forEach((flow) => {
        edges.push({
          id: flow.id,
          source: flow.source.id,
          target: flow.target.id,
          label: flow.name || "",
          markerEnd: {
            type: "arrow",
            color: "#000",
          },
        });
      });
    }

    return calculateLayout(nodes, edges, direction);
  };

  // Gestion de l'upload du fichier BPMN
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Store the original XML for later use
      const reader = new FileReader();
      reader.onload = (e) => {
        setBpmnXml(e.target.result);
      };
      reader.readAsText(file);

      const response = await fetch("http://localhost:8100/bpmn/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données BPMN");
      }

      const data = await response.json();
      console.log("Données BPMN reçues :", data);

      if (!data || typeof data !== "object") {
        throw new Error("Réponse de l'API invalide");
      }

      setBpmnData(data);

      const { nodes, edges } = transformBpmnToXyflow(data, direction);
      setNodes(nodes);
      setEdges(edges);
      setError(null);
      
      setBreadcrumb([]);
      setCurrentSubProcessNodes([]);
      setCurrentSubProcessEdges([]);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // Fonction pour basculer entre l'orientation horizontale et verticale
  const toggleDirection = () => {
    const newDirection = direction === "TB" ? "LR" : "TB";
    setDirection(newDirection);

    if (bpmnData) {
      const { nodes, edges } = transformBpmnToXyflow(bpmnData, newDirection);
      setNodes(nodes);
      setEdges(edges);
      
      if (breadcrumb.length > 0) {
        const currentSubProcess = getCurrentSubProcessFromBreadcrumb();
        if (currentSubProcess) {
          const { nodes, edges } = createSubProcessElements(currentSubProcess);
          setCurrentSubProcessNodes(nodes);
          setCurrentSubProcessEdges(edges);
        }
      }
    }
  };

  // Fonction pour obtenir le sous-processus actuel à partir du fil d'Ariane
  const getCurrentSubProcessFromBreadcrumb = () => {
    if (breadcrumb.length === 0 || !bpmnData) return null;
    
    let currentProcess = null;
    let processes = bpmnData.subProcesses;
    
    for (const item of breadcrumb) {
      if (!Array.isArray(processes)) return null;
      
      currentProcess = processes.find(p => p.id === item.id);
      if (!currentProcess) return null;
      
      processes = currentProcess.subProcesses;
    }
    
    return currentProcess;
  };

  // Fonction pour gérer le clic sur un sous-processus dans le diagramme principal
  const handleMainDiagramSubProcessClick = (subProcessId) => {
    if (!bpmnData || !Array.isArray(bpmnData.subProcesses)) return;
    
    const subProcess = bpmnData.subProcesses.find(sp => sp.id === subProcessId);
    if (!subProcess) return;
    
    setBreadcrumb([{
      id: subProcess.id,
      name: subProcess.name || "Sous-processus"
    }]);
    
    const { nodes, edges } = createSubProcessElements(subProcess);
    setCurrentSubProcessNodes(nodes);
    setCurrentSubProcessEdges(edges);
    
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        style: node.id === subProcessId ? 
          { backgroundColor: "#ffcc00", border: "2px solid #ff9900", padding: "10px" } : 
          node.style
      }))
    );
  };

  // Fonction pour gérer le clic sur un sous-processus imbriqué dans le panneau de droite
  const handleNestedSubProcessClick = (subProcessId) => {
    const currentSubProcess = getCurrentSubProcessFromBreadcrumb();
    if (!currentSubProcess || !Array.isArray(currentSubProcess.subProcesses)) return;
    
    const nestedSubProcess = currentSubProcess.subProcesses.find(sp => sp.id === subProcessId);
    if (!nestedSubProcess) return;
    
    // Ajouter au fil d'Ariane
    setBreadcrumb([...breadcrumb, {
      id: nestedSubProcess.id,
      name: nestedSubProcess.name || "Sous-processus"
    }]);
    
    // Créer et afficher les éléments du sous-processus imbriqué
    const { nodes, edges } = createSubProcessElements(nestedSubProcess);
    setCurrentSubProcessNodes(nodes);
    setCurrentSubProcessEdges(edges);
  };

  // Fonction pour naviguer via le fil d'Ariane
  const navigateToBreadcrumbLevel = (level) => {
    if (level === 0) {
      setBreadcrumb([]);
      setCurrentSubProcessNodes([]);
      setCurrentSubProcessEdges([]);
      
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          style: node.type === "subProcess" ? 
            { backgroundColor: "#f0f0f0", border: "2px solid #ccc", padding: "10px" } : 
            node.style
        }))
      );
      
      return;
    }
    
    const newBreadcrumb = breadcrumb.slice(0, level);
    setBreadcrumb(newBreadcrumb);
    
    let currentProcess = null;
    let processes = bpmnData.subProcesses;
    
    for (const item of newBreadcrumb) {
      currentProcess = processes.find(p => p.id === item.id);
      if (!currentProcess) return;
      processes = currentProcess.subProcesses;
    }
    
    if (currentProcess) {
      const { nodes, edges } = createSubProcessElements(currentProcess);
      setCurrentSubProcessNodes(nodes);
      setCurrentSubProcessEdges(edges);
    }
  };

  // Handle node double click to open task configuration
  const handleNodeDoubleClick = useCallback((event, node) => {
    event.preventDefault();
    
    // Only open config modal for task nodes
    if (node.type === "task") {
      // Find the task in the bpmnData
      const taskData = bpmnData.tasks.find(task => task.id === node.id);
      if (taskData) {
        setSelectedTask(taskData);
        setIsTaskConfigModalVisible(true);
      }
    }
  }, [bpmnData]);

  // Handle task configuration save
  const handleTaskConfigSave = useCallback(async (updatedTask) => {
    if (!bpmnXml || !selectedTask) return;

    try {
      // Update the task in the bpmnData
      const updatedBpmnData = {
        ...bpmnData,
        tasks: bpmnData.tasks.map(task => 
          task.id === selectedTask.id ? { ...task, ...updatedTask } : task
        )
      };
      setBpmnData(updatedBpmnData);

      // Update the node label in the diagram
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === selectedTask.id 
            ? { ...node, data: { ...node.data, label: updatedTask.name } } 
            : node
        )
      );

      // Save metadata to BPMN XML
      const updatedXml = await saveTaskMetadata(bpmnXml, selectedTask.id, updatedTask);
      setBpmnXml(updatedXml);

      // Upload updated XML to server
      const formData = new FormData();
      const blob = new Blob([updatedXml], { type: 'text/xml' });
      formData.append("file", blob, "updated.bpmn");

      const response = await fetch("http://localhost:8100/bpmn/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error updating BPMN on server");
      }

      setIsTaskConfigModalVisible(false);
    } catch (err) {
      console.error("Error saving task configuration:", err);
      setError("Failed to save task configuration: " + err.message);
    }
  }, [bpmnXml, selectedTask, bpmnData]);

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "row" }}>
      <FileUpload handleFileUpload={handleFileUpload} toggleDirection={toggleDirection} direction={direction} error={error} />

      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(event, node) => {
            if (node.type === "subProcess") {
              handleMainDiagramSubProcessClick(node.id);
            }
          }}
          onNodeDoubleClick={handleNodeDoubleClick}
        >
          <Controls />
        </ReactFlow>
      </div>

      {breadcrumb.length > 0 && (
        <div style={{ width: "40%", borderLeft: "1px solid #ccc", padding: "20px", display: "flex", flexDirection: "column" }}>
          <Breadcrumb breadcrumb={breadcrumb} navigateToBreadcrumbLevel={navigateToBreadcrumbLevel} />
          <h3>{breadcrumb[breadcrumb.length - 1]?.name || "Sous-processus"}</h3>
          <SubProcessViewer 
            nodes={currentSubProcessNodes} 
            edges={currentSubProcessEdges} 
            handleNestedSubProcessClick={handleNestedSubProcessClick}
            onNodeDoubleClick={handleNodeDoubleClick}
          />
        </div>
      )}

      {/* Task Configuration Modal */}
      <TaskConfigModal
        visible={isTaskConfigModalVisible}
        task={selectedTask}
        onClose={() => setIsTaskConfigModalVisible(false)}
        onSave={handleTaskConfigSave}
      />
    </div>
  );
};

export default BpmnViewer;
