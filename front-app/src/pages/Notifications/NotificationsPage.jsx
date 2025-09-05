import React, { useState, useEffect } from 'react';
import { FaCheck, FaTrash, FaExclamationTriangle, FaInfoCircle, FaCalendarAlt, FaUser, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './NotificationsPage.css';
import notificationService from '../../services/NotificationService';
import webSocketService from '../../services/WebSocketService';
import Main from '../../layout/Main';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Nous n'avons plus besoin de récupérer l'ID utilisateur car nous utilisons le token d'authentification
  
  // État pour suivre la connexion WebSocket
  const [wsConnected, setWsConnected] = useState(false);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    // Établir la connexion WebSocket
    webSocketService.connect()
      .then(() => {
        console.log('WebSocket connecté avec succès');
        setWsConnected(true);
        return webSocketService.subscribeToUserNotifications();
      })
      .then(() => {
        console.log('Abonnement aux notifications réussi');
      })
      .catch(error => {
        console.error('Erreur de connexion WebSocket:', error);
        toast.error('Impossible de se connecter au service de notifications en temps réel');
      });

    // Nettoyage lors du démontage du composant
    return () => {
      console.log('Déconnexion du WebSocket');
      webSocketService.unsubscribeFromAllNotifications();
      // Ne pas déconnecter complètement pour permettre aux autres pages de recevoir des notifications
    };
  }, []); // Plus besoin de dépendre de userId car on utilise le token

  // Écouter les notifications en temps réel
  useEffect(() => {
    // Gestionnaire pour les nouvelles notifications
    const handleNewNotification = (event) => {
      const notification = event.detail;
      console.log('Nouvelle notification reçue via WebSocket:', notification);
      
      // Ajouter la notification à la liste existante
      setNotifications(prevNotifications => [notification, ...prevNotifications]);
      
      // Incrémenter le compteur de notifications non lues
      setUnreadCount(prev => prev + 1);
      
      // Afficher une notification toast
      toast.success(`Nouvelle notification: ${notification.title}`);
    };
    
    // Gestionnaire pour le compteur de notifications
    const handleNotificationCount = (event) => {
      const count = event.detail;
      console.log('Mise à jour du compteur de notifications:', count);
      setUnreadCount(count);
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('notification', handleNewNotification);
    window.addEventListener('notification-count', handleNotificationCount);
    
    // Nettoyage
    return () => {
      window.removeEventListener('notification', handleNewNotification);
      window.removeEventListener('notification-count', handleNotificationCount);
    };
  }, []); // Exécuter une seule fois au montage

  // Charger les notifications depuis l'API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getUserNotifications();
        setNotifications(data);
        
        // Compter les notifications non lues
        const unreadData = data.filter(n => n.status === 'UNREAD');
        setUnreadCount(unreadData.length);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        toast.error('Erreur lors du chargement des notifications');
        setIsLoading(false);
        
        // Utiliser des données fictives en cas d'erreur
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
      },
      {
        id: '6',
        title: 'Document téléchargé',
        message: 'Marie Martin a téléchargé le document "Rapport mensuel.pdf"',
        type: 'DOCUMENT_UPLOADED',
        priority: 'LOW',
        status: 'READ',
        creationDate: '2025-05-13T15:30:00',
        sourceId: 'document-1',
        sourceType: 'Document',
        actionUrl: '/documents/document-1'
      },
      {
        id: '7',
        title: 'Processus complété',
        message: 'Le processus "Approbation de congés" a été complété avec succès',
        type: 'PROCESS_COMPLETED',
        priority: 'NORMAL',
        status: 'READ',
        creationDate: '2025-05-12T09:45:00',
        sourceId: 'process-2',
        sourceType: 'WorkflowInstance',
        actionUrl: '/processes/process-2'
      },
      {
        id: '8',
        title: 'Alerte système',
        message: 'Le système sera en maintenance le 2025-05-20 de 22h à 23h',
        type: 'SYSTEM_ALERT',
        priority: 'HIGH',
        status: 'READ',
        creationDate: '2025-05-10T10:00:00',
        sourceId: 'system-1',
        sourceType: 'System',
        actionUrl: '/system/alerts'
      }
    ];
    
        setNotifications(mockNotifications);
      }
    };
    
    fetchNotifications();
  }, []);
  
  // Ce useEffect est supprimé car il fait double emploi avec celui ci-dessus

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (
        n.id === id ? { ...n, status: 'READ' } : n
      )));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marquée comme lue');
    } catch (e) {
      console.error('Erreur lors du marquage comme lu:', e);
      toast.error("Impossible de marquer la notification comme lue");
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (e) {
      console.error('Erreur lors du marquage de toutes les notifications:', e);
      toast.error("Impossible de marquer toutes les notifications comme lues");
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification supprimée');
    } catch (e) {
      console.error('Erreur lors de la suppression de la notification:', e);
      toast.error("Impossible de supprimer la notification");
    }
  };

  // Supprimer toutes les notifications lues
  const deleteAllRead = () => {
    setNotifications(notifications.filter(notification => notification.status === 'UNREAD'));
    
    toast.success('Toutes les notifications lues ont été supprimées');
    // Dans une implémentation réelle, nous ferions un appel API ici
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filtre par statut
    if (filter === 'unread' && notification.status !== 'UNREAD') return false;
    if (filter === 'read' && notification.status !== 'READ') return false;
    
    // Filtre par type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    // Filtre par recherche
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Trier les notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.creationDate);
      const dateB = new Date(b.creationDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
      const orderA = priorityOrder[a.priority];
      const orderB = priorityOrder[b.priority];
      return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
    }
    return 0;
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
      case 'SYSTEM_ALERT':
        return <FaExclamationTriangle className="notification-icon system-alert" />;
      default:
        return <FaInfoCircle className="notification-icon" />;
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Obtenir le nom lisible du type de notification
  const getReadableType = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED': return 'Tâche assignée';
      case 'TASK_COMPLETED': return 'Tâche complétée';
      case 'TASK_OVERDUE': return 'Tâche en retard';
      case 'TASK_REMINDER': return 'Rappel de tâche';
      case 'PROCESS_STARTED': return 'Processus démarré';
      case 'PROCESS_COMPLETED': return 'Processus complété';
      case 'COMMENT_ADDED': return 'Commentaire ajouté';
      case 'DOCUMENT_UPLOADED': return 'Document téléchargé';
      case 'SYSTEM_ALERT': return 'Alerte système';
      default: return 'Information';
    }
  };

  // Afficher un indicateur de chargement
  if (isLoading) {
    return <div className="loading">Chargement des notifications...</div>;
  }

  return (
    <Main>
      <div className="notifications-page">
      <div className="notifications-header">
        <h1>Centre de Notifications</h1>
        <div className="notifications-actions">
          <button className="btn btn-primary" onClick={markAllAsRead}>
            <FaCheck /> Tout marquer comme lu
          </button>
          <button className="btn btn-danger" onClick={deleteAllRead}>
            <FaTrash /> Supprimer les notifications lues
          </button>
        </div>
      </div>
      
      <div className="notifications-filters">
        <div className="search-box">
          <FaSearch />
          <input 
            type="text" 
            placeholder="Rechercher dans les notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Statut:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tous</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tous</option>
            <option value="TASK_ASSIGNED">Tâche assignée</option>
            <option value="TASK_COMPLETED">Tâche complétée</option>
            <option value="TASK_OVERDUE">Tâche en retard</option>
            <option value="PROCESS_STARTED">Processus démarré</option>
            <option value="PROCESS_COMPLETED">Processus complété</option>
            <option value="SYSTEM_ALERT">Alerte système</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Trier par:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="priority">Priorité</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Ordre:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>
      </div>
      
      <div className="notifications-count">
        {filteredNotifications.length} notification(s) trouvée(s)
      </div>
      
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            Aucune notification ne correspond à vos critères de recherche
          </div>
        ) : (
          sortedNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.status === 'UNREAD' ? 'unread' : ''} priority-${notification.priority.toLowerCase()}`}
            >
              <div className="notification-content">
                {getNotificationIcon(notification.type)}
                <div className="notification-details">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-meta">
                    <span className="notification-date">{formatDate(notification.creationDate)}</span>
                    <span className="notification-type">{getReadableType(notification.type)}</span>
                    <span className={`notification-priority priority-${notification.priority.toLowerCase()}`}>
                      {notification.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="notification-actions">
                {notification.status === 'UNREAD' && (
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => markAsRead(notification.id)}
                    title="Marquer comme lu"
                  >
                    <FaCheck />
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => deleteNotification(notification.id)}
                  title="Supprimer"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </Main>
  );
};

export default NotificationsPage;
