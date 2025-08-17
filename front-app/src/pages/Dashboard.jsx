import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Badge,
  List,
  Avatar,
  Button,
  Typography,
  Space,
  Spin,
  Progress,
  Tooltip,
  Divider,
  Alert,
  Empty,
  Timeline
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  ProjectOutlined,
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import Main from '../layout/Main';
import taskService from '../services/TaskService';
import notificationService from '../services/NotificationService';
import webSocketService from '../services/WebSocketService';
import workflowService from '../services/WorkflowService';
import { toast } from 'react-hot-toast';

const { Title, Text } = Typography;
const { Content } = Layout;

function Dashboard() {
  // États pour stocker les données
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [stats, setStats] = useState({
    completedTasks: 0,
    pendingTasks: 0,
    overdueCount: 0,
    activeWorkflows: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchDashboardData();
    setupWebSocket();
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Charger les tâches en utilisant le token d'authentification
      const tasksData = await taskService.getUserTasks();
      setTasks(tasksData);
      
      // Calculer les statistiques des tâches
      const completed = tasksData.filter(task => task.status === 'COMPLETED').length;
      const pending = tasksData.filter(task => task.status === 'PENDING').length;
      const overdue = tasksData.filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
      }).length;
      
      // Charger les notifications en utilisant le token d'authentification
      const notificationsData = await notificationService.getUserNotifications();
      setNotifications(notificationsData);
      
      // Charger les workflows actifs en utilisant le token d'authentification
      const workflowsData = await workflowService.getActiveInstances();
      setWorkflows(workflowsData);
      
      // Mettre à jour les statistiques
      setStats({
        completedTasks: completed,
        pendingTasks: pending,
        overdueCount: overdue,
        activeWorkflows: workflowsData.length
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      toast.error('Erreur lors du chargement des données');
      setIsLoading(false);
      
      // Utiliser des données fictives en cas d'erreur
      setTasks([
        {
          id: '1',
          name: 'Réviser le document de spécifications',
          description: 'Revoir et valider les spécifications techniques',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: '2025-05-25T23:59:59',
          assignee: { id: '1', name: 'Utilisateur Actuel' }
        },
        {
          id: '2',
          name: 'Corriger le bug #123',
          description: 'Résoudre le problème de validation des formulaires',
          status: 'PENDING',
          priority: 'URGENT',
          dueDate: '2025-05-18T23:59:59',
          assignee: { id: '1', name: 'Utilisateur Actuel' }
        },
        {
          id: '3',
          name: 'Mettre à jour la documentation API',
          description: 'Documenter les nouveaux endpoints',
          status: 'COMPLETED',
          priority: 'NORMAL',
          dueDate: '2025-05-15T23:59:59',
          assignee: { id: '1', name: 'Utilisateur Actuel' }
        }
      ]);
      
      setNotifications([
        {
          id: '1',
            title: 'Nouvelle tâche assignée',
          message: 'Vous avez été assigné à la tâche "Réviser le document de spécifications"',
          type: 'TASK_ASSIGNED',
          status: 'UNREAD',
          creationDate: '2025-05-17T07:30:00'
        },
        {
          id: '2',
          title: 'Tâche en retard',
          message: 'La tâche "Corriger le bug #123" est en retard',
          type: 'TASK_OVERDUE',
          status: 'UNREAD',
          creationDate: '2025-05-16T09:15:00'
        }
      ]);
      
      setWorkflows([
        {
          id: 'wf1',
          name: 'Validation de document',
          status: 'ACTIVE',
          startDate: '2025-05-15T14:20:00',
          currentTask: 'Révision par le responsable'
        }
      ]);
      
      setStats({
        completedTasks: 1,
        pendingTasks: 2,
        overdueCount: 1,
        activeWorkflows: 1
      });
    }
  };

  const setupWebSocket = () => {
    // Configurer WebSocket pour les mises à jour en temps réel
    webSocketService.connect()
      .then(() => {
        console.log('WebSocket connecté pour le tableau de bord');
        
        // Écouter les nouvelles notifications
        const handleNewNotification = (event) => {
          const newNotification = event.detail;
          setNotifications(prev => [newNotification, ...prev]);
          toast.success(`Nouvelle notification: ${newNotification.title}`);
          
          // Rafraîchir les données si nécessaire
          if (newNotification.type === 'TASK_ASSIGNED' || 
              newNotification.type === 'TASK_COMPLETED' || 
              newNotification.type === 'PROCESS_STARTED') {
            fetchDashboardData();
          }
        };
        
        window.addEventListener('notification', handleNewNotification);
        
        return () => {
          window.removeEventListener('notification', handleNewNotification);
          webSocketService.disconnect();
        };
      })
      .catch(error => {
        console.error('Erreur de connexion WebSocket:', error);
      });
  };
  
  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Marquer une tâche comme terminée
  const completeTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'COMPLETED' } 
            : task
        )
      );
      
      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        completedTasks: prev.completedTasks + 1,
        pendingTasks: Math.max(0, prev.pendingTasks - 1),
        overdueCount: tasks.find(t => t.id === taskId && 
          new Date(t.dueDate) < new Date()) ? Math.max(0, prev.overdueCount - 1) : prev.overdueCount
      }));
      
      toast.success('Tâche marquée comme terminée');
    } catch (error) {
      console.error('Erreur lors de la complétion de la tâche:', error);
      toast.error('Erreur lors de la complétion de la tâche');
    }
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Déterminer le statut de la date d'échéance
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    if (due < today) {
      return 'error'; // En retard
    }
    
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    if (due <= twoDaysFromNow) {
      return 'warning'; // Bientôt
    }
    
    return 'success'; // Dans les temps
  };

  // Obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'NORMAL': return 'blue';
      case 'LOW': return 'green';
      default: return 'default';
    }
  };

  // Colonnes pour le tableau des tâches
  const taskColumns = [
    {
      title: 'Tâche',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Échéance',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate) => {
        if (!dueDate) return <Text type="secondary">Aucune</Text>;
        const status = getDueDateStatus(dueDate);
        return (
          <Tag color={status}>
            <CalendarOutlined /> {formatDate(dueDate)}
          </Tag>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          COMPLETED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Terminée' },
          PENDING: { color: 'processing', icon: <ClockCircleOutlined />, text: 'En attente' },
          IN_PROGRESS: { color: 'warning', icon: <SyncOutlined spin />, text: 'En cours' }
        };
        const { color, icon, text } = config[status] || config.PENDING;
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        record.status !== 'COMPLETED' && (
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => completeTask(record.id)}
          >
            Terminer
          </Button>
        )
      ),
    },
  ];
  
  if (isLoading) {
    return (
      <Main>
        <Content style={{ padding: '24px', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', paddingTop: '100px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Chargement des données...</Text>
            </div>
          </div>
        </Content>
      </Main>
    );
  }

  return (
    <Main>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {/* En-tête avec titre et bouton d'actualisation */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Tableau de bord
          </Title>
          <Button 
            type="primary" 
            icon={<SyncOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Actualiser
          </Button>
        </div>

        {/* Cartes de statistiques */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tâches en attente"
                value={stats.pendingTasks}
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tâches terminées"
                value={stats.completedTasks}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tâches en retard"
                value={stats.overdueCount}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Workflows actifs"
                value={stats.activeWorkflows}
                prefix={<ProjectOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Contenu principal */}
        <Row gutter={[16, 16]}>
          {/* Section des tâches */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Mes tâches récentes</span>
                </Space>
              }
              extra={
                <Link to="/tasks">
                  <Button type="link">Voir tout</Button>
                </Link>
              }
            >
              {tasks.length === 0 ? (
                <Empty description="Aucune tâche en attente" />
              ) : (
                <Table
                  dataSource={tasks.slice(0, 5)}
                  columns={taskColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              )}
            </Card>
          </Col>

          {/* Section des notifications et workflows */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Notifications */}
              <Card 
                title={
                  <Space>
                    <Badge count={notifications.filter(n => n.status === 'UNREAD').length}>
                      <BellOutlined />
                    </Badge>
                    <span>Notifications</span>
                  </Space>
                }
                extra={
                  <Link to="/notifications">
                    <Button type="link" size="small">Voir tout</Button>
                  </Link>
                }
                size="small"
              >
                {notifications.length === 0 ? (
                  <Empty description="Aucune notification" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={notifications.slice(0, 3)}
                    renderItem={(notification) => (
                      <List.Item style={{ padding: '8px 0' }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              size="small" 
                              icon={<BellOutlined />} 
                              style={{ 
                                backgroundColor: notification.status === 'UNREAD' ? '#1890ff' : '#d9d9d9' 
                              }}
                            />
                          }
                          title={
                            <Text 
                              strong={notification.status === 'UNREAD'}
                              style={{ fontSize: '12px' }}
                            >
                              {notification.title}
                            </Text>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {formatDate(notification.creationDate)}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              {/* Workflows actifs */}
              <Card 
                title={
                  <Space>
                    <ProjectOutlined />
                    <span>Workflows actifs</span>
                  </Space>
                }
                extra={
                  <Link to="/workflows">
                    <Button type="link" size="small">Voir tout</Button>
                  </Link>
                }
                size="small"
              >
                {workflows.length === 0 ? (
                  <Empty description="Aucun workflow actif" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Timeline size="small">
                    {workflows.slice(0, 3).map(workflow => (
                      <Timeline.Item 
                        key={workflow.id}
                        dot={<PlayCircleOutlined style={{ color: '#1890ff' }} />}
                      >
                        <div>
                          <Text strong style={{ fontSize: '12px' }}>
                            {workflow.name}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {workflow.currentTask}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '10px' }}>
                            Démarré le {formatDate(workflow.startDate)}
                          </Text>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Graphiques et analyses (section future) */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined />
                  <span>Analyse des performances</span>
                </Space>
              }
            >
              <Alert
                message="Fonctionnalité à venir"
                description="Les graphiques et analyses détaillées seront disponibles dans une prochaine version."
                type="info"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Main>
  );
}

export default Dashboard;
