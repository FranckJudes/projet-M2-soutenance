import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card } from '../../../components/Card.jsx';
import { styles } from '../../../utils/styles.jsx';
import { useTranslation } from 'react-i18next';
import { NormalTabs } from "../../../components/Tabs.jsx";
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
// import ProcessExecutionService from '../../../services/ProcessExecutionService';
import ProcessEngineService from '../../../services/ProcessEngineService';
import WebSocketService from '../../../services/WebSocketService';
import { 
  mapPlanificationToBackend,
  mapNotificationToBackend,
  mapConditionToBackend,
  mapResourceToBackend
} from '../../../utils/configurationMappers';

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
  
  // RÉFÉRENCES pour les composants InformationGeneral et Habilitation
  const informationGeneralRef = useRef();
  const habilitationRef = useRef();
  const planificationRef = useRef();
  const ressourceRef = useRef();
  const notificationsRef = useRef();

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

  // États pour l'automatisation
  const [isProcessDeployed, setIsProcessDeployed] = useState(false);
  const [processDefinitionKey, setProcessDefinitionKey] = useState(null);
  const [deployOnSave, setDeployOnSave] = useState(true); // État pour contrôler si on déploie lors de la sauvegarde

  // Configuration pour le layout du diagramme
  const nodeWidth = 172;
  const nodeHeight = 36;

  // NOUVELLE FONCTION pour valider les données d'information actuelles
  const validateCurrentTaskInformation = () => {
    if (selectedEvent && informationGeneralRef.current) {
      const validation = informationGeneralRef.current.validateData();
      
      if (!validation.isValid) {
        console.error('Données incomplètes pour la tâche actuelle:', validation.errors);
        toast.error(t('Veuillez remplir tous les champs obligatoires pour la tâche sélectionnée'));
        return false;
      }
      
      console.log('Données valides pour la tâche actuelle:', validation.data);
      return true;
    }
    
    return true; // Pas de tâche sélectionnée, validation OK
  };

  // NOUVELLE FONCTION pour valider les données d'habilitation
  const validateCurrentTaskHabilitation = () => {
    if (selectedEvent && habilitationRef.current) {
      const validation = habilitationRef.current.validateData();
      
      if (!validation.isValid) {
        console.warn('Avertissement sur les données d\'habilitation pour la tâche actuelle:', validation.errors);
        // Afficher un avertissement mais ne pas bloquer la soumission
        toast.error(t('Certains détails du point de contrôle sont manquants mais la soumission est autorisée'));
        return true; // Permettre la soumission même avec des avertissements
      }
      
      console.log('Données d\'habilitation valides pour la tâche actuelle:', validation.data);
      return true;
    }
    
    return true; // Pas de tâche sélectionnée, validation OK
  };

  const getNotificationData = (taskId) => {
    // Si c'est la tâche actuellement sélectionnée, récupérer depuis le composant
    if (selectedEvent && selectedEvent.id === taskId && notificationsRef.current) {
      const data = notificationsRef.current.getNotificationData();
      if (data) {
        console.log(`Données notification récupérées depuis le composant pour ${taskId}:`, data);
        return data;
      }
    }
    
    // Sinon, récupérer depuis le localStorage (pour les autres tâches)
    try {
      const savedConfig = localStorage.getItem(`task_notification_config_${taskId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Transformer la configuration localStorage vers le format backend
        let sensitivity = 'public';
        switch (config.selectedPriority) {
          case 1:
            sensitivity = 'public';
            break;
          case 2:
            sensitivity = 'confidential';
            break;
          default:
            sensitivity = 'public';
        }
  
        // Extraire le premier rappel comme reminderBeforeDeadline
        let reminderBeforeDeadline = null;
        if (config.selectedReminders && config.selectedReminders.length > 0) {
          const firstReminder = config.selectedReminders[0];
          reminderBeforeDeadline = extractMinutesFromReminder(firstReminder.value);
        }
  
        const data = {
          notifyOnCreation: config.notificationByAttribution || false,
          notifyOnDeadline: config.alertEscalade || false,
          reminderBeforeDeadline: reminderBeforeDeadline,
          notificationSensitivity: sensitivity,
          selectedReminders: config.selectedReminders || []
        };
        
        console.log(`Données notification récupérées depuis localStorage pour ${taskId}:`, data);
        return data;
      }
    } catch (error) {
      console.error(`Erreur récupération config notification pour ${taskId}:`, error);
    }
    
    // Valeurs par défaut si aucune donnée trouvée
    return {
      notifyOnCreation: false,
      notifyOnDeadline: false,
      reminderBeforeDeadline: null,
      notificationSensitivity: 'public',
      selectedReminders: []
    };
  };
  
  // Fonction utilitaire pour extraire les minutes d'un rappel
  const extractMinutesFromReminder = (reminderValue) => {
    if (!reminderValue) return null;
    
    // Mapping des valeurs vers des minutes
    const reminderMapping = {
      [t("minutesBefore")]: 15,
      [t("oneHourBefore")]: 60,
      [t("hoursBefore.2")]: 120,
      [t("hoursBefore.3")]: 180,
      [t("hoursBefore.4")]: 240,
      [t("oneDayBefore")]: 1440,
      [t("daysBefore.2")]: 2880,
      [t("daysBefore.3")]: 4320,
      [t("oneWeekBefore")]: 10080,
      [t("weeksBefore.2")]: 20160,
      [t("oneMonthBefore")]: 43200
    };
  
    return reminderMapping[reminderValue] || null;
  };
  

  // NOUVELLE FONCTION pour récupérer les données d'information
  const getInformationData = (taskId) => {
    // Si c'est la tâche actuellement sélectionnée, récupérer depuis le composant
    if (selectedEvent && selectedEvent.id === taskId && informationGeneralRef.current) {
      const data = informationGeneralRef.current.getInformationData();
      if (data) {
        console.log(`Données information récupérées depuis le composant pour ${taskId}:`, data);
        return data;
      }
    }
    
    // Sinon, récupérer depuis le localStorage (pour les autres tâches)
    try {
      const savedConfig = localStorage.getItem(`task_information_config_${taskId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        const data = {
          board: config.board || '',
          workInstructions: config.instructions || '',
          expectedDeliverable: config.results || '',
          category: config.category || null
        };
        console.log(`Données information récupérées depuis localStorage pour ${taskId}:`, data);
        return data;
      }
    } catch (error) {
      console.error(`Erreur récupération config tâche ${taskId}:`, error);
    }
    
    // Valeurs par défaut si aucune donnée trouvée
    return {
      board: '',
      workInstructions: '',
      expectedDeliverable: '',
      category: null
    };
  };

  const getPlanificationData = (taskId) => {
    // Si c'est la tâche actuellement sélectionnée, récupérer depuis le composant
    if (selectedEvent && selectedEvent.id === taskId && planificationRef.current) {
      const data = planificationRef.current.getPlanificationData();
      if (data) {
        console.log(`Données planification récupérées depuis le composant pour ${taskId}:`, data);
        return data;
      }
    }
    
    // Sinon, récupérer depuis le localStorage (pour les autres tâches)
    try {
      const savedConfig = localStorage.getItem(`task_planification_config_${taskId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Transformer la configuration localStorage vers le format backend
        const data = {
          allDay: config.toutJournee || false,
          durationValue: config.delayValue ? parseInt(config.delayValue, 10) : null,
          durationUnit: config.delayUnit || 'Minutes',
          criticality: config.criticite || '1',
          priority: config.priority || '1',
          viewHistoryEnabled: config.consultationHistorique || false,
          
          // KPIs
          kpiTasksProcessed: config.nombreTachesTraitees || false,
          kpiReturnRate: config.tauxRetourTachesTraitees || false,
          kpiAvgInteractions: config.nombreInteractionsMoyensTachesTraitees || false,
          kpiDeadlineCompliance: config.respectDelais || false,
          kpiValidationWaitTime: config.tempsAttenteValidation || false,
          kpiPriorityCompliance: config.respectPriorites || false,
          kpiEmergencyManagement: config.gestionUrgences || false,
          
          // Actions alternatives
          notifierSuperviseur: config.notifier_superviseur || false,
          reassignerTache: config.reassigner_tache || false,
          envoyerRappel: config.envoyerRappel || false,
          escaladeHierarchique: config.escaladeHierarchique || false,
          changementPriorite: config.changementPriorite || false,
          bloquerWorkflow: config.bloquerWorkflow || false,
          genererAlerteEquipe: config.genererAlerteEquipe || false,
          demanderJustification: config.demanderJustification || false,
          activerActionCorrective: config.activerActionCorrective || false,
          escaladeExterne: config.escaladeExterne || false,
          cloturerDefaut: config.cloturerDefaut || false,
          suiviParKpi: config.suiviParKpi || false,
          planBOuTacheAlternative: config.planBOuTacheAlternative || false
        };
        
        console.log(`Données planification récupérées depuis localStorage pour ${taskId}:`, data);
        return data;
      }
    } catch (error) {
      console.error(`Erreur récupération config planification pour ${taskId}:`, error);
    }
    
    // Valeurs par défaut si aucune donnée trouvée
    return {
      allDay: false,
      durationValue: null,
      durationUnit: 'Minutes',
      criticality: '1',
      priority: '1',
      viewHistoryEnabled: false,
      kpiTasksProcessed: false,
      kpiReturnRate: false,
      kpiAvgInteractions: false,
      kpiDeadlineCompliance: false,
      kpiValidationWaitTime: false,
      kpiPriorityCompliance: false,
      kpiEmergencyManagement: false,
      notifierSuperviseur: false,
      reassignerTache: false,
      envoyerRappel: false,
      escaladeHierarchique: false,
      changementPriorite: false,
      bloquerWorkflow: false,
      genererAlerteEquipe: false,
      demanderJustification: false,
      activerActionCorrective: false,
      escaladeExterne: false,
      cloturerDefaut: false,
      suiviParKpi: false,
      planBOuTacheAlternative: false
    };
  };

  // NOUVELLE FONCTION pour récupérer les données de ressource
const getResourceData = (taskId) => {
  // Si c'est la tâche actuellement sélectionnée, récupérer depuis le composant
  if (selectedEvent && selectedEvent.id === taskId && ressourceRef.current) {
    const data = ressourceRef.current.getResourceData();
    if (data) {
      console.log(`Données ressource récupérées depuis le composant pour ${taskId}:`, data);
      return data;
    }
  }
  
  // Sinon, récupérer depuis le localStorage (pour les autres tâches)
  try {
    const savedConfig = localStorage.getItem(`task_resource_config_${taskId}`);
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      
      // Transformer la configuration localStorage vers le format backend
      const data = {
        attachmentsEnabled: config.hasAttachement || false,
        attachmentType: config.selectedNode ? config.selectedNode.id : null,
        securityLevel: config.securityLevel || null,
        externalTools: config.externalTools || null,
        linkToOtherTask: config.linkToOtherTask || null,
        scriptBusinessRule: config.scriptRegleMetier || false,
        addFormResource: config.addFormResource || false,
        
        // Actions communes
        archiveAttachment: config.archiv_attach || false,
        shareArchivePdf: config.share_achiv_pdf || false,
        describeFolderDoc: config.decribe_fol_doc || false,
        deleteAttachmentDoc: config.delete_attach_doc || false,
        consultAttachmentDoc: config.consulter_attach_doc || false,
        downloadZip: config.download_zip || false,
        
        // Actions spécifiques aux documents
        importAttachment: config.import_attach || false,
        editAttachment: config.edit_attach || false,
        annotateDocument: config.annoter_doc || false,
        verifyAttachmentDoc: config.verif_attach_doc || false,
        searchInDocument: config.rechercher_un_doc || false,
        removeDocument: config.retirer_un_doc || false,
        addNewAttachment: config.add_new_attach || false,
        convertAttachmentPdf: config.conver_attach_pdf || false,
        downloadAttachmentPdf: config.download_attach_pdf || false,
        downloadOriginalFormat: config.download_original_format || false
      };
      
      console.log(`Données ressource récupérées depuis localStorage pour ${taskId}:`, data);
      return data;
    }
  } catch (error) {
    console.error(`Erreur récupération config ressource pour ${taskId}:`, error);
  }
  
  // Valeurs par défaut si aucune donnée trouvée
  return {
    attachmentsEnabled: false,
    attachmentType: null,
    securityLevel: null,
    externalTools: null,
    linkToOtherTask: null,
    scriptBusinessRule: false,
    addFormResource: false,
    
    // Actions communes
    archiveAttachment: false,
    shareArchivePdf: false,
    describeFolderDoc: false,
    deleteAttachmentDoc: false,
    consultAttachmentDoc: false,
    downloadZip: false,
    
    // Actions spécifiques aux documents
    importAttachment: false,
    editAttachment: false,
    annotateDocument: false,
    verifyAttachmentDoc: false,
    searchInDocument: false,
    removeDocument: false,
    addNewAttachment: false,
    convertAttachmentPdf: false,
    downloadAttachmentPdf: false,
    downloadOriginalFormat: false
  };
};
  // NOUVELLE FONCTION pour récupérer les données d'habilitation
  const getHabilitationData = (taskId) => {
    // Si c'est la tâche actuellement sélectionnée, récupérer depuis le composant
    if (selectedEvent && selectedEvent.id === taskId && habilitationRef.current) {
      const data = habilitationRef.current.getHabilitationData();
      if (data) {
        console.log(`Données habilitation récupérées depuis le composant pour ${taskId}:`, data);
        return data;
      }
    }
    
    // Sinon, récupérer depuis le localStorage (pour les autres tâches)
    try {
      const savedConfig = localStorage.getItem(`task_habilitation_config_${taskId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Transformer la configuration localStorage vers le format backend
        let assigneeType = null;
        let assignedUser = null;
        let assignedEntity = null;
        let assignedGroup = null;
        let interestedUser = null;
        let responsibleUser = null;

        // Assignation utilisateur principal
        if (config.isChecked && config.selectedUser) {
          assignedUser = config.selectedUser;
          assigneeType = 'user';
        }

        // Assignation entité
        if (config.entity && config.selectedEntity) {
          assignedEntity = config.selectedEntity;
          if (!assigneeType) assigneeType = 'entity';
        }

        // Assignation groupe
        if (config.groupUser && config.selectedGroup) {
          assignedGroup = config.selectedGroup;
          if (!assigneeType) assigneeType = 'group';
        }

        // Personne intéressée
        if (config.persInteress && config.selectedInterestedUser) {
          interestedUser = config.selectedInterestedUser;
        }

        // Responsable pour point de contrôle
        if (config.selectPointControl && config.checkPointDetails) {
          responsibleUser = config.checkPointDetails;
        }

        const data = {
          assignedEntity: assignedEntity,
          returnAllowed: config.possReturn || false,
          assignedUser: assignedUser,
          assignedGroup: assignedGroup,
          responsibleUser: responsibleUser,
          interestedUser: interestedUser,
          assigneeType: assigneeType
        };
        
        console.log(`Données habilitation récupérées depuis localStorage pour ${taskId}:`, data);
        return data;
      }
    } catch (error) {
      console.error(`Erreur récupération config habilitation pour ${taskId}:`, error);
    }
    
    // Valeurs par défaut si aucune donnée trouvée
    return {
      assignedEntity: null,
      returnAllowed: false,
      assignedUser: null,
      assignedGroup: null,
      responsibleUser: null,
      interestedUser: null,
      assigneeType: null
    };
  };
 

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
    
    // Extraire les éléments BPMN de data.data si la structure est {success, message, data}
    const bpmnElements = data.data ? data.data : data;
    
    const nodes = [];
    const edges = [];

    // Ajouter les tâches qui ne sont pas dans un sous-processus
    if (Array.isArray(bpmnElements.tasks)) {
      bpmnElements.tasks.forEach((task) => {
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
    if (Array.isArray(bpmnElements.events)) {
      bpmnElements.events.forEach((event) => {
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
    if (Array.isArray(bpmnElements.gateways)) {
      bpmnElements.gateways.forEach((gateway) => {
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
    if (Array.isArray(bpmnElements.subProcesses)) {
      bpmnElements.subProcesses.forEach((subProcess) => {
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
    if (Array.isArray(bpmnElements.sequenceFlows)) {
      bpmnElements.sequenceFlows.forEach((flow) => {
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
    console.log("sharedData reçu:", sharedData);
    
    if (sharedData && sharedData.processElements) {
      console.log("Données du diagramme chargées:", sharedData.processElements);
      
      // Extraire les éléments BPMN de processElements.data si la structure est {success, message, data}
      const bpmnElements = sharedData.processElements.data ? sharedData.processElements.data : sharedData.processElements;
      
      // Vérifier la structure des données
      if (!Array.isArray(bpmnElements.tasks)) {
        console.warn("Aucune tâche trouvée dans processElements");
      } else {
        console.log(`Nombre de tâches chargées: ${bpmnElements.tasks.length}`);
      }
      
      // Vider le localStorage avant de charger un nouveau modèle BPMN
      clearTaskConfigurationsFromLocalStorage();
      
      setBpmnData(bpmnElements);
    } else {
      console.warn("Aucune donnée de diagramme trouvée dans sharedData");
    }
  }, [sharedData]);

  // Mettre à jour le diagramme lorsque les données BPMN ou la direction changent
  useEffect(() => {
    if (bpmnData) {
      const { nodes, edges } = transformBpmnToXyflow(bpmnData, direction);
      console.log('Nœuds générés pour ReactFlow:', nodes);
      console.log('Arêtes générées pour ReactFlow:', edges);
      
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

  // MODIFICATION DES TAB ITEMS avec les références
  const tabItems = [
    { 
      id: "InformationGeneral", 
      title: t("__inf_gen_tabs_"), 
      content: <InformationGeneral ref={informationGeneralRef} selectedTask={selectedEvent} /> 
    },
    { 
      id: "Habilitation", 
      title: t("__habi_tabs__"), 
      content: <Habilitation ref={habilitationRef} selectedTask={selectedEvent} /> 
    },
    { 
      id: "Planification", 
      title: t("__planf_tabs__"), 
      content: <Planification ref={planificationRef} selectedTask={selectedEvent} /> 
    },
        
    { 
      id: "ressource", 
      title: t("__ressour_tabs__"), 
      content: <Ressource ref={ressourceRef} selectedTask={selectedEvent} /> 
    },
    { id: "condition", title: t("__condition_tabs_"), content: <Condition selectedTask={selectedEvent} /> },
    { 
      id: "notification", 
      title: t("__notifi_tabs_"), 
      content: <Notifications ref={notificationsRef} selectedTask={selectedEvent} /> 
    },
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
            <div className="d-flex justify-content-end mt-4">
              {/* Option de déploiement */}
              <div className="form-check form-switch me-3 d-flex align-items-center">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  id="deployOnSaveSwitch"
                  checked={deployOnSave}
                  onChange={(e) => setDeployOnSave(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label" htmlFor="deployOnSaveSwitch" style={{ cursor: 'pointer' }}>
                  {t("Déployer vers Camunda")}
                </label>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  const loadingToast = toast.loading(t("Sauvegarde en cours..."));
                  
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
                onClick={async () => {
                  // NOUVELLES VALIDATIONS avant sauvegarde
                  if (!validateCurrentTaskInformation()) {
                    return; // Arrêter la sauvegarde si validation échoue
                  }
                  
                  if (!validateCurrentTaskHabilitation()) {
                    return; // Arrêter la sauvegarde si validation habilitation échoue
                  }
                  
                  const loadingToast = toast.loading(t("Sauvegarde en cours..."));
                  
                  try {
                    // 1. Valider que le modeler est disponible
                    if (!sharedData?.modelerRef?.current) {
                      throw new Error("Modeler BPMN non disponible");
                    }

                    // 2. Récupérer le XML BPMN en utilisant la même approche que handleDownloadXML
                    console.log("Exportation du XML BPMN...");
                    let xmlContent;
                    try {
                      xmlContent = await sharedData.modelerRef.current.saveXML({ format: true });
                      console.log('XML BPMN exporté avec succès');
                    } catch (err) {
                      console.error('Erreur lors de l\'export XML:', err);
                      throw new Error("Erreur lors de l'export du modèle BPMN");
                    }

                    // Vérifier que le XML est bien récupéré
                    if (!xmlContent || !xmlContent.xml) {
                      console.error('XML non récupéré correctement:', xmlContent);
                      throw new Error("Format XML invalide");
                    }

                    console.log('Début XML récupéré:', xmlContent.xml.substring(0, 100) + '...');

                    // 3. Récupérer les configurations des tâches
                    console.log("Récupération des configurations des tâches...");
                    const allTaskConfigurations = [];
                    
                    if (bpmnData?.tasks) {
                      for (const task of bpmnData.tasks) {
                        const taskId = task.id;
                        try {
                          // Fonction sécurisée pour récupérer les données du localStorage
                          const getConfigFromStorage = (key) => {
                            try {
                              const value = localStorage.getItem(key);
                              return value ? JSON.parse(value) : {};
                            } catch (e) {
                              console.warn(`Erreur parsing ${key}:`, e);
                              return {};
                            }
                          };

                          // Récupérer les configurations brutes du localStorage pour les autres modules
                          const rawPlanification = getConfigFromStorage(`task_planification_config_${taskId}`);
                          const rawResource = getConfigFromStorage(`task_resource_config_${taskId}`);
                          const rawCondition = getConfigFromStorage(`task_condition_config_${taskId}`);
                          const rawNotification = getConfigFromStorage(`task_notification_config_${taskId}`);
                          
                          // NOUVELLES MÉTHODES pour récupérer les données d'information et d'habilitation
                          const informationData = getInformationData(taskId);
                          const habilitationData = getHabilitationData(taskId);
                          const planificationData = getPlanificationData(taskId);
                          const resourceData = getResourceData(taskId);
                          const notificationData = getNotificationData(taskId);

                          // Transformer les configurations pour qu'elles correspondent au format attendu par le backend
                          const mappedPlanification = mapPlanificationToBackend(rawPlanification);
                          const mappedResource = mapResourceToBackend(rawResource);
                          const mappedCondition = mapConditionToBackend(rawCondition);
                          const mappedNotification = mapNotificationToBackend(rawNotification);
                          
                          const taskConfig = {
                            taskId: taskId,
                            taskName: task.name || taskId,
                            taskType: task.type || 'task',
                            resource: resourceData, // Utiliser directement les données récupérées
                            information: informationData, // Utiliser directement les données récupérées
                            habilitation: habilitationData, // Utiliser directement les données récupérées
                            planification: planificationData, // Utiliser directement les données récupérées
                            condition: mappedCondition,
                            notification: notificationData // Utiliser directement les données récupérées
                          };
                          allTaskConfigurations.push(taskConfig);
                        } catch (error) {
                          console.error(`Erreur configuration tâche ${taskId}:`, error);
                        }
                      }
                    }

                    console.log('Configurations des tâches:', allTaskConfigurations);

                   // 4. Préparer les données du processus depuis sharedData
                    console.log("Récupération des données du processus...");
                    const processData = sharedData?.processData || {};

                    // Logs détaillés sur l'état de sharedData
                    console.log("🔍 PARAMETRES - État complet de sharedData:", {
                        hasSharedData: !!sharedData,
                        hasProcessData: !!sharedData?.processData,
                        sharedDataKeys: sharedData ? Object.keys(sharedData) : 'null',
                        processDataKeys: sharedData?.processData ? Object.keys(sharedData.processData) : 'null',
                        fullSharedData: sharedData
                    });

                    console.log("🔍 PARAMETRES - Données du processus reçues:", {
                        processName: processData.processName,
                        processDescription: processData.processDescription,
                        processTags: processData.processTags,
                        processImagesCount: processData.processImages?.length || 0,
                        processImageExists: !!processData.processImage,
                        hasImages: (processData.processImages && processData.processImages.length > 0) || !!processData.processImage
                    });

                    // 5. Préparer les données complètes pour l'envoi
                    const completeData = {
                        xml: xmlContent.xml,
                        processInfo: {
                            name: processData.processName || "",
                            description: processData.processDescription || "",
                            tags: processData.processTags || [],
                            processId: processData.processId || null
                        }
                    };
                    
                    // 6. Préparer l'image si elle existe
                    if (processData.processImage) {
                        try {
                            if (processData.processImage instanceof File) {
                                // Créer un FormData pour l'image
                                const imageFormData = new FormData();
                                imageFormData.append('image', processData.processImage);
                                completeData.imageFormData = imageFormData;
                            }
                        } catch (error) {
                            console.error('Erreur lors de la préparation de l\'image:', error);
                        }
                    }
                    
                    // 7. NOUVEAU: Intégration complète avec Camunda Process Engine
                    console.log("completeData", completeData);
                    console.log("allTaskConfigurations", allTaskConfigurations);
                    
                    // 7.1. D'abord sauvegarder le modèle BPMN (pour la compatibilité)
                    let modelResponse;
                    // if (isUpdateMode && bpmnId) {
                    //   console.log("Mode mise à jour pour BPMN ID:", bpmnId);
                    //   modelResponse = await BpmnModelService.updateBpmnModel(
                    //     bpmnId, 
                    //     completeData, 
                    //     allTaskConfigurations
                    //   );
                    // } else {
                    //   console.log("Mode création d'un nouveau modèle");
                    //   modelResponse = await BpmnModelService.saveBpmnModel(
                    //     completeData, 
                    //     allTaskConfigurations
                    //   );
                    // }
                    
                    // console.log("Modèle sauvegardé:", modelResponse.data);
                    // toast.success(t(isUpdateMode ? "Modèle BPMN mis à jour avec succès !" : "Modèle BPMN sauvegardé avec succès !"));
                    
                    // 7.2. Déploiement conditionnel vers Camunda après sauvegarde réussie
                    if (deployOnSave) {
                      try {
                        // Créer un fichier BPMN à partir du XML
                        const bpmnBlob = new Blob([xmlContent.xml], { type: 'application/xml' });
                        const bpmnFile = new File([bpmnBlob], `${completeData.processInfo.name || 'process'}.bpmn`, {
                          type: 'application/xml'
                        });
                        
                        // Transformer les configurations pour le backend Camunda
                        const camundaConfigurations = ProcessEngineService.transformTaskConfigurations(allTaskConfigurations);
                        
                        // Préparer les métadonnées générales du processus
                        const processMetadata = {
                            processName: processData.processName || "",
                            processDescription: processData.processDescription || "",
                            processTags: processData.processTags || [],
                            images: []
                        };

                        // Ajouter l'image principale si elle existe
                        // Support pour processImages (tableau) et processImage (legacy)
                        const imagesToProcess = processData.processImages || (processData.processImage ? [processData.processImage] : []);
                        
                        console.log("🔍 PARAMETRES - Images à traiter:", {
                            imagesCount: imagesToProcess.length,
                            source: processData.processImages ? 'processImages' : (processData.processImage ? 'processImage' : 'none')
                        });
                        
                        if (imagesToProcess.length > 0) {
                            let displayOrder = 0;
                            
                            for (const image of imagesToProcess) {
                                try {
                                    let imageData = null;
                                    let contentType = "";
                                    let fileName = "";
                                    let originalFileName = "";

                                    if (image instanceof File) {
                                        // Convertir le fichier en base64
                                        const reader = new FileReader();
                                        reader.onload = function(e) {
                                            imageData = e.target.result.split(',')[1]; // Enlever le préfixe data:image/...
                                        };
                                        reader.readAsDataURL(image);
                                        
                                        contentType = image.type;
                                        fileName = `${processData.processName || 'process'}_image_${displayOrder + 1}.${image.type.split('/')[1]}`;
                                        originalFileName = image.name;
                                        
                                        // Attendre que la conversion soit terminée
                                        await new Promise(resolve => {
                                            reader.onloadend = resolve;
                                        });
                                        
                                        imageData = reader.result.split(',')[1];
                                    } else if (typeof image === 'string') {
                                        // Si c'est déjà une URL ou base64
                                        imageData = image;
                                        contentType = "image/png"; // Par défaut
                                        fileName = `${processData.processName || 'process'}_image_${displayOrder + 1}.png`;
                                        originalFileName = fileName;
                                    }

                                    if (imageData) {
                                        processMetadata.images.push({
                                            fileName: fileName,
                                            originalFileName: originalFileName,
                                            contentType: contentType,
                                            fileSize: image instanceof File ? image.size : 0,
                                            imageData: imageData,
                                            description: `Image ${displayOrder + 1} du processus ${processData.processName}`,
                                            displayOrder: displayOrder++
                                        });
                                        
                                        console.log(`🔍 PARAMETRES - Image ${displayOrder} ajoutée:`, {
                                            fileName: fileName,
                                            size: image instanceof File ? image.size : 0,
                                            contentType: contentType
                                        });
                                    }
                                } catch (error) {
                                    console.error(`Erreur lors de la préparation de l'image ${displayOrder + 1}:`, error);
                                }
                            }
                            
                            console.log("🔍 PARAMETRES - Toutes les images traitées:", {
                                totalImages: processMetadata.images.length
                            });
                        } else {
                            console.log("==========Aucune image fournie==========");
                        }
                        
                        console.log("Déploiement vers Camunda avec:", {
                          fileName: bpmnFile.name,
                          configurationsCount: camundaConfigurations.length,
                          hasMetadata: processMetadata.processName !== "" || processMetadata.images.length > 0
                        });
                        
                        // Déployer vers Camunda avec les métadonnées
                        const deploymentResponse = await ProcessEngineService.deployProcess(
                          bpmnFile,
                          camundaConfigurations,
                          processMetadata, // Passer les métadonnées générales
                          deployOnSave
                        );
                        
                        console.log("Processus déployé avec succès:", deploymentResponse.data);
                        toast.success(t("Processus déployé avec succès vers Camunda !"));
                        
                        // Stocker les informations de déploiement
                        setProcessDefinitionKey(deploymentResponse.data.processDefinitionKey);
                        setIsProcessDeployed(true);
                        
                        // 7.3. Initialiser les notifications WebSocket pour ce processus
                        try {
                          await WebSocketService.connect();
                          
                          // S'abonner aux notifications de tâches
                          const userId = localStorage.getItem('userId') || 'current-user';
                          WebSocketService.subscribeToTaskAssignments(userId, (notification) => {
                            console.log('Nouvelle assignation de tâche:', notification);
                            toast.success(`Nouvelle tâche assignée: ${notification.taskName}`);
                          });
                          
                          // S'abonner aux mises à jour de processus
                          WebSocketService.subscribeToProcessUpdates((notification) => {
                            console.log('Mise à jour de processus:', notification);
                            if (notification.type === 'PROCESS_STARTED') {
                              toast.success(`Processus démarré: ${notification.processDefinitionKey}`);
                            }
                          });
                          
                          console.log('Notifications WebSocket initialisées pour le processus');
                        } catch (wsError) {
                          console.warn('Erreur lors de l\'initialisation WebSocket:', wsError);
                          // Ne pas faire échouer le déploiement pour un problème WebSocket
                        }
                        
                      } catch (deploymentError) {
                        console.error('Erreur lors du déploiement Camunda:', deploymentError);
                        toast.error(t("Erreur lors du déploiement vers Camunda: " + (deploymentError.message || 'Erreur inconnue')));
                        // Le modèle est sauvegardé mais pas déployé
                      }
                    } else {
                      console.log("Déploiement vers Camunda ignoré selon le choix de l'utilisateur");
                      toast.success(t("Modèle sauvegardé sans déploiement vers Camunda"));
                    }
                    
                    // 9. Appeler le callback de succès si fourni
                    if (onSaveSuccess) {
                      onSaveSuccess(modelResponse.data);
                    }
                  } catch (error) {
                    console.error('Erreur lors de la sauvegarde:', error);
                    toast.error(t(error.message || "Erreur lors de la sauvegarde du modèle BPMN"));
                  } finally {
                    toast.dismiss(loadingToast);
                  }
                }}
              >
                {t(isUpdateMode 
                  ? (deployOnSave ? "Mettre à jour et déployer" : "Mettre à jour sans déployer") 
                  : (deployOnSave ? "Sauvegarder et déployer" : "Sauvegarder sans déployer")
                )}
              </button>

              {/* NOUVEAU: Bouton pour démarrer le processus si déployé */}
              {isProcessDeployed && processDefinitionKey && (
                <button 
                  className="btn btn-success ml-2"
                  onClick={async () => {
                    try {
                      const processVariables = {
                        processName: sharedData?.processData?.processName || "Test Process",
                        initiatedFrom: "WebInterface",
                        timestamp: new Date().toISOString(),
                        userId: localStorage.getItem('userId') || 'current-user'
                      };
                      
                      console.log('Démarrage du processus avec variables:', processVariables);
                      
                      // Utiliser le nouveau ProcessEngineService
                      const result = await ProcessEngineService.startProcess(
                        processDefinitionKey, 
                        processVariables
                      );
                      
                      toast.success(t("Instance de processus démarrée avec succès !"));
                      console.log("Instance Camunda créée:", result);
                      
                      // Optionnel: rediriger vers la liste des tâches
                      // navigate('/tasks');
                      
                    } catch (error) {
                      console.error("Erreur lors du démarrage:", error);
                      toast.error(t("Erreur lors du démarrage du processus: " + (error.message || 'Erreur inconnue')));
                    }
                  }}
                >
                  <i className="fas fa-play mr-1"></i>
                  {t("Démarrer le processus")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Parametres;