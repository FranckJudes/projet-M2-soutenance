import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../components/Card.jsx';
import { styles } from '../../../utils/styles.jsx';
import { useTranslation } from 'react-i18next';
import NormalTabs from "../../../components/Tabs.jsx";
import InformationGeneral from './SubTabParametres/InformationGeneral.jsx';
import Habilitation from '../../Configuration/Tabs/SubTabParametres/Habilitation.jsx';
import Planification from './SubTabParametres/Planification.jsx';
import Condition from '../../Configuration/Tabs/SubTabParametres/Condition.jsx';
import Ressource from './SubTabParametres/Ressource.jsx';
import Notifications from './SubTabParametres/Notification.jsx';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import toast from 'react-hot-toast';
import BpmnModelService from '../../../services/BpmnModelService';


// Utilitaires pour la gestion du BPMN
const isElementInSubProcess = (elementId, subProcess) => {
  if (!subProcess) return false;
  
  if (Array.isArray(subProcess.tasks) && subProcess.tasks.some(task => task.id === elementId)) {
    return true;
  }
  if (Array.isArray(subProcess.events) && subProcess.events.some(event => event.id === elementId)) {
    return true;
  }
  if (Array.isArray(subProcess.gateways) && subProcess.gateways.some(gateway => gateway.id === elementId)) {
    return true;
  }
  if (Array.isArray(subProcess.subProcesses)) {
    for (const nestedSubProcess of subProcess.subProcesses) {
      if (isElementInSubProcess(elementId, nestedSubProcess)) {
        return true;
      }
    }
  }
  return false;
};
  
