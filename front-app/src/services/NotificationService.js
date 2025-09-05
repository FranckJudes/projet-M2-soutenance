import axios from 'axios';
import API_URL from '../config/urls.jsx';

class NotificationService {
  getHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
  }

  // Récupérer toutes les notifications d'un utilisateur
  async getUserNotifications() {
    try {
      // Utiliser le token JWT pour l'authentification au lieu de l'ID utilisateur explicite
      const response = await axios.get(`${API_URL.SERVICE_HARMONI}/notifications/user/current`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues d'un utilisateur
  async getUnreadNotifications() {
    try {
      // Utiliser le token JWT pour l'authentification au lieu de l'ID utilisateur explicite
      const response = await axios.get(`${API_URL.SERVICE_HARMONI}/notifications/user/current/unread`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      // Utiliser le token JWT pour l'authentification au lieu de l'ID utilisateur explicite
      const response = await axios.post(`${API_URL.SERVICE_HARMONI}/notifications/${notificationId}/read`, {}, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead() {
    try {
      const response = await axios.post(
        `${API_URL.SERVICE_HARMONI}/notifications/user/current/read-all`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`${API_URL.SERVICE_HARMONI}/notifications/${notificationId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Compter le nombre de notifications non lues pour un utilisateur
  async countUnreadNotifications() {
    try {
      const response = await axios.get(`${API_URL.SERVICE_HARMONI}/notifications/user/current/count`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      throw error;
    }
  }
}

// Créer une instance unique pour toute l'application
const notificationService = new NotificationService();
export default notificationService;
