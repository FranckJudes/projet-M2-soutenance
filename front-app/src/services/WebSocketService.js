import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

if (typeof global === 'undefined') {
  window.global = window;
}

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = {};
    this.connectionPromise = null;
  }

  getHeaders() {
    // Récupérer le token depuis sessionStorage (prioritaire) ou localStorage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (!token) {
      console.warn('Aucun token d\'authentification trouvé pour la connexion WebSocket');
    } else {
      console.log('Token d\'authentification trouvé pour WebSocket');
    }
    
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  connect() {
    if (this.connectionPromise && this.connected) {
      return this.connectionPromise;
    }
    
    // Réinitialiser la promesse de connexion si une tentative précédente a échoué
    this.connectionPromise = null;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Utiliser la variable d'environnement pour l'URL du serveur
        const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;
        console.log('Connecting to WebSocket at:', `${API_URL}/ws`);
        console.log('Using auth token:', localStorage.getItem('token') ? 'Token present' : 'No token found');
        
        // Créer un nouveau client STOMP
        this.stompClient = new Client({
          // Définir une factory WebSocket pour utiliser SockJS
          webSocketFactory: () => new SockJS(`${API_URL}/ws`),
          // Configurer les headers d'authentification
          connectHeaders: this.getHeaders(),
          // Activer la reconnexion automatique
          reconnectDelay: 5000,
          // Activer les heartbeats pour détecter les déconnexions
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // Activer les logs de debug en développement
          debug: import.meta.env.DEV ? (msg) => console.debug(msg) : () => {}
        });
        
        // Gérer l'événement de connexion
        this.stompClient.onConnect = (frame) => {
          console.log('Connected to WebSocket:', frame);
          console.log('Connection headers:', frame.headers);
          this.connected = true;
          this.connectionPromise = Promise.resolve(true);
          
          // S'abonner aux notifications personnelles en utilisant le token
          console.log('Auto-subscribing to notifications using token');
          this.subscribeToUserNotifications()
            .then(() => console.log('Successfully subscribed to notifications'))
            .catch(err => console.error('Failed to subscribe to notifications:', err));
          
          resolve(true);
        };
        
        // Gérer l'événement de déconnexion
        this.stompClient.onStompError = (frame) => {
          console.error('STOMP error:', frame);
          this.connected = false;
        };
        
        // Gérer l'événement d'erreur WebSocket
        this.stompClient.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
          reject(error);
        };
        
        // Gérer l'événement de déconnexion
        this.stompClient.onDisconnect = () => {
          console.log('Disconnected from WebSocket');
          this.connected = false;
        };
        
        // Gérer les tentatives de reconnexion
        this.stompClient.beforeConnect = () => {
          console.log('Attempting to connect to WebSocket...');
        };
        
        // Démarrer la connexion
        this.stompClient.activate();
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        this.connected = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      try {
        this.stompClient.deactivate();
        this.connected = false;
        this.connectionPromise = null;
        console.log('Disconnected from WebSocket');
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
        // Force reset the connection state even if deactivate fails
        this.connected = false;
        this.connectionPromise = null;
      }
    }
  }

  subscribeToUserNotifications() {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe: WebSocket not connected');
      // Tenter de se reconnecter automatiquement
      this.connect();
      return Promise.reject('WebSocket not connected');
    }
    
    // Désabonner les anciennes souscriptions si elles existent
    this.unsubscribeFromAllNotifications();

    console.log('Subscribing to notifications using token');

    // S'abonner aux notifications
    const notificationsSubscription = this.stompClient.subscribe(
      '/user/queue/notifications',
      message => {
        try {
          console.log('Received notification:', message);
          const notification = JSON.parse(message.body);
          // Déclencher un événement personnalisé pour les notifications
          const event = new CustomEvent('notification', { detail: notification });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    );

    // S'abonner au compteur de notifications non lues
    const countSubscription = this.stompClient.subscribe(
      '/user/queue/notifications/count',
      message => {
        try {
          console.log('Received notification count:', message);
          const count = JSON.parse(message.body);
          // Déclencher un événement personnalisé pour le compteur
          const event = new CustomEvent('notification-count', { detail: count });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('Error parsing notification count:', error);
        }
      }
    );

    // Stocker les abonnements pour pouvoir se désabonner plus tard
    this.subscriptions = {
      notifications: notificationsSubscription,
      count: countSubscription
    };

    console.log('Successfully subscribed to notifications using token');
    return Promise.resolve(true);
  }

  unsubscribeFromAllNotifications() {
    if (this.subscriptions) {
      if (this.subscriptions.notifications) {
        this.subscriptions.notifications.unsubscribe();
      }
      if (this.subscriptions.count) {
        this.subscriptions.count.unsubscribe();
      }
      // Unsubscribe from Camunda notifications
      this.unsubscribeFromCamundaNotifications();
      this.subscriptions = {};
    }
  }

  markNotificationAsRead(notificationId) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot send message: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    console.log(`Marking notification ${notificationId} as read`);
    
    this.stompClient.publish({
      destination: '/app/notifications/read',
      headers: {},
      body: JSON.stringify({ notificationId })
    });
    
    return Promise.resolve(true);
  }

  // Camunda Process Engine notification methods
  subscribeToTaskAssignments(userId, callback) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe to task assignments: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    const subscription = this.stompClient.subscribe(
      `/user/${userId}/queue/notifications`,
      message => {
        try {
          const notification = JSON.parse(message.body);
          if (notification.type === 'TASK_ASSIGNED') {
            console.log('Received task assignment:', notification);
            callback(notification);
          }
        } catch (error) {
          console.error('Error parsing task assignment notification:', error);
        }
      }
    );

    // Store subscription for cleanup
    if (!this.subscriptions.camunda) {
      this.subscriptions.camunda = {};
    }
    this.subscriptions.camunda.taskAssignments = subscription;
    
    return subscription;
  }

  subscribeToTaskUpdates(callback) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe to task updates: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    const subscription = this.stompClient.subscribe(
      '/topic/task-updates',
      message => {
        try {
          const notification = JSON.parse(message.body);
          if (['TASK_COMPLETED', 'TASK_UPDATED'].includes(notification.type)) {
            console.log('Received task update:', notification);
            callback(notification);
          }
        } catch (error) {
          console.error('Error parsing task update notification:', error);
        }
      }
    );

    if (!this.subscriptions.camunda) {
      this.subscriptions.camunda = {};
    }
    this.subscriptions.camunda.taskUpdates = subscription;
    
    return subscription;
  }

  subscribeToProcessUpdates(callback) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe to process updates: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    const subscription = this.stompClient.subscribe(
      '/topic/process-updates',
      message => {
        try {
          const notification = JSON.parse(message.body);
          if (['PROCESS_STARTED', 'PROCESS_COMPLETED'].includes(notification.type)) {
            console.log('Received process update:', notification);
            callback(notification);
          }
        } catch (error) {
          console.error('Error parsing process update notification:', error);
        }
      }
    );

    if (!this.subscriptions.camunda) {
      this.subscriptions.camunda = {};
    }
    this.subscriptions.camunda.processUpdates = subscription;
    
    return subscription;
  }

  subscribeToGroupNotifications(callback) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe to group notifications: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    const subscription = this.stompClient.subscribe(
      '/topic/group-notifications',
      message => {
        try {
          const notification = JSON.parse(message.body);
          if (notification.type === 'TASK_ASSIGNED') {
            console.log('Received group task assignment:', notification);
            callback(notification);
          }
        } catch (error) {
          console.error('Error parsing group notification:', error);
        }
      }
    );

    if (!this.subscriptions.camunda) {
      this.subscriptions.camunda = {};
    }
    this.subscriptions.camunda.groupNotifications = subscription;
    
    return subscription;
  }

  subscribeToDeadlineReminders(userId, callback) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe to deadline reminders: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    const subscription = this.stompClient.subscribe(
      `/user/${userId}/queue/notifications`,
      message => {
        try {
          const notification = JSON.parse(message.body);
          if (notification.type === 'DEADLINE_REMINDER') {
            console.log('Received deadline reminder:', notification);
            callback(notification);
          }
        } catch (error) {
          console.error('Error parsing deadline reminder:', error);
        }
      }
    );

    if (!this.subscriptions.camunda) {
      this.subscriptions.camunda = {};
    }
    this.subscriptions.camunda.deadlineReminders = subscription;
    
    return subscription;
  }

  // Enhanced unsubscribe method to handle Camunda subscriptions
  unsubscribeFromCamundaNotifications() {
    if (this.subscriptions.camunda) {
      Object.values(this.subscriptions.camunda).forEach(subscription => {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
      });
      this.subscriptions.camunda = {};
      console.log('Unsubscribed from all Camunda notifications');
    }
  }
}

// Créer une instance unique pour toute l'application
const webSocketService = new WebSocketService();
export default webSocketService;