// Composant Breadcrumb pour la navigation dans les sous-processus
const BpmnBreadcrumb = ({ breadcrumb, navigateToBreadcrumbLevel }) => {
  const { t } = useTranslation();

  return (
    <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", flexWrap: "wrap", fontSize: "14px" }}>
      <span 
        onClick={() => navigateToBreadcrumbLevel(0)}
        style={{ cursor: "pointer", color: "#0066cc" }}
      >
        {t("__diag__principal")}
      </span>
      
      {breadcrumb.map((item, index) => (
        <React.Fragment key={item.id}>
          <span style={{ margin: "0 5px" }}> &gt; </span>
          <span 
            onClick={() => navigateToBreadcrumbLevel(index + 1)}
            style={{ 
              cursor: "pointer", 
              color: "#0066cc",
              fontWeight: index === breadcrumb.length - 1 ? "bold" : "normal"
            }}
          >
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

function Parametres({ sharedData, bpmnId = null, isUpdateMode = false, onSaveSuccess = null }) {
  const { t } = useTranslation();
  
  const [activities, setActivities] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // États pour le diagramme BPMN
  const [bpmnData, setBpmnData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState("TB");
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [currentSubProcessNodes, setCurrentSubProcessNodes] = useState([]);
  const [currentSubProcessEdges, setCurrentSubProcessEdges] = useState([]);
  
  // États pour le diagramme en bas
  const [lowerBreadcrumb, setLowerBreadcrumb] = useState([]);
  const [lowerNodes, setLowerNodes] = useState([]);
  const [lowerEdges, setLowerEdges] = useState([]);

  // Configuration pour le layout du diagramme
  const nodeWidth = 172;
  const nodeHeight = 36;

  // Fonction pour calculer les positions des nœuds avec dagre
  const calculateLayout = useCallback((nodes, edges, direction) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const updatedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes: updatedNodes, edges };
  }, []);

  // Vérifier si un élément appartient à un sous-processus
  const isInSubProcess = useCallback((elementId) => {
    if (!bpmnData || !Array.isArray(bpmnData.subProcesses)) return false;

    for (const subProcess of bpmnData.subProcesses) {
      if (isElementInSubProcess(elementId, subProcess)) {
        return true;
      }
    }
    return false;
  }, [bpmnData]);

  // Transformer les données BPMN en nœuds et arêtes pour le diagramme principal
  const transformBpmnToXyflow = useCallback((data, direction) => {
    if (!data) return { nodes: [], edges: [] };
    
    const nodes = [];
    const edges = [];

    // Ajouter les tâches qui ne sont pas dans un sous-processus
    if (Array.isArray(data.tasks)) {
      data.tasks.forEach((task) => {
        if (!isInSubProcess(task.id)) {
          nodes.push({
            id: task.id,
            type: "task",
            data: { label: task.name || "Tâche sans nom" },
            position: { x: 0, y: 0 },
          });
        }
      });
    }

    // Ajouter les événements qui ne sont pas dans un sous-processus
    if (Array.isArray(data.events)) {
      data.events.forEach((event) => {
        if (!isInSubProcess(event.id)) {
          nodes.push({
            id: event.id,
            type: "event",
            data: { label: event.typeEvent || "Événement" },
            position: { x: 0, y: 0 },
          });
        }
      });
    }

    // Ajouter les passerelles qui ne sont pas dans un sous-processus
    if (Array.isArray(data.gateways)) {
      data.gateways.forEach((gateway) => {
        if (!isInSubProcess(gateway.id)) {
          nodes.push({
            id: gateway.id,
            type: "gateway",
            data: { label: gateway.name || gateway.typeGateway || "Passerelle" },
            position: { x: 0, y: 0 },
          });
        }
      });
    }

    // Ajouter les sous-processus de premier niveau
    if (Array.isArray(data.subProcesses)) {
      data.subProcesses.forEach((subProcess) => {
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

    // Ajouter les flux de séquence entre les éléments du diagramme principal
    if (Array.isArray(data.sequenceFlows)) {
      data.sequenceFlows.forEach((flow) => {
        if (flow.source && flow.target && !isInSubProcess(flow.source.id) && !isInSubProcess(flow.target.id)) {
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
  }, [isInSubProcess, calculateLayout]);

  // Fonction pour créer les nœuds et arêtes d'un sous-processus
  const createSubProcessElements = useCallback((subProcess) => {
    if (!subProcess) return { nodes: [], edges: [] };
    
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
        if (flow.source && flow.target) {
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
  }, [direction, calculateLayout]);

  // Fonction pour obtenir le sous-processus actuel à partir du fil d'Ariane
  const getCurrentSubProcessFromBreadcrumb = useCallback((breadcrumbArray) => {
    if (breadcrumbArray.length === 0 || !bpmnData || !Array.isArray(bpmnData.subProcesses)) return null;
    
    let currentProcess = null;
    let processes = bpmnData.subProcesses;
    
    for (const item of breadcrumbArray) {
      if (!Array.isArray(processes)) return null;
      
      currentProcess = processes.find(p => p.id === item.id);
      if (!currentProcess) return null;
      
      processes = currentProcess.subProcesses;
    }
    
    return currentProcess;
  }, [bpmnData]);

  // Fonction pour basculer entre l'orientation horizontale et verticale
  const toggleDirection = useCallback(() => {
    setDirection(prev => prev === "TB" ? "LR" : "TB");
  }, []);

  // Fonction pour gérer le clic sur un sous-processus dans le diagramme principal
  const handleMainDiagramSubProcessClick = useCallback((subProcessId) => {
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
  }, [bpmnData, createSubProcessElements]);

  // Fonction pour gérer le clic sur un sous-processus imbriqué dans le panneau de droite
  const handleNestedSubProcessClick = useCallback((subProcessId) => {
    const currentSubProcess = getCurrentSubProcessFromBreadcrumb(breadcrumb);
    if (!currentSubProcess || !Array.isArray(currentSubProcess.subProcesses)) return;
    
    const nestedSubProcess = currentSubProcess.subProcesses.find(sp => sp.id === subProcessId);
    if (!nestedSubProcess) return;
    
    setBreadcrumb(prev => [...prev, {
      id: nestedSubProcess.id,
      name: nestedSubProcess.name || "Sous-processus"
    }]);
    
    const { nodes, edges } = createSubProcessElements(nestedSubProcess);
    setCurrentSubProcessNodes(nodes);
    setCurrentSubProcessEdges(edges);
  }, [getCurrentSubProcessFromBreadcrumb, breadcrumb, createSubProcessElements]);

  // Fonction pour naviguer via le fil d'Ariane
  const navigateToBreadcrumbLevel = useCallback((level) => {
    if (level === 0) {
      setBreadcrumb([]);
      setCurrentSubProcessNodes([]);
      setCurrentSubProcessEdges([]);
      
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          style: node.type === "subProcess" ? 
            { backgroundColor: "#f0f0f0", border: "3px solid #ccc", padding: "10px" } : 
            node.style
        }))
      );
      
      return;
    }
    
    const newBreadcrumb = breadcrumb.slice(0, level);
    setBreadcrumb(newBreadcrumb);
    
    let currentProcess = null;
    let processes = bpmnData?.subProcesses || [];
    
    for (const item of newBreadcrumb) {
      currentProcess = processes.find(p => p.id === item.id);
      if (!currentProcess) return;
      processes = currentProcess.subProcesses || [];
    }
    
    if (currentProcess) {
      const { nodes, edges } = createSubProcessElements(currentProcess);
      setCurrentSubProcessNodes(nodes);
      setCurrentSubProcessEdges(edges);
    }
  }, [breadcrumb, bpmnData, createSubProcessElements]);

  // Fonctions pour le diagramme du bas
  const handleLowerDiagramSubProcessClick = useCallback((subProcessId) => {
    if (!bpmnData || !Array.isArray(bpmnData.subProcesses)) return;
    
    const subProcess = bpmnData.subProcesses.find(sp => sp.id === subProcessId);
    if (!subProcess) return;
    
    setLowerBreadcrumb([{
      id: subProcess.id,
      name: subProcess.name || "Sous-processus"
    }]);
    
    const { nodes, edges } = createSubProcessElements(subProcess);
    setLowerNodes(nodes);
    setLowerEdges(edges);
    
    // Sélectionner le sous-processus
    setSelectedEvent({
      id: subProcess.id,
      name: subProcess.name || "Sous-processus",
      type: "subProcess"
    });
  }, [bpmnData, createSubProcessElements]);

  const handleLowerNestedSubProcessClick = useCallback((subProcessId) => {
    const currentSubProcess = getCurrentSubProcessFromBreadcrumb(lowerBreadcrumb);
    if (!currentSubProcess || !Array.isArray(currentSubProcess.subProcesses)) return;
    
    const nestedSubProcess = currentSubProcess.subProcesses.find(sp => sp.id === subProcessId);
    if (!nestedSubProcess) return;
    
    setLowerBreadcrumb(prev => [...prev, {
      id: nestedSubProcess.id,
      name: nestedSubProcess.name || "Sous-processus"
    }]);
    
    const { nodes, edges } = createSubProcessElements(nestedSubProcess);
    setLowerNodes(nodes);
    setLowerEdges(edges);
    
    // Sélectionner le sous-processus
    setSelectedEvent({
      id: nestedSubProcess.id,
      name: nestedSubProcess.name || "Sous-processus",
      type: "subProcess"
    });
  }, [getCurrentSubProcessFromBreadcrumb, lowerBreadcrumb, createSubProcessElements]);

  const navigateToLowerBreadcrumbLevel = useCallback((level) => {
    if (level === 0) {
      setLowerBreadcrumb([]);
      setLowerNodes([]);
      setLowerEdges([]);
      
      // Réinitialiser le diagramme du bas avec les nœuds principaux
      const { nodes, edges } = transformBpmnToXyflow(bpmnData, direction);
      setLowerNodes(nodes);
      setLowerEdges(edges);
      
      return;
    }
    
    const newBreadcrumb = lowerBreadcrumb.slice(0, level);
    setLowerBreadcrumb(newBreadcrumb);
    
    let currentProcess = null;
    let processes = bpmnData?.subProcesses || [];
    
    for (const item of newBreadcrumb) {
      currentProcess = processes.find(p => p.id === item.id);
      if (!currentProcess) return;
      processes = currentProcess.subProcesses || [];
    }
    
    if (currentProcess) {
      const { nodes, edges } = createSubProcessElements(currentProcess);
      setLowerNodes(nodes);
      setLowerEdges(edges);
      
      // Sélectionner le sous-processus
      setSelectedEvent({
        id: currentProcess.id,
        name: currentProcess.name || "Sous-processus",
        type: "subProcess"
      });
    }
  }, [lowerBreadcrumb, bpmnData, direction, transformBpmnToXyflow, createSubProcessElements]);

  // Fonction pour vider le localStorage des configurations de tâches
  const clearTaskConfigurationsFromLocalStorage = () => {
    console.log('Nettoyage du localStorage des configurations de tâches');
    
    // Récupérer toutes les clés du localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    
    // Filtrer les clés liées aux configurations de tâches
    const taskConfigKeys = keys.filter(key => 
      key.startsWith('task_information_config_') ||
      key.startsWith('task_resource_config_') ||
      key.startsWith('task_habilitation_config_') ||
      key.startsWith('task_planification_config_') ||
      key.startsWith('task_condition_config_') ||
      key.startsWith('task_notification_config_')
    );
    
    // Supprimer toutes les configurations de tâches
    taskConfigKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`${taskConfigKeys.length} configurations de tâches supprimées du localStorage`);
  };
  
  // Initialiser les données BPMN
  useEffect(() => {
    if (sharedData && sharedData.processElements) {
      console.log("Données du diagramme chargées:", sharedData.processElements);
      
      // Vider le localStorage avant de charger un nouveau modèle BPMN
      clearTaskConfigurationsFromLocalStorage();
      
      setBpmnData(sharedData.processElements);
    }
  }, [sharedData]);

  // Mettre à jour le diagramme lorsque les données BPMN ou la direction changent
  useEffect(() => {
    if (bpmnData) {
      const { nodes, edges } = transformBpmnToXyflow(bpmnData, direction);
      setNodes(nodes);
      setEdges(edges);
      
      // Initialiser également le diagramme du bas
      setLowerNodes(nodes);
      setLowerEdges(edges);
      
      if (breadcrumb.length > 0) {
        const currentSubProcess = getCurrentSubProcessFromBreadcrumb(breadcrumb);
        if (currentSubProcess) {
          const { nodes, edges } = createSubProcessElements(currentSubProcess);
          setCurrentSubProcessNodes(nodes);
          setCurrentSubProcessEdges(edges);
        }
      }
      
      if (lowerBreadcrumb.length > 0) {
        const currentSubProcess = getCurrentSubProcessFromBreadcrumb(lowerBreadcrumb);
        if (currentSubProcess) {
          const { nodes, edges } = createSubProcessElements(currentSubProcess);
          setLowerNodes(nodes);
          setLowerEdges(edges);
        }
      }
    }
  }, [bpmnData, direction, breadcrumb, lowerBreadcrumb, transformBpmnToXyflow, getCurrentSubProcessFromBreadcrumb, createSubProcessElements]);

  // Mettre à jour les activités
  useEffect(() => {
    if (bpmnData && Array.isArray(bpmnData.tasks)) {
      // Créer des activités à partir des tâches du processus
      const activitiesFromTasks = bpmnData.tasks.map(task => ({
        id: task.id,
        title: task.name || "Tâche sans nom",
        date: new Date().toISOString(), // Date fictive
        type: "task"
      }));
      setActivities(activitiesFromTasks);
    }
  }, [bpmnData]);
  
  // Charger les configurations de tâches existantes en mode mise à jour
  useEffect(() => {
    if (isUpdateMode && sharedData && sharedData.loadedTaskConfigurations) {
      const taskConfigurations = sharedData.loadedTaskConfigurations;
      
      // Parcourir toutes les configurations de tâches et les stocker dans le localStorage
      taskConfigurations.forEach(config => {
        const taskId = config.taskId;
        
        // Stocker les différentes configurations dans le localStorage
        if (config.resource) {
          localStorage.setItem(`task_resource_config_${taskId}`, JSON.stringify(config.resource));
        }
        if (config.information) {
          localStorage.setItem(`task_information_config_${taskId}`, JSON.stringify(config.information));
        }
        if (config.habilitation) {
          localStorage.setItem(`task_habilitation_config_${taskId}`, JSON.stringify(config.habilitation));
        }
        if (config.planification) {
          localStorage.setItem(`task_planification_config_${taskId}`, JSON.stringify(config.planification));
        }
        if (config.condition) {
          localStorage.setItem(`task_condition_config_${taskId}`, JSON.stringify(config.condition));
        }
        if (config.notification) {
          localStorage.setItem(`task_notification_config_${taskId}`, JSON.stringify(config.notification));
        }
      });
      
      console.log('Configurations de tâches chargées avec succès');
    }
  }, [isUpdateMode, sharedData]);

  const tabItems = [
    { id: "InformationGeneral", title: t("__inf_gen_tabs_"), content: <InformationGeneral selectedTask={selectedEvent} /> },
    { id: "Habilitation", title: t("__habi_tabs__"), content: <Habilitation selectedTask={selectedEvent} /> },
    { id: "Planification", title: t("__planf_tabs__"), content: <Planification selectedTask={selectedEvent} /> },
    { id: "ressource", title: t("__ressour_tabs__"), content: <Ressource selectedTask={selectedEvent} /> },
    { id: "condition", title: t("__condition_tabs_"), content: <Condition selectedTask={selectedEvent} /> },
    { id: "notification", title: t("__notifi_tabs_"), content: <Notifications selectedTask={selectedEvent} /> },
  ];
  const connectionLineStyle = { stroke: "white" };

  return (
    <>
      <div className="row">
        <div className="col-6">
            <Card title={t("__diag__activite")} style={styles.card}>
              {/* Fil d'Ariane pour le diagramme du bas */}
              {lowerBreadcrumb.length > 0 && (
                <BpmnBreadcrumb 
                  breadcrumb={lowerBreadcrumb} 
                  navigateToBreadcrumbLevel={navigateToLowerBreadcrumbLevel} 
                />
              )}
              
              {/* Diagramme du bas */}
              <div style={{ height: "1050px", width: "100%"  }}>
                <ReactFlow
                  nodes={lowerBreadcrumb.length > 0 ? lowerNodes : nodes}
                  edges={lowerBreadcrumb.length > 0 ? lowerEdges : edges}
                  fitView
                  minZoom={0.1}
                  connectionLineStyle={connectionLineStyle}
                  maxZoom={1.5}
                  onNodeClick={(event, node) => {
                    // Gérer le clic sur un nœud
                    if (node.type === "subProcess") {
                      if (lowerBreadcrumb.length > 0) {
                        handleLowerNestedSubProcessClick(node.id);
                      } else {
                        handleLowerDiagramSubProcessClick(node.id);
                      }
                    } else {
                      // Sélectionner d'autres types de nœuds
                      const taskData = {
                        id: node.id,
                        name: node.data.label,
                        type: node.type,
                        data: node.data || {}
                      };
                      console.log('Tâche sélectionnée:', taskData);
                      setSelectedEvent(taskData);
                    }
                  }}
                >
                  <Controls />
                  <Background color="#f8f8f8" gap={16} />
                </ReactFlow>
              </div>
            </Card>
        </div>
        <div className="col-6">
          <NormalTabs
            items={tabItems}
            title={selectedEvent ? `${t("parametrage_des_activites")} - ${selectedEvent.name}` : t("parametrage_des_activites")}
          />
         
          {selectedEvent && (
            <div className="d-flex justify-content-end mt-3">
              <button 
                className="btn btn-outline-danger mr-2" 
                onClick={() => {
                  const loadingToast = toast.loading(t("Réinitialisation en cours..."));
                  
                  // Réinitialiser la configuration de la tâche sélectionnée
                  const taskId = selectedEvent.id;
                  localStorage.removeItem(`task_resource_config_${taskId}`);
                  localStorage.removeItem(`task_information_config_${taskId}`);
                  localStorage.removeItem(`task_habilitation_config_${taskId}`);
                  localStorage.removeItem(`task_planification_config_${taskId}`);
                  localStorage.removeItem(`task_condition_config_${taskId}`);
                  localStorage.removeItem(`task_notification_config_${taskId}`);
                  
                  // Forcer la mise à jour du composant en changeant de tâche et en revenant
                  setSelectedEvent(null);
                  setTimeout(() => {
                    setSelectedEvent(selectedEvent);
                    toast.success(t("Configuration réinitialisée avec succès !"));
                    toast.dismiss(loadingToast);
                  }, 100);
                }}
              >
                {t("Réinitialiser la configuration")}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const loadingToast = toast.loading(t("Sauvegarde en cours..."));
                  
                  // Récupérer toutes les configurations des tâches
                  const allTaskConfigurations = [];
                  
                  // Si une tâche est sélectionnée, ajouter sa configuration
                  if (selectedEvent) {
                    const taskId = selectedEvent.id;
                    const taskConfig = {
                      taskId: taskId,
                      taskName: selectedEvent.name,
                      taskType: selectedEvent.type,
                      resource: JSON.parse(localStorage.getItem(`task_resource_config_${taskId}`) || '{}'),
                      information: JSON.parse(localStorage.getItem(`task_information_config_${taskId}`) || '{}'),
                      habilitation: JSON.parse(localStorage.getItem(`task_habilitation_config_${taskId}`) || '{}'),
                      planification: JSON.parse(localStorage.getItem(`task_planification_config_${taskId}`) || '{}'),
                      condition: JSON.parse(localStorage.getItem(`task_condition_config_${taskId}`) || '{}'),
                      notification: JSON.parse(localStorage.getItem(`task_notification_config_${taskId}`) || '{}')
                    };
                    allTaskConfigurations.push(taskConfig);
                  }
                  
                  // Récupérer toutes les tâches du modèle BPMN
                  if (bpmnData && bpmnData.tasks) {
                    bpmnData.tasks.forEach(task => {
                      // Ne pas ajouter à nouveau la tâche sélectionnée
                      if (selectedEvent && task.id === selectedEvent.id) return;
                      
                      const taskId = task.id;
                      // Vérifier si des configurations existent pour cette tâche
                      const hasConfigs = [
                        localStorage.getItem(`task_resource_config_${taskId}`),
                        localStorage.getItem(`task_information_config_${taskId}`),
                        localStorage.getItem(`task_habilitation_config_${taskId}`),
                        localStorage.getItem(`task_planification_config_${taskId}`),
                        localStorage.getItem(`task_condition_config_${taskId}`),
                        localStorage.getItem(`task_notification_config_${taskId}`)
                      ].some(config => config !== null);
                      
                      if (hasConfigs) {
                        const taskConfig = {
                          taskId: taskId,
                          taskName: task.name || taskId,
                          taskType: task.type || 'unknown',
                          resource: JSON.parse(localStorage.getItem(`task_resource_config_${taskId}`) || '{}'),
                          information: JSON.parse(localStorage.getItem(`task_information_config_${taskId}`) || '{}'),
                          habilitation: JSON.parse(localStorage.getItem(`task_habilitation_config_${taskId}`) || '{}'),
                          planification: JSON.parse(localStorage.getItem(`task_planification_config_${taskId}`) || '{}'),
                          condition: JSON.parse(localStorage.getItem(`task_condition_config_${taskId}`) || '{}'),
                          notification: JSON.parse(localStorage.getItem(`task_notification_config_${taskId}`) || '{}')
                        };
                        allTaskConfigurations.push(taskConfig);
                      }
                    });
                  }
                  console.log(1);
                  
                  
                  console.log('SharedData:', sharedData);
                  console.log('ModelerRef exists:', sharedData && sharedData.modelerRef);
                  console.log('ModelerRef.current exists:', sharedData && sharedData.modelerRef && sharedData.modelerRef.current);
                  
                  // Récupérer le modèle BPMN depuis le modeler
                  if (sharedData && sharedData.modelerRef && sharedData.modelerRef.current) {
                    const modeler = sharedData.modelerRef.current;
                    
                    // Exporter le modèle BPMN en XML
                    modeler.saveXML({ format: true }, (err, xml) => {
                      if (err) {
                        console.error('Erreur lors de l\'export du modèle BPMN:', err);
                        toast.error(t("Erreur lors de l'export du modèle BPMN"));
                        toast.dismiss(loadingToast);
                        return;
                      }
                  console.log(1);
                      
                      const bpmnData = { xml };
                      console.log('Modèle BPMN exporté avec succès');
                      
                      // Envoyer le modèle BPMN et les configurations au backend
                      const saveOrUpdate = () => {
                        if (isUpdateMode && bpmnId) {
                          return BpmnModelService.updateBpmnModel(bpmnId, bpmnData, allTaskConfigurations);
                        } else {
                          return BpmnModelService.saveBpmnModel(bpmnData, allTaskConfigurations);
                        }
                      };
                      
                      saveOrUpdate()
                        .then(response => {
                          console.log('Réponse du serveur:', response.data);
                          toast.success(t(isUpdateMode ? "Modèle BPMN mis à jour avec succès !" : "Modèle BPMN sauvegardé avec succès !"));
                          
                          // Appeler le callback de succès si fourni
                          if (onSaveSuccess) {
                            onSaveSuccess(response.data);
                          }
                        })
                        .catch(error => {
                          console.error('Erreur lors de l\'envoi des données:', error);
                          toast.error(t("Erreur lors de la sauvegarde du modèle BPMN"));
                        })
                        .finally(() => {
                          toast.dismiss(loadingToast);
                        });
                    });
                  } else {
                    console.error('Modeler BPMN non disponible');
                    toast.error(t("Modèle BPMN non disponible"));
                    toast.dismiss(loadingToast);
                  }
                }}
              >
                {t(isUpdateMode ? "Mettre à jour le modèle" : "Valider la configuration")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Parametres;
