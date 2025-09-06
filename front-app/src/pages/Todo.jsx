import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Card,
  Select,
  Button,
  Modal,
  Tag,
  Avatar,
  Tooltip,
  Badge,
  Space,
  Typography,
  Spin,
  message,
  Descriptions,
  Divider,
  Row,
  Col,
  Progress,
  Alert,
  Tabs,
  Radio,
  Input
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HomeOutlined,
  FileZipOutlined,
  SwapOutlined,
  CopyOutlined,
  ShareAltOutlined,
  SnippetsOutlined,
  ArrowUpOutlined,
  InboxOutlined,
  DownloadOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  FireOutlined,
  ThunderboltOutlined,
  BugOutlined,
  CloseOutlined,
  FilterOutlined,
  CalendarOutlined,
  SearchOutlined
} from '@ant-design/icons';
import Main from "../layout/Main";
import UserTaskService from '../services/UserTaskService';
import ProcessEngineService from '../services/ProcessEngineService';
import WebSocketService from '../services/WebSocketService';
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const KanbanBoardAntd = () => {
  const [columns, setColumns] = useState({});
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(() => localStorage.getItem('userId') || 'current-user');
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'todo', 'inprogress', 'done'
  const [processFilter, setProcessFilter] = useState('all'); // 'all' ou processDefinitionKey spécifique
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'deadline'
  // États pour le tri et la recherche
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline', 'priority', 'process', 'title'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  // Liste des processus disponibles
  const [availableProcesses, setAvailableProcesses] = useState([]);
  // Configuration des colonnes
  const columnConfig = {
    'todo': {
      id: 'todo',
      title: 'À faire',
      color: '#1890ff',
      icon: <PlayCircleOutlined />,
      description: 'Tâches en attente'
    },
    'inprogress': {
      id: 'inprogress',
      title: 'En cours',
      color: '#faad14',
      icon: <ThunderboltOutlined />,
      description: 'Tâches en cours de traitement'
    },
    'done': {
      id: 'done',
      title: 'Terminé',
      color: '#52c41a',
      icon: <CheckCircleOutlined />,
      description: 'Tâches complétées'
    }
  };
  // Charger les tâches BPMN d'un utilisateur avec intégration Camunda
  const loadUserBpmnTasks = async (userId) => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des tâches BPMN pour l\'utilisateur:', userId);
      
      // NOUVEAU: Utiliser ProcessEngineService pour récupérer les tâches Camunda
      let bpmnTasks = [];
      try {
        // Récupérer les tâches Camunda assignées à l'utilisateur
        const camundaResponse = await ProcessEngineService.getMyTasks();
        const camundaTasks = camundaResponse.data;
        
        console.log('✅ Tâches Camunda récupérées:', camundaTasks);
        
        // Transformer les tâches Camunda au format attendu
        bpmnTasks = camundaTasks.map(task => ({
          id: task.id,
          name: task.name || task.taskDefinitionKey,
          description: task.description || `Tâche du processus ${task.processDefinitionKey}`,
          assignee: task.assignee,
          created: task.created,
          due: task.due,
          priority: task.priority || 50,
          processInstanceId: task.processInstanceId,
          processDefinitionKey: task.processDefinitionKey,
          taskDefinitionKey: task.taskDefinitionKey,
          variables: task.variables || {},
          status: task.suspended ? 'suspended' : 'active',
          // Mapper vers les statuts Kanban
          kanbanStatus: task.assignee ? 'inprogress' : 'todo'
        }));
        
      } catch (camundaError) {
        console.warn('Erreur lors de la récupération des tâches Camunda, fallback vers UserTaskService:', camundaError);
        
        // Fallback vers l'ancien système
        const response = await UserTaskService.getUserTasksImproved(userId);
        bpmnTasks = response.data;
      }
      
      console.log('✅ Tâches BPMN finales récupérées:', bpmnTasks);
      
      const convertedData = convertBpmnTasksToKanban(bpmnTasks);
      const availableProcesses = extractAvailableProcesses(bpmnTasks);
      
      setColumns(convertedData.columns);
      setTasks(convertedData.tasks);
      setAvailableProcesses(availableProcesses);
      
      message.success(`${bpmnTasks.length} tâches chargées`);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des tâches BPMN:', error);
      message.error('Erreur lors du chargement des tâches: ' + (error.response?.data?.error || error.message));
      
      // Fallback vers des données vides
      setColumns({
        'todo': { ...columnConfig.todo, taskIds: [] },
        'inprogress': { ...columnConfig.inprogress, taskIds: [] },
        'done': { ...columnConfig.done, taskIds: [] }
      });
      setTasks({});
    } finally {
      setLoading(false);
    }
  };
  // Convertir les tâches BPMN en format Kanban
  const convertBpmnTasksToKanban = (bpmnTasks) => {
    const kanbanTasks = {};
    const columns = {
      'todo': { ...columnConfig.todo, taskIds: [] },
      'inprogress': { ...columnConfig.inprogress, taskIds: [] },
      'done': { ...columnConfig.done, taskIds: [] }
    };
    bpmnTasks.forEach(bpmnTask => {
      const kanbanTask = {
        id: bpmnTask.id,
        title: bpmnTask.name || 'Tâche sans titre',
        description: getTaskDescription(bpmnTask),
        assignee: getAssigneeInfo(bpmnTask),
        dueDate: bpmnTask.dueDate ? new Date(bpmnTask.dueDate) : null,
        priority: getPriorityLevel(bpmnTask),
        status: getTaskStatus(bpmnTask),
        labels: getTaskLabels(bpmnTask),
        bpmnData: {
          taskDefinitionKey: bpmnTask.taskDefinitionKey,
          processInstanceId: bpmnTask.processInstanceId,
          processDefinitionId: bpmnTask.processDefinitionId,
          createTime: bpmnTask.createTime,
          suspended: bpmnTask.suspended,
          hasConfiguration: bpmnTask.hasConfiguration,
          taskConfiguration: bpmnTask.taskConfiguration,
          assignedUserInfo: bpmnTask.assignedUserInfo,
          assignedGroupInfo: bpmnTask.assignedGroupInfo,
          assignedEntityInfo: bpmnTask.assignedEntityInfo
        }
      };
      kanbanTasks[bpmnTask.id] = kanbanTask;
      
      const columnId = determineTaskColumn(bpmnTask);
      columns[columnId].taskIds.push(bpmnTask.id);
    });
    return { tasks: kanbanTasks, columns };
  };
  // Extraire les processus uniques des tâches
  const extractAvailableProcesses = (bpmnTasks) => {
    const processes = new Set();
    bpmnTasks.forEach(task => {
      if (task.processDefinitionKey) {
        processes.add(task.processDefinitionKey);
      }
    });
    return Array.from(processes);
  };
  // Utilitaires de conversion
  const getTaskDescription = (bpmnTask) => {
    if (bpmnTask.taskConfiguration?.information?.workInstructions) {
      return bpmnTask.taskConfiguration.information.workInstructions;
    }
    if (bpmnTask.taskConfiguration?.information?.expectedDeliverable) {
      return bpmnTask.taskConfiguration.information.expectedDeliverable;
    }
    return bpmnTask.description || 'Aucune description disponible';
  };
  const getAssigneeInfo = (bpmnTask) => {
    if (bpmnTask.assignedUserInfo) {
      return {
        name: bpmnTask.assignedUserInfo.name,
        id: bpmnTask.assignedUserInfo.id,
        email: bpmnTask.assignedUserInfo.email
      };
    }
    if (bpmnTask.assignee) {
      return {
        name: `Utilisateur ${bpmnTask.assignee}`,
        id: bpmnTask.assignee
      };
    }
    if (bpmnTask.taskConfiguration?.habilitation?.assignedUser) {
      const user = bpmnTask.taskConfiguration.habilitation.assignedUser;
      return {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        id: user.id
      };
    }
    return { name: 'Non assigné', id: null };
  };
  const getPriorityLevel = (bpmnTask) => {
    const priority = bpmnTask.priority || bpmnTask.taskConfiguration?.planification?.priority || 50;
    if (priority >= 80) return 'high';
    if (priority >= 50) return 'medium';
    return 'low';
  };
  const getTaskStatus = (bpmnTask) => {
    if (bpmnTask.suspended) return 'suspended';
    if (bpmnTask.assignee) return 'assigned';
    return 'unassigned';
  };
  const getTaskLabels = (bpmnTask) => {
    const labels = ['BPMN'];
    
    if (bpmnTask.hasConfiguration) labels.push('Configuré');
    if (bpmnTask.suspended) labels.push('Suspendu');
    if (bpmnTask.assignedGroupInfo) labels.push(`Groupe: ${bpmnTask.assignedGroupInfo.name}`);
    if (bpmnTask.assignedEntityInfo) labels.push(`Entité: ${bpmnTask.assignedEntityInfo.name}`);
    
    return labels;
  };
  const determineTaskColumn = (bpmnTask) => {
    if (bpmnTask.suspended) return 'todo';
    if (bpmnTask.assignee) return 'inprogress';
    return 'todo';
  };
  // Gestion du drag & drop
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId &&
        destination.index === source.index) {
      return;
    }
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    if (sourceColumn.id === destColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      setColumns({
        ...columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          taskIds: newTaskIds,
        },
      });
      return;
    }
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };
    const destTaskIds = Array.from(destColumn.taskIds);
    destTaskIds.splice(destination.index, 0, draggableId);
    const newDestColumn = {
      ...destColumn,
      taskIds: destTaskIds,
    };
    setColumns({
      ...columns,
      [newSourceColumn.id]: newSourceColumn,
      [newDestColumn.id]: newDestColumn,
    });
    message.success(`Tâche déplacée vers ${destColumn.title}`);
  };
  // Compléter une tâche
  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTaskId(taskId);
      const task = tasks[taskId];
      
      if (!task || !task.bpmnData) {
        message.error('Impossible de compléter cette tâche');
        return;
      }
      console.log('🔄 Completion de la tâche BPMN avec Camunda:', taskId);
      
      // NOUVEAU: Utiliser ProcessEngineService pour compléter la tâche Camunda
      let response;
      try {
        // Préparer les variables de completion
        const completionVariables = {
          completedViaKanban: true,
          completedAt: new Date().toISOString(),
          completedBy: selectedUserId,
          // Ajouter les variables spécifiques à la tâche si disponibles
          ...task.variables
        };
        
        console.log('Variables de completion:', completionVariables);
        
        // Compléter la tâche via Camunda
        response = await ProcessEngineService.completeTask(taskId, completionVariables);
        
        console.log('✅ Tâche Camunda complétée:', response.data);
        
      } catch (camundaError) {
        console.warn('Erreur lors de la completion Camunda, fallback vers UserTaskService:', camundaError);
        
        // Fallback vers l'ancien système
        response = await UserTaskService.completeTask(taskId, {
          completedViaKanban: true,
          completedAt: new Date().toISOString(),
          completedBy: selectedUserId
        });
      }
      
      console.log('✅ Tâche complétée avec succès:', response.data);
      
      message.success(`Tâche "${task.title}" complétée avec succès!`);
      
      // Afficher des informations sur les prochaines tâches si disponibles
      if (response.data.nextTasks && response.data.nextTasks.length > 0) {
        message.info(`${response.data.nextTasks.length} nouvelle(s) tâche(s) créée(s)`);
      } else if (response.data.message) {
        message.info(response.data.message);
      }
      
      // Recharger les tâches pour refléter les changements
      await loadUserBpmnTasks(selectedUserId);
      
    } catch (error) {
      console.error('❌ Erreur lors de la completion:', error);
      message.error('Erreur lors de la completion: ' + (error.response?.data?.error || error.message));
    } finally {
      setCompletingTaskId(null);
    }
  };
  // Afficher les détails d'une tâche
  const showTaskDetails = (task) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };
  // Charger les tâches au montage et lors du changement d'utilisateur
  useEffect(() => {
    if (selectedUserId) {
      loadUserBpmnTasks(selectedUserId);
    }
  }, [selectedUserId]);
  // NOUVEAU: Initialiser les notifications WebSocket pour les tâches Camunda
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        console.log('🔌 Initialisation des notifications WebSocket pour les tâches');
        
        // Se connecter au WebSocket
        await WebSocketService.connect();
        
        // S'abonner aux notifications d'assignation de tâches
        const userId = localStorage.getItem('userId') || selectedUserId || 'current-user';
        WebSocketService.subscribeToTaskAssignments(userId, (notification) => {
          console.log('📋 Nouvelle assignation de tâche reçue:', notification);
          
          // Afficher une notification à l'utilisateur
          message.info({
            content: `Nouvelle tâche assignée: ${notification.taskName}`,
            duration: 5,
            icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
          });
          
          // Recharger les tâches pour afficher la nouvelle tâche
          if (selectedUserId) {
            loadUserBpmnTasks(selectedUserId);
          }
        });
        
        // S'abonner aux mises à jour de tâches
        WebSocketService.subscribeToTaskUpdates((notification) => {
          console.log('🔄 Mise à jour de tâche reçue:', notification);
          
          if (notification.type === 'TASK_COMPLETED') {
            message.success({
              content: `Tâche complétée: ${notification.taskName}`,
              duration: 3,
              icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
            });
          } else if (notification.type === 'TASK_ASSIGNED') {
            message.info({
              content: `Tâche réassignée: ${notification.taskName}`,
              duration: 4,
              icon: <UserOutlined style={{ color: '#faad14' }} />
            });
          }
          
          // Recharger les tâches pour refléter les changements
          if (selectedUserId) {
            loadUserBpmnTasks(selectedUserId);
          }
        });
        
        // S'abonner aux notifications de processus
        WebSocketService.subscribeToProcessUpdates((notification) => {
          console.log('⚙️ Mise à jour de processus reçue:', notification);
          
          if (notification.type === 'PROCESS_STARTED') {
            message.success({
              content: `Nouveau processus démarré: ${notification.processDefinitionKey}`,
              duration: 4,
              icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />
            });
          } else if (notification.type === 'PROCESS_COMPLETED') {
            message.success({
              content: `Processus terminé: ${notification.processDefinitionKey}`,
              duration: 4,
              icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
            });
          }
          
          // Recharger les tâches car de nouvelles tâches peuvent être créées
          if (selectedUserId) {
            loadUserBpmnTasks(selectedUserId);
          }
        });
        
        // S'abonner aux rappels d'échéance
        WebSocketService.subscribeToDeadlineReminders((notification) => {
          console.log('⏰ Rappel d\'échéance reçu:', notification);
          
          message.warning({
            content: `Échéance proche: ${notification.taskName} (${notification.timeRemaining})`,
            duration: 8,
            icon: <ClockCircleOutlined style={{ color: '#faad14' }} />
          });
        });
        
        console.log('✅ Notifications WebSocket initialisées avec succès');
        
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'initialisation WebSocket:', error);
        // Ne pas faire échouer le composant pour un problème WebSocket
      }
    };
    
    // Initialiser les WebSockets après un court délai pour s'assurer que le composant est monté
    const timer = setTimeout(initializeWebSocket, 1000);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      try {
        // Se désabonner des notifications lors du démontage
        WebSocketService.unsubscribeFromTaskAssignments();
        WebSocketService.unsubscribeFromTaskUpdates();
        WebSocketService.unsubscribeFromProcessUpdates();
        WebSocketService.unsubscribeFromDeadlineReminders();
        console.log('🔌 Désabonnement des notifications WebSocket');
      } catch (error) {
        console.warn('Erreur lors du désabonnement WebSocket:', error);
      }
    };
  }, []); // Exécuter une seule fois au montage
  // Appliquer tous les filtres et le tri aux tâches
  const applyFiltersAndSorting = (taskList) => {
    let filteredTasks = filterTasks(taskList);
    // Appliquer la recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        (task.assignee && task.assignee.name.toLowerCase().includes(searchLower)) ||
        (task.bpmnData && task.bpmnData.taskDefinitionKey.toLowerCase().includes(searchLower))
      );
    }
    // Appliquer le tri
    filteredTasks.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'deadline':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'process':
          aValue = (a.bpmnData && a.bpmnData.processDefinitionKey) || '';
          bValue = (b.bpmnData && b.bpmnData.processDefinitionKey) || '';
          break;
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        default:
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      }
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    return filteredTasks;
  };
  // Filtrer les tâches selon les critères sélectionnés
  const filterTasks = (taskList) => {
    return taskList.filter(task => {
      // Filtre par statut
      if (statusFilter !== 'all') {
        const taskStatus = determineTaskColumn(task);
        if (taskStatus !== statusFilter) return false;
      }
      // Filtre par processus
      if (processFilter !== 'all') {
        if (task.bpmnData?.processDefinitionKey !== processFilter) return false;
      }
      // Filtre par priorité
      if (priorityFilter !== 'all') {
        if (task.priority !== priorityFilter) return false;
      }
      return true;
    });
  };
  // Rendu des tâches par échéances
  const renderDeadlineTasks = (filterType) => {
    // Récupérer toutes les tâches avec des échéances
    const allTasks = Object.values(tasks).filter(task => {
      if (!task) return false;
      // Vérifier différentes propriétés possibles pour les dates d'échéance
      const hasDueDate = task.dueDate || task.due || (task.bpmnData && task.bpmnData.due);
      return hasDueDate;
    }).map(task => {
      // Normaliser la date d'échéance
      let dueDate = task.dueDate || task.due || (task.bpmnData && task.bpmnData.due);
      if (dueDate && typeof dueDate === 'string') {
        dueDate = new Date(dueDate);
      }
      return { ...task, dueDate };
    });
    // Filtrer selon le type demandé
    let filteredTasks = [];
    const now = new Date();
    switch (filterType) {
      case 'urgent':
        // Échéances dans les 3 prochains jours
        filteredTasks = allTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3 && diffDays >= 0;
        });
        break;
      case 'overdue':
        // Échéances dépassées
        filteredTasks = allTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate < now;
        });
        break;
      default:
        // Toutes les échéances
        filteredTasks = allTasks;
        break;
    }
    // Appliquer tous les filtres et le tri (recherche et tri inclus)
    filteredTasks = applyFiltersAndSorting(filteredTasks);
    
    if (filteredTasks.length === 0) {
      // Fallback: si aucune tâche avec échéance, afficher un message informatif
      // et permettre de voir au moins quelques tâches sans échéance
      const fallbackTasks = Object.values(tasks).filter(task => task).slice(0, 5); // Prendre les 5 premières tâches
      
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              {filterType === 'urgent' ? 'Aucune échéance proche trouvée' : 
               filterType === 'overdue' ? 'Aucune tâche en retard trouvée' : 
               'Aucune tâche avec échéance trouvée'}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
              Vérifiez les données BPMN pour les dates d'échéance
            </Text>
            <div style={{ marginTop: 16 }}>
              {/* <Text strong style={{ fontSize: '14px' }}>
                :Debug {Object.values(tasks).length} tâches chargées au total
              </Text> */}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {filteredTasks.map((task, index) => {
          const dueDate = new Date(task.dueDate);
          const isOverdue = dueDate < now;
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return (
            <Card
              key={task.id}
              size="small"
              hoverable
              style={{
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                cursor: 'pointer',
                backgroundColor: isOverdue ? '#fff2f0' : diffDays <= 3 ? '#fffbe6' : 'transparent'
              }}
              onClick={() => showTaskDetails(task)}
              actions={[
                <Tooltip title="Voir les détails">
                  <InfoCircleOutlined 
                    onClick={(e) => {
                      e.stopPropagation();
                      showTaskDetails(task);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Compléter la tâche">
                  <CheckCircleOutlined 
                    style={{ color: '#52c41a' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteTask(task.id);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <Card.Meta
                title={
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      {task.title}
                    </Text>
                    <Space size="small">
                      {getPriorityIcon(task.priority)}
                      <Tag 
                        color={isOverdue ? 'error' : diffDays <= 3 ? 'warning' : 'default'}
                        size="small"
                      >
                        {isOverdue ? 'En retard' : 
                         diffDays === 0 ? 'Aujourd\'hui' : 
                         diffDays === 1 ? 'Demain' : 
                         `Dans ${diffDays} jours`}
                      </Tag>
                    </Space>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph 
                      ellipsis={{ rows: 2 }}
                      style={{ fontSize: '12px', margin: '8px 0' }}
                    >
                      {task.description}
                    </Paragraph>
                    
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space size="small">
                        {task.assignee.name !== 'Non assigné' && (
                          <Tooltip title={task.assignee.email || task.assignee.name}>
                            <Avatar size="small" icon={<UserOutlined />}>
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                          </Tooltip>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dueDate.toLocaleDateString()}
                        </Text>
                      </Space>
                      <Tag 
                        color={getStatusColor(task.status)}
                        style={{ fontSize: '10px', margin: 0 }}
                      >
                        {task.status === 'suspended' ? 'Suspendu' : 
                         task.status === 'assigned' ? 'Assigné' : 'Libre'}
                      </Tag>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      {task.labels.slice(0, 2).map((label, i) => (
                        <Tag 
                          key={i} 
                          size="small" 
                          style={{ fontSize: '10px', marginBottom: 2 }}
                          color={i === 0 ? 'blue' : 'default'}
                        >
                          {label}
                        </Tag>
                      ))}
                      {task.labels.length > 2 && (
                        <Tag size="small" style={{ fontSize: '10px' }}>
                          +{task.labels.length - 2}
                        </Tag>
                      )}
                    </div>
                    <div style={{ marginTop: 4, fontSize: '10px', color: '#8c8c8c' }}>
                      ID: {task.bpmnData.taskDefinitionKey}
                    </div>
                  </div>
                }
              />
              {completingTaskId === task.id && (
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 6
                }}>
                  <Spin size="small" />
                </div>
              )}
            </Card>
          );
        })}
      </Space>
    );
  };
  // Rendu des composants
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FireOutlined style={{ color: '#ff4d4f' }} />;
      case 'medium':
        return <ThunderboltOutlined style={{ color: '#faad14' }} />;
      case 'low':
        return <ClockCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'processing';
      case 'suspended': return 'warning';
      case 'unassigned': return 'default';
      default: return 'default';
    }
  };
  if (loading) {
    return (
      <Main>
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Chargement des tâches BPMN...</Text>
            </div>
          </div>
        </Card>
      </Main>
    );
  }
  const columnOrder = ['todo', 'inprogress', 'done'];
  return (
    <Main>
      {/* En-tête */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              📋 Tableau Kanban des Tâches BPMN
            </Title>
            <Text type="secondary">
              Gérez vos tâches de processus métier en mode Kanban
            </Text>
          </Col>
        </Row>
      </Card>
      {/* Filtres et contrôles */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Text strong>Mode d'affichage:</Text>
            <br />
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              style={{ marginTop: 8 }}
            >
              <Radio.Button value="kanban">Kanban</Radio.Button>
              <Radio.Button value="deadline">
                <CalendarOutlined /> Échéances
              </Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={18}>
            <Space size="large">
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  <FilterOutlined /> Filtres:
                </Text>
                <Space size="middle">
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 120 }}
                    placeholder="Statut"
                  >
                    <Option value="all">Tous statuts</Option>
                    <Option value="todo">À faire</Option>
                    <Option value="inprogress">En cours</Option>
                    <Option value="done">Terminé</Option>
                  </Select>
                  <Select
                    value={processFilter}
                    onChange={setProcessFilter}
                    style={{ width: 150 }}
                    placeholder="Processus"
                  >
                    <Option value="all">Tous processus</Option>
                    {availableProcesses.map(process => (
                      <Option key={process} value={process}>{process}</Option>
                    ))}
                  </Select>
                  <Select
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    style={{ width: 120 }}
                    placeholder="Priorité"
                  >
                    <Option value="all">Toutes priorités</Option>
                    <Option value="high">Haute</Option>
                    <Option value="medium">Moyenne</Option>
                    <Option value="low">Basse</Option>
                  </Select>
                </Space>
              </div>
              {/* Contrôles de recherche et tri - disponibles pour toutes les vues */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  <SearchOutlined /> Recherche & Tri:
                </Text>
                <Space size="middle">
                  <Input
                    placeholder="Rechercher..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    style={{ width: 150 }}
                  />
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: 120 }}
                    placeholder="Trier par"
                  >
                    <Option value="deadline">Échéance</Option>
                    <Option value="priority">Priorité</Option>
                    <Option value="process">Processus</Option>
                    <Option value="title">Titre</Option>
                  </Select>
                  <Select
                    value={sortOrder}
                    onChange={setSortOrder}
                    style={{ width: 100 }}
                    placeholder="Ordre"
                  >
                    <Option value="asc">↑ Croissant</Option>
                    <Option value="desc">↓ Décroissant</Option>
                  </Select>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
      {/* Statistiques rapides */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {columnOrder.map(columnId => {
          const column = columns[columnId];
          const allTasksInColumn = column ? column.taskIds.map(taskId => tasks[taskId]).filter(Boolean) : [];
          const filteredTasksInColumn = filterTasks(allTasksInColumn);
          const count = filteredTasksInColumn.length;
          const config = columnConfig[columnId];
          
          return (
            <Col span={8} key={columnId}>
              <Card size="small">
                <Space>
                  <Avatar 
                    icon={config.icon} 
                    style={{ backgroundColor: config.color }}
                  />
                  <div>
                    <Text strong>{config.title}</Text>
                    <br />
                    <Text type="secondary">{count} tâche(s)</Text>
                    {allTasksInColumn.length !== filteredTasksInColumn.length && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          ({allTasksInColumn.length - filteredTasksInColumn.length} filtrée(s))
                        </Text>
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
      {/* Affichage conditionnel selon le mode */}
      {viewMode === 'kanban' ? (
        <>
          {/* Tableau Kanban */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Row gutter={16}>
              {columnOrder.map((columnId) => {
                const column = columns[columnId];
                const columnTasks = column ? applyFiltersAndSorting(column.taskIds.map(taskId => tasks[taskId]).filter(Boolean)) : [];
                const config = columnConfig[columnId];
                return (
                  <Col span={8} key={columnId}>
                    <Card
                      title={
                        <Space>
                          {config.icon}
                          <span>{config.title}</span>
                          <Badge 
                            count={columnTasks.length} 
                            style={{ backgroundColor: config.color }}
                          />
                        </Space>
                      }
                      size="small"
                      style={{ height: '70vh' }}
                      bodyStyle={{ 
                        padding: '12px',
                        height: 'calc(100% - 57px)',
                        overflow: 'auto'
                      }}
                    >
                      <Droppable droppableId={columnId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              minHeight: '100%',
                              backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : 'transparent',
                              borderRadius: 6,
                              padding: snapshot.isDraggingOver ? 8 : 0,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              {columnTasks.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      size="small"
                                      hoverable
                                      style={{
                                        transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                        boxShadow: snapshot.isDragging 
                                          ? '0 8px 16px rgba(0,0,0,0.15)' 
                                          : '0 2px 8px rgba(0,0,0,0.1)',
                                        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => showTaskDetails(task)}
                                      actions={[
                                        <Tooltip title="Voir les détails">
                                          <InfoCircleOutlined 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              showTaskDetails(task);
                                            }}
                                          />
                                        </Tooltip>,
                                        <Tooltip title="Compléter la tâche">
                                          <CheckCircleOutlined 
                                            style={{ color: '#52c41a' }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCompleteTask(task.id);
                                            }}
                                          />
                                        </Tooltip>
                                      ]}
                                    >
                                      <Card.Meta
                                        title={
                                          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Text strong style={{ fontSize: '14px' }}>
                                              {task.title}
                                            </Text>
                                            {getPriorityIcon(task.priority)}
                                          </Space>
                                        }
                                        description={
                                          <div>
                                            <Paragraph 
                                              ellipsis={{ rows: 2 }}
                                              style={{ fontSize: '12px', margin: '8px 0' }}
                                            >
                                              {task.description}
                                            </Paragraph>
                                            
                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                              <Space size="small">
                                                {task.assignee.name !== 'Non assigné' && (
                                                  <Tooltip title={task.assignee.email || task.assignee.name}>
                                                    <Avatar size="small" icon={<UserOutlined />}>
                                                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                                    </Avatar>
                                                  </Tooltip>
                                                )}
                                                {task.dueDate && (
                                                  <Tooltip title={`Échéance: ${task.dueDate.toLocaleDateString()}`}>
                                                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                                                  </Tooltip>
                                                )}
                                              </Space>
                                              <Tag 
                                                color={getStatusColor(task.status)}
                                                style={{ fontSize: '10px', margin: 0 }}
                                              >
                                                {task.status === 'suspended' ? 'Suspendu' : 
                                                 task.status === 'assigned' ? 'Assigné' : 'Libre'}
                                              </Tag>
                                            </Space>
                                            <div style={{ marginTop: 8 }}>
                                              {task.labels.slice(0, 2).map((label, i) => (
                                                <Tag 
                                                  key={i} 
                                                  size="small" 
                                                  style={{ fontSize: '10px', marginBottom: 2 }}
                                                  color={i === 0 ? 'blue' : 'default'}
                                                >
                                                  {label}
                                                </Tag>
                                              ))}
                                              {task.labels.length > 2 && (
                                                <Tag size="small" style={{ fontSize: '10px' }}>
                                                  +{task.labels.length - 2}
                                                </Tag>
                                              )}
                                            </div>
                                            <div style={{ marginTop: 4, fontSize: '10px', color: '#8c8c8c' }}>
                                              ID: {task.bpmnData.taskDefinitionKey}
                                            </div>
                                          </div>
                                        }
                                      />
                                      {completingTaskId === task.id && (
                                        <div style={{ 
                                          position: 'absolute', 
                                          top: 0, 
                                          left: 0, 
                                          right: 0, 
                                          bottom: 0, 
                                          backgroundColor: 'rgba(255,255,255,0.8)', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center',
                                          borderRadius: 6
                                        }}>
                                          <Spin size="small" />
                                        </div>
                                      )}
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                            </Space>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </DragDropContext>
        </>
      ) : (
        <>
          {/* Vue par échéances */}
          <Card title={<Space><CalendarOutlined />Tâches par échéances</Space>}>
            <Tabs defaultActiveKey="all" type="card">
              <Tabs.TabPane tab="Toutes les échéances" key="all">
                {renderDeadlineTasks('all')}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Échéances proches" key="urgent">
                {renderDeadlineTasks('urgent')}
              </Tabs.TabPane>
              <Tabs.TabPane tab="En retard" key="overdue">
                {renderDeadlineTasks('overdue')}
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </>
      )}
      {/* Modal de détails de tâche */}
      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800} /* max-w-2xl equivalent */
        footer={null}
        style={{ top: 15 }}
        bodyStyle={{ padding: 0 }}
        closable={false}
        centered
      >
        {selectedTask && (
          <div>
            {/* Header image - full width across entire modal */}
            <div style={{ 
              height: '200px', 
              background: '#f5f5f5',
              overflow: 'hidden'
            }}>
              <img 
                src={selectedTask.coverImage || "https://via.placeholder.com/700x180"} 
                alt="Task cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            <div style={{ display: 'flex' }}>
              {/* Left content area */}
              <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #f0f0f0' }}>
              
              {/* Task information in horizontal layout */}
              <div style={{ marginBottom: '20px' }}>
                {/* Title row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>TITLE:</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', flex: 1 }}>{selectedTask.title}</div>
                </div>
                
                {/* Description row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>DESCRIPTION:</div>
                  <div style={{ fontSize: '14px', flex: 1 }}>
                    {selectedTask.description || "Reproduced below for those interested\\ is a phrase used to provide additional context and details for individuals who have expressed interest in a particular topic."}
                  </div>
                </div>
                
                {/* Board row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>BOARD:</div>
                  <div style={{ fontSize: '14px', flex: 1 }}>
                    {selectedTask.board || "Phoenix"}
                  </div>
                </div>
                
                {/* Column row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>COLUMN:</div>
                  <div style={{ fontSize: '14px', flex: 1 }}>
                    <div style={{ 
                      display: 'inline-block', 
                      borderBottom: '3px solid #fa8c16', 
                      paddingBottom: '3px' 
                    }}>
                      {determineTaskColumn(selectedTask) === 'todo' ? 'To Do' : 
                       determineTaskColumn(selectedTask) === 'inProgress' ? 'Doing' : 'Done'}
                    </div>
                  </div>
                </div>
                
                {/* Assigned to row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>ASSIGNED TO:</div>
                  <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                    {selectedTask.assignee ? (
                      <Avatar src={selectedTask.assignee.avatar} icon={<UserOutlined />} />
                    ) : (
                      <>
                        <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                        <Avatar style={{ backgroundColor: '#722ed1' }} icon={<UserOutlined />} />
                      </>
                    )}
                  </div>
                </div>
                
                {/* Priority row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>PRIORITY:</div>
                  <div style={{ fontSize: '14px', flex: 1 }}>
                    <Tag color="#fa8c16" style={{ borderRadius: '10px', padding: '0 10px' }}>
                      {selectedTask.priority === 'high' ? 'High' : 
                       selectedTask.priority === 'medium' ? 'Medium' : 'Low'}
                    </Tag>
                  </div>
                </div>
                
                {/* Category row */}
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>CATEGORY:</div>
                  <div style={{ fontSize: '14px', flex: 1 }}>
                    <Tag color="#f50" style={{ borderRadius: '2px' }}>
                      BUG <span style={{ backgroundColor: 'white', color: '#f50', borderRadius: '50%', padding: '0 5px', marginLeft: '3px' }}>8</span>
                    </Tag>
                  </div>
                </div>
              </div>
              
              {/* Attachments section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', width: '100px' }}>ATTACHMENTS:</div>
                </div>
                <div>
                  {/* First attachment with image */}
                  <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', marginRight: '10px', overflow: 'hidden', borderRadius: '4px' }}>
                      <img src="https://via.placeholder.com/40" alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Silly_sight_1.png</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Added 2 days ago</div>
                    </div>
                  </div>
                  
                  {/* Second attachment with zip file */}
                  <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      marginRight: '10px', 
                      overflow: 'hidden', 
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <FileZipOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>All_images.zip</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Added 3 days ago</div>
                    </div>
                  </div>
                  
                  {/* Add attachment button */}
                  <Button type="dashed" icon={<PlusOutlined />} style={{ width: '100%' }}>
                    Add an Attachment
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right sidebar */}
            <div style={{ width: '280px', padding: '20px', backgroundColor: '#fafafa' }}>
              {/* Actions section */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontWeight: 'bold', color: '#8c8c8c', fontSize: '12px', marginBottom: '15px' }}>ACTIONS</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Complete Task button at the top with primary style */}
                  <Button type="primary" icon={<CheckCircleOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Complete Task</Button>
                  
                  <Button icon={<SwapOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Move</Button>
                  <Button icon={<CopyOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Duplicate</Button>
                  <Button icon={<ShareAltOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Share</Button>
                  <Button icon={<SnippetsOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Create template</Button>
                  <Button icon={<ArrowUpOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Jump to top</Button>
                  <Button icon={<InboxOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Move to Archive</Button>
                  <Button icon={<DeleteOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Move to Trash</Button>
                  <Button icon={<DownloadOutlined />} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>Print/Download</Button>
                </div>
              </div>    
              {/* Activities section */}
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Activities</div>
                
                {/* First activity */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#1890ff', marginRight: '8px' }} />
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Allen Loebe</span> Moved the task
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', fontSize: '13px' }}>
                    <a href="#" style={{ color: '#1890ff' }}>"the standard chunk"</a> from 
                    <span style={{ fontWeight: 'bold' }}> Doing</span> to 
                    <span style={{ fontWeight: 'bold' }}> To Do</span>
                  </div>
                  <div style={{ marginLeft: '24px', fontSize: '12px', color: '#8c8c8c', marginTop: '5px' }}>
                    <ClockCircleOutlined style={{ marginRight: '5px' }} />
                    10:41 AM
                    <span style={{ marginLeft: '10px' }}>August 7, 2022</span>
                  </div>
                </div>
                
                {/* Second activity */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#52c41a', marginRight: '8px' }} />
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Jessie Samson</span> Attached
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', fontSize: '13px' }}>
                    image3.png to the task <a href="#" style={{ color: '#1890ff' }}>"the standard chunk"</a>
                  </div>
                  <div style={{ marginLeft: '24px', fontSize: '12px', color: '#8c8c8c', marginTop: '5px' }}>
                    <ClockCircleOutlined style={{ marginRight: '5px' }} />
                    10:41 AM
                    <span style={{ marginLeft: '10px' }}>August 7, 2022</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Footer with close and edit buttons */}
        <div style={{ 
          borderTop: '1px solid #f0f0f0', 
          padding: '10px 16px', 
          textAlign: 'right',
          backgroundColor: '#fafafa'
        }}>
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>
              <CloseOutlined /> Close
            </Button>
          </Space>
        </div>
      </Modal>
    </Main>
  );
};
export default KanbanBoardAntd;