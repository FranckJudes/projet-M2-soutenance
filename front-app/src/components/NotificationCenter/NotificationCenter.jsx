import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaExclamationTriangle, FaInfoCircle, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Charger les notifications
  useEffect(() => {
    // Dans une implémentation réelle, nous ferions un appel API ici
    // Simulons des données pour le moment
    const mockNotifications = [
      {
        id: '1',
        title: 'Nouvelle tâche assignée',
        message: 'Vous avez été assigné à la tâche "Réviser le document de spécifications"',
        type: 'TASK_ASSIGNED',
        priority: 'HIGH',
        status: 'UNREAD',
        creationDate: '2025-05-17T07:30:00',
        sourceId: 'task-1',
        sourceType: 'TaskInstance',
        actionUrl: '/tasks/task-1'
      },
      {
        id: '2',
        title: 'Tâche complétée',
        message: 'La tâche "Créer les maquettes UI" a été complétée avec succès',
        type: 'TASK_COMPLETED',
        priority: 'NORMAL',
        status: 'UNREAD',
        creationDate: '2025-05-16T16:45:00',
        sourceId: 'task-6',
        sourceType: 'TaskInstance',
        actionUrl: '/tasks/task-6'
      },
      {
        id: '3',
        title: 'Tâche en retard',
        message: 'La tâche "Corriger le bug #123" est en retard. Date d\'échéance: 2025-05-18',
        type: 'TASK_OVERDUE',
        priority: 'URGENT',
        status: 'UNREAD',
        creationDate: '2025-05-16T09:15:00',
        sourceId: 'task-3',
        sourceType: 'TaskInstance',
        actionUrl: '/tasks/task-3'
      },
      {
        id: '4',
        title: 'Processus démarré',
        message: 'Le processus "Validation de document" a été démarré',
        type: 'PROCESS_STARTED',
        priority: 'NORMAL',
        status: 'READ',
        creationDate: '2025-05-15T14:20:00',
        sourceId: 'process-1',
        sourceType: 'WorkflowInstance',
        actionUrl: '/processes/process-1'
      },
      {
        id: '5',
        title: 'Commentaire ajouté',
        message: 'Jean Dupont a ajouté un commentaire à la tâche "Optimiser les requêtes SQL"',
        type: 'COMMENT_ADDED',
        priority: 'LOW',
        status: 'READ',
        creationDate: '2025-05-14T11:05:00',
        sourceId: 'task-4',
        sourceType: 'TaskInstance',
        actionUrl: '/tasks/task-4'
      }
    ];

    setNotifications(mockNotifications);
    
    // Calculer le nombre de notifications non lues
    const unread = mockNotifications.filter(notification => notification.status === 'UNREAD').length;
    setUnreadCount(unread);
    
    // Dans une implémentation réelle, nous mettrions en place un WebSocket ou une connexion SSE ici
    // pour recevoir les notifications en temps réel
    
    // Simuler l'arrivée d'une nouvelle notification après 10 secondes
    const timer = setTimeout(() => {
      const newNotification = {
        id: '6',
        title: 'Rappel de tâche',
        message: 'Rappel: La tâche "Mettre à jour les dépendances" doit être complétée avant le 2025-05-30',
        type: 'TASK_REMINDER',
        priority: 'NORMAL',
        status: 'UNREAD',
        creationDate: new Date().toISOString(),
        sourceId: 'task-5',
        sourceType: 'TaskInstance',
        actionUrl: '/tasks/task-5'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Marquer une notification comme lue
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => {
      if (notification.id === id && notification.status === 'UNREAD') {
        setUnreadCount(prev => prev - 1);
        return { ...notification, status: 'READ' };
      }
      return notification;
    }));
    
    // Dans une implémentation réelle, nous ferions un appel API ici
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => {
      return { ...notification, status: 'READ' };
    }));
    setUnreadCount(0);
    
    // Dans une implémentation réelle, nous ferions un appel API ici
  };

  // Supprimer une notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.status === 'UNREAD') {
      setUnreadCount(prev => prev - 1);
    }
    
    setNotifications(notifications.filter(notification => notification.id !== id));
    
    // Dans une implémentation réelle, nous ferions un appel API ici
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.status === 'UNREAD';
    if (filter === 'read') return notification.status === 'READ';
    return true;
  });

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <FaUser className="notification-icon task-assigned" />;
      case 'TASK_COMPLETED':
        return <FaCheck className="notification-icon task-completed" />;
      case 'TASK_OVERDUE':
        return <FaExclamationTriangle className="notification-icon task-overdue" />;
      case 'TASK_REMINDER':
        return <FaCalendarAlt className="notification-icon task-reminder" />;
      case 'PROCESS_STARTED':
      case 'PROCESS_COMPLETED':
        return <FaInfoCircle className="notification-icon process" />;
      default:
        return <FaInfoCircle className="notification-icon" />;
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Aujourd'hui, afficher l'heure
      return `Aujourd'hui à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      // Hier
      return 'Hier';
    } else if (diffDays < 7) {
      // Cette semaine
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      return days[date.getDay()];
    } else {
      // Plus d'une semaine
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button className="btn-link" onClick={markAllAsRead}>Tout marquer comme lu</button>
              <div className="notification-filters">
                <button 
                  className={`btn-filter ${filter === 'all' ? 'active' : ''}`} 
                  onClick={() => setFilter('all')}
                >
                  Toutes
                </button>
                <button 
                  className={`btn-filter ${filter === 'unread' ? 'active' : ''}`} 
                  onClick={() => setFilter('unread')}
                >
                  Non lues
                </button>
                <button 
                  className={`btn-filter ${filter === 'read' ? 'active' : ''}`} 
                  onClick={() => setFilter('read')}
                >
                  Lues
                </button>
              </div>
            </div>
          </div>
          
          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                Aucune notification
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.status === 'UNREAD' ? 'unread' : ''} priority-${notification.priority.toLowerCase()}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    {getNotificationIcon(notification.type)}
                    <div className="notification-details">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-date">{formatDate(notification.creationDate)}</div>
                    </div>
                  </div>
                  <button 
                    className="btn-delete" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="notification-footer">
            <a href="/notifications" className="view-all">Voir toutes les notifications</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
