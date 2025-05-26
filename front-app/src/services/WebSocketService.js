import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

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

  connect(userId) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8200/ws');
      this.stompClient = Stomp.over(socket);
      
      this.stompClient.connect(
        {},
        frame => {
          console.log('Connected to WebSocket: ' + frame);
          this.connected = true;
          resolve(true);
          
          // S'abonner aux notifications personnelles
          if (userId) {
            this.subscribeToUserNotifications(userId);
          }
        },
        error => {
          console.error('WebSocket connection error:', error);
          this.connected = false;
          this.connectionPromise = null;
          reject(error);
        }
      );
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
    if (!this.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    // S'abonner aux notifications
    const notificationsSubscription = this.stompClient.subscribe(
      `/user/${userId}/queue/notifications`,
      message => {
        try {
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
    if (!this.connected) {
      console.error('Cannot send message: WebSocket not connected');
      return Promise.reject('WebSocket not connected');
    }

    this.stompClient.send(
      '/app/notifications/read',
      {},
      JSON.stringify({ notificationId, userId })
    );
  }
}

// Créer une instance unique pour toute l'application
const webSocketService = new WebSocketService();
export default webSocketService;
