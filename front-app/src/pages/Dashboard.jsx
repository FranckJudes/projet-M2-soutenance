import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Main from "../layout/Main";
import taskService from "../services/TaskService";
import notificationService from "../services/NotificationService";
import webSocketService from "../services/WebSocketService";
import workflowService from "../services/WorkflowService";
import { FaCheckCircle, FaExclamationCircle, FaBell, FaTasks, FaProjectDiagram, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./Dashboard.css";

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
  
  // ID utilisateur (à remplacer par l'ID de l'utilisateur connecté)
  const userId = '1';

  // Charger les données au chargement du composant
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Charger les tâches
        const tasksData = await taskService.getUserTasks(userId);
        setTasks(tasksData);
        
        // Calculer les statistiques des tâches
        const completed = tasksData.filter(task => task.status === 'COMPLETED').length;
        const pending = tasksData.filter(task => task.status === 'PENDING').length;
        const overdue = tasksData.filter(task => {
          if (!task.dueDate) return false;
          return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
        }).length;
        
        // Charger les notifications
        const notificationsData = await notificationService.getUserNotifications(userId);
        setNotifications(notificationsData);
        
        // Charger les workflows actifs
        const workflowsData = await workflowService.getActiveInstances(userId);
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
    
    fetchDashboardData();
    
    // Configurer WebSocket pour les mises à jour en temps réel
    webSocketService.connect(userId)
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
  }, [userId]);
  
  // Marquer une tâche comme terminée
  const completeTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId, userId);
      
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
  
  // Déterminer la classe CSS pour la date d'échéance
  const getDueDateClass = (dueDate) => {
    if (!dueDate) return '';
    
    const today = new Date();
    const due = new Date(dueDate);
    
    // Si la date d'échéance est dépassée
    if (due < today) {
      return 'overdue';
    }
    
    // Si la date d'échéance est dans les 2 jours
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    if (due <= twoDaysFromNow) {
      return 'soon';
    }
    
    return '';
  };
  
  return (
    <Main>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Tableau de bord</h1>
        
        {isLoading ? (
          <div className="loading">Chargement des données...</div>
        ) : (
          <>
            {/* Statistiques */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon pending"><FaTasks /></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.pendingTasks}</div>
                  <div className="stat-label">Tâches en attente</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon completed"><FaCheckCircle /></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.completedTasks}</div>
                  <div className="stat-label">Tâches terminées</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon overdue"><FaExclamationCircle /></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.overdueCount}</div>
                  <div className="stat-label">Tâches en retard</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon workflow"><FaProjectDiagram /></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.activeWorkflows}</div>
                  <div className="stat-label">Workflows actifs</div>
                </div>
              </div>
            </div>
            
            {/* Conteneur principal pour les widgets */}
            <div className="widgets-container">
              {/* Widget des tâches */}
              <div className="widget tasks-widget">
                <div className="widget-header">
                  <h2><FaTasks /> Mes tâches</h2>
                  <Link to="/tasks" className="view-all">Voir tout</Link>
                </div>
                
                <div className="widget-content">
                  {tasks.length === 0 ? (
                    <div className="empty-state">Aucune tâche en attente</div>
                  ) : (
                    <div className="tasks-list">
                      {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className={`task-item priority-${task.priority.toLowerCase()}`}>
                          <div className="task-content">
                            <div className="task-name">{task.name}</div>
                            <div className="task-description">{task.description}</div>
                            <div className="task-meta">
                              <span className={`due-date ${getDueDateClass(task.dueDate)}`}>
                                <FaCalendarAlt /> {task.dueDate ? formatDate(task.dueDate) : 'Pas de date limite'}
                              </span>
                              <span className={`priority priority-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          
                          {task.status !== 'COMPLETED' && (
                            <button 
                              className="complete-task-btn"
                              onClick={() => completeTask(task.id)}
                              title="Marquer comme terminée"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Widget des notifications */}
              <div className="widget notifications-widget">
                <div className="widget-header">
                  <h2><FaBell /> Notifications récentes</h2>
                  <Link to="/notifications" className="view-all">Voir tout</Link>
                </div>
                
                <div className="widget-content">
                  {notifications.length === 0 ? (
                    <div className="empty-state">Aucune notification</div>
                  ) : (
                    <div className="notifications-list">
                      {notifications.slice(0, 5).map(notification => (
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
              
              {/* Widget des workflows actifs */}
              <div className="widget workflows-widget">
                <div className="widget-header">
                  <h2><FaProjectDiagram /> Workflows actifs</h2>
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
                            <div>Démarré le: {formatDate(workflow.startDate)}</div>
                            <div>Étape actuelle: {workflow.currentTask}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Widget d'activité récente */}
              <div className="widget activity-widget">
                <div className="widget-header">
                  <h2><FaChartLine /> Activité récente</h2>
                </div>
                
                <div className="widget-content">
                  <div className="activity-chart">
                    {/* Ici, on pourrait intégrer un graphique d'activité */}
                    <div className="placeholder-chart">
                      <div className="chart-bar" style={{ height: '60%' }}></div>
                      <div className="chart-bar" style={{ height: '40%' }}></div>
                      <div className="chart-bar" style={{ height: '80%' }}></div>
                      <div className="chart-bar" style={{ height: '30%' }}></div>
                      <div className="chart-bar" style={{ height: '70%' }}></div>
                      <div className="chart-bar" style={{ height: '50%' }}></div>
                      <div className="chart-bar" style={{ height: '90%' }}></div>
                    </div>
                    <div className="chart-legend">
                      <div>Tâches complétées sur les 7 derniers jours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Main>
  );
}

export default Dashboard;
