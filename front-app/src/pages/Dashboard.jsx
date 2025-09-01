import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell,
  Folder,
  Calendar,
  BarChart,
  User,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play
} from 'react-feather';
import Main from '../layout/Main';
import taskService from '../services/TaskService';
import notificationService from '../services/NotificationService';
import webSocketService from '../services/WebSocketService';
import workflowService from '../services/WorkflowService';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

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
  
  // Déterminer le variant Bootstrap pour la date d'échéance
  const getDueDateVariant = (dueDate) => {
    if (!dueDate) return 'secondary';
    
    const today = new Date();
    const due = new Date(dueDate);
    
    if (due < today) {
      return 'danger'; // En retard
    }
    
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    if (due <= twoDaysFromNow) {
      return 'warning'; // Bientôt
    }
    
    return 'success'; // Dans les temps
  };

  // Obtenir le variant Bootstrap pour la priorité
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'URGENT': return 'danger';
      case 'HIGH': return 'warning';
      case 'NORMAL': return 'primary';
      case 'LOW': return 'success';
      default: return 'secondary';
    }
  };

  // Obtenir l'icône et le variant pour le statut
  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETED': 
        return { variant: 'success', icon: CheckCircle, text: 'Terminée' };
      case 'PENDING': 
        return { variant: 'warning', icon: Clock, text: 'En attente' };
      case 'IN_PROGRESS': 
        return { variant: 'info', icon: RefreshCw, text: 'En cours' };
      default: 
        return { variant: 'secondary', icon: Clock, text: 'En attente' };
    }
  };
  
  if (isLoading) {
    return (
      <Main>
        <div className="dashboard-container">
          <div className="loading">
            <RefreshCw className="fa-spin" size={24} />
            <span>Chargement des données...</span>
          </div>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <div className="section-body">
        <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <div className="card">
                    <div className="card-statistic-4">
                        <div className="align-items-center justify-content-between">
                            <div className="row ">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                                    <div className="card-content">
                                        <h5 className="font-18">Tâches en attente</h5>
                                        <h2 className="mb-3 font-18 pl-3 stat-value">{stats.pendingTasks}</h2>
                                        {/* <p class="mb-0"><span class="col-green">10%</span> Increase</p> */}
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pl-0">
                                    <div className="banner-img">
                                        <img src="/assets/img/pendingtask.gif" alt=""/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <div className="card">
                    <div className="card-statistic-4">
                        <div className="align-items-center justify-content-between">
                            <div className="row ">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                                    <div className="card-content">
                                        <h5 className="font-18">Tâches terminées</h5>
                                        <h2 className="mb-3 font-18 pl-3   stat-value">{stats.completedTasks}</h2>
                                        {/* <p class="mb-0"><span class="col-green">10%</span> Increase</p> */}
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <div className="banner-img">
                                        <img src="/assets/img/completetask.gif" alt=""/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <div className="card">
                    <div className="card-statistic-4">
                        <div className="align-items-center justify-content-between">
                            <div className="row ">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                                    <div className="card-content">
                                        <h5 className="font-18">Tâches en retard</h5>
                                        <h2 className="mb-3 font-18 pl-3 stat-value">{stats.overdueCount}</h2>
                                        {/* <p class="mb-0"><span class="col-green">10%</span> Increase</p> */}
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6  pl-0">
                                    <div className="banner-img">
                                        <img src="/assets/img/overduetask.gif" alt=""/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <div className="card">
                    <div className="card-statistic-4">
                        <div className="align-items-center justify-content-between">
                            <div className="row ">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                                    <div className="card-content">
                                        <h5 className="font-18">Workflow</h5>
                                        <h2 className="mb-3 font-18 pl-3 stat-value">{stats.activeWorkflows}</h2>
                                        {/* <p class="mb-0"><span class="col-green">10%</span> Increase</p> */}
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <div className="banner-img">
                                        <img src="/assets/img/Workflow.gif" alt=""/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
            </div>
        </div>
        
       

        {/* Contenu principal */}
        <div className="row" style={{ paddingTop: '20px', gap: '20px' }}>
          {/* Section des tâches */}
          <div className="col-lg-4 mb-4">
            <div className="widget">
              <div className="widget-header">
                <h2 className='font-18'>
                  <Clock size={20} />
                  Mes tâches récentes
                </h2>
                <Link to="/todo" className="view-all">Voir tout</Link>
              </div>
              <div className="widget-content">
                {tasks.length === 0 ? (
                  <div className="empty-state">Aucune tâche en attente</div>
                ) : (
                  <div className="tasks-list">
                    {tasks.slice(0, 5).map(task => {
                      const statusConfig = getStatusConfig(task.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={task.id} className={`task-item priority-${task.priority.toLowerCase()}`}>
                          <div className="task-content">
                            <div className="task-name">{task.name}</div>
                            <div className="task-description">{task.description}</div>
                            <div className="task-meta">
                              <span className={`priority priority-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                              <span className={`due-date ${getDueDateVariant(task.dueDate) === 'danger' ? 'overdue' : getDueDateVariant(task.dueDate) === 'warning' ? 'soon' : ''}`}>
                                <Calendar size={12} />
                                {task.dueDate ? formatDate(task.dueDate) : 'Aucune'}
                              </span>
                            </div>
                          </div>
                          {task.status !== 'COMPLETED' && (
                            <button
                              className="complete-task-btn"
                              onClick={() => completeTask(task.id)}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section des notifications */}
            <div className="widget">
              <div className="widget-header">
                <h2 className='font-18' >
                  <Bell size={20} />
                  Notifications
                  {notifications.filter(n => n.status === 'UNREAD').length > 0 && (
                    <span className="notification-badge">
                      {notifications.filter(n => n.status === 'UNREAD').length}
                    </span>
                  )}
                </h2>
                <Link to="/notifications" className="view-all">Voir tout</Link>
              </div>
              <div className="widget-content">
                {notifications.length === 0 ? (
                  <div className="empty-state">Aucune notification</div>
                ) : (
                  <div className="notifications-list">
                    {notifications.slice(0, 3).map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.status === 'UNREAD' ? 'unread' : ''}`}
                      >
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-date">{formatDate(notification.creationDate)}</div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Section des workflows */}
            <div className="widget">
              <div className="widget-header">
                <h2 className='font-18'>
                  <Folder size={20} />
                  Workflows actifs
                </h2>
                <Link to="/workflows" className="view-all">Voir tout</Link>
              </div>
              <div className="widget-content">
                {workflows.length === 0 ? (
                  <div className="empty-state">Aucun workflow actif</div>
                ) : (
                  <div className="workflows-list">
                    {workflows.slice(0, 3).map(workflow => (
                      <div key={workflow.id} className="workflow-item">
                        <div className="workflow-name">{workflow.name}</div>
                        <div className="workflow-details">
                          <div>{workflow.currentTask}</div>
                          <div>Démarré le {formatDate(workflow.startDate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}

export default Dashboard;