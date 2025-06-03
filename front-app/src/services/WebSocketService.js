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
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
  }

  connect(userId) {
    // Stocker l'userId pour les reconnexions
    this.userId = userId || this.userId;
    
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
          this.connected = true;
          this.connectionPromise = Promise.resolve(true);
          resolve(true);
          
          // S'abonner aux notifications personnelles
          if (this.userId) {
            this.subscribeToUserNotifications(this.userId);
          }
        };
        
        // Gérer l'événement de déconnexion
        this.stompClient.onStompError = (frame) => {
          console.error('STOMP error:', frame);
        };
        
        // Gérer l'événement d'erreur WebSocket
        this.stompClient.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
          reject(error);
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
      this.stompClient.disconnect();
      this.connected = false;
      this.connectionPromise = null;
      console.log('Disconnected from WebSocket');
    }
  }

  subscribeToUserNotifications(userId) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot subscribe: WebSocket not connected');
      // Tenter de se reconnecter automatiquement
      this.connect(userId);
      return Promise.reject('WebSocket not connected');
    }
    
    // Désabonner les anciennes souscriptions si elles existent
    if (this.subscriptions[userId]) {
      this.unsubscribeFromUserNotifications(userId);
    }

    console.log(`Subscribing to notifications for user ${userId}`);

    // S'abonner aux notifications
    const notificationsSubscription = this.stompClient.subscribe(
      `/user/${userId}/queue/notifications`,
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
      `/user/${userId}/queue/notifications/count`,
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
    this.subscriptions[userId] = {
      notifications: notificationsSubscription,
      count: countSubscription
    };

    console.log(`Successfully subscribed to notifications for user ${userId}`);
    return Promise.resolve(true);
  }

  unsubscribeFromUserNotifications(userId) {
    if (this.subscriptions[userId]) {
      if (this.subscriptions[userId].notifications) {
        this.subscriptions[userId].notifications.unsubscribe();
      }
      if (this.subscriptions[userId].count) {
        this.subscriptions[userId].count.unsubscribe();
      }
      delete this.subscriptions[userId];
    }
  }

  markNotificationAsRead(notificationId, userId) {
    if (!this.connected || !this.stompClient) {
      console.error('Cannot send message: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
    
    this.stompClient.publish({
      destination: '/app/notifications/read',
      headers: {},
      body: JSON.stringify({ notificationId, userId })
    });
    
    return Promise.resolve(true);
  }
}

// Créer une instance unique pour toute l'application
const webSocketService = new WebSocketService();
export default webSocketService;
