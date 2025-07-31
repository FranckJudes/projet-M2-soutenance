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
  Alert
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  FireOutlined,
  ThunderboltOutlined,
  BugOutlined
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('1');
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);

  // Liste des utilisateurs
  const [users] = useState([
    { id: '1', name: 'Jean Dupont', avatar: 'JD' },
    { id: '2', name: 'Marie Martin', avatar: 'MM' },
    { id: '3', name: 'Pierre Dubois', avatar: 'PD' },
    { id: '4', name: 'Sophie Petit', avatar: 'SP' }
  ]);

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
      
      setColumns(convertedData.columns);
      setTasks(convertedData.tasks);
      
      const userName = users.find(u => u.id === userId)?.name;
      message.success(`${bpmnTasks.length} tâches chargées pour ${userName}`);
      
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

  // Rafraîchir les tâches
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserBpmnTasks(selectedUserId);
    setRefreshing(false);
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
          <Col>
            <Space size="middle">
              <Select
                value={selectedUserId}
                onChange={setSelectedUserId}
                style={{ width: 200 }}
                placeholder="Sélectionner un utilisateur"
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    <Space>
                      <Avatar size="small">{user.avatar}</Avatar>
                      {user.name}
                    </Space>
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={refreshing}
                onClick={handleRefresh}
              >
                Actualiser
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistiques rapides */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {columnOrder.map(columnId => {
          const column = columns[columnId];
          const count = column ? column.taskIds.length : 0;
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
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Tableau Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={16}>
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column ? column.taskIds.map(taskId => tasks[taskId]).filter(Boolean) : [];
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

      {/* Modal de détails de tâche BPMN */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>Détails de la Tâche BPMN</span>
            {selectedTask && (
              <Tag color={getPriorityColor(selectedTask.priority)}>
                {selectedTask.priority.toUpperCase()}
              </Tag>
            )}
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={handleRefresh}>
            Actualiser
          </Button>,
          <Button 
            key="complete" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            loading={completingTaskId === selectedTask?.id}
            onClick={() => {
              if (selectedTask) {
                handleCompleteTask(selectedTask.id);
                setDetailModalVisible(false);
              }
            }}
          >
            Compléter la Tâche
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
      >
        {selectedTask && (
          <div>
            <Title level={4}>{selectedTask.title}</Title>
            <Paragraph>{selectedTask.description}</Paragraph>

            <Divider orientation="left">Informations BPMN</Divider>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="ID Tâche">
                <Text code>{selectedTask.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Clé de définition">
                <Text code>{selectedTask.bpmnData.taskDefinitionKey}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Instance de processus">
                <Text code>{selectedTask.bpmnData.processInstanceId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date de création">
                {selectedTask.bpmnData.createTime ? 
                  new Date(selectedTask.bpmnData.createTime).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color={getStatusColor(selectedTask.status)}>
                  {selectedTask.bpmnData.suspended ? 'Suspendu' : 'Actif'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Configuration">
                <Tag color={selectedTask.bpmnData.hasConfiguration ? 'success' : 'default'}>
                  {selectedTask.bpmnData.hasConfiguration ? 'Configurée' : 'Non configurée'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedTask.bpmnData.hasConfiguration && selectedTask.bpmnData.taskConfiguration && (
              <>
                <Divider orientation="left">Configuration de la Tâche</Divider>
                
                {selectedTask.bpmnData.taskConfiguration.information && (
                  <Alert
                    message="Informations"
                    description={
                      <div>
                        {selectedTask.bpmnData.taskConfiguration.information.workInstructions && (
                          <p><strong>Instructions:</strong> {selectedTask.bpmnData.taskConfiguration.information.workInstructions}</p>
                        )}
                        {selectedTask.bpmnData.taskConfiguration.information.expectedDeliverable && (
                          <p><strong>Livrable attendu:</strong> {selectedTask.bpmnData.taskConfiguration.information.expectedDeliverable}</p>
                        )}
                      </div>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                )}

                {selectedTask.bpmnData.taskConfiguration.habilitation && (
                  <Alert
                    message="Assignation"
                    description={
                      <Descriptions column={1} size="small">
                        {selectedTask.bpmnData.taskConfiguration.habilitation.assignedUser && (
                          <Descriptions.Item label="Utilisateur assigné">
                            <Space>
                              <Avatar size="small" icon={<UserOutlined />} />
                              {selectedTask.bpmnData.taskConfiguration.habilitation.assignedUser.firstName} {selectedTask.bpmnData.taskConfiguration.habilitation.assignedUser.lastName}
                              <Text type="secondary">({selectedTask.bpmnData.taskConfiguration.habilitation.assignedUser.email})</Text>
                            </Space>
                          </Descriptions.Item>
                        )}
                        {selectedTask.bpmnData.assignedGroupInfo && (
                          <Descriptions.Item label="Groupe assigné">
                            <Tag>{selectedTask.bpmnData.assignedGroupInfo.name}</Tag>
                          </Descriptions.Item>
                        )}
                        {selectedTask.bpmnData.assignedEntityInfo && (
                          <Descriptions.Item label="Entité assignée">
                            <Tag color="purple">{selectedTask.bpmnData.assignedEntityInfo.name}</Tag>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    }
                    type="success"
                    style={{ marginBottom: 16 }}
                  />
                )}
              </>
            )}

            <Divider orientation="left">Étiquettes</Divider>
            <Space wrap>
              {selectedTask.labels.map((label, i) => (
                <Tag 
                  key={i} 
                  color={i === 0 ? 'blue' : 'default'}
                >
                  {label}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Modal>
    </Main>
  );
};

export default KanbanBoardAntd;