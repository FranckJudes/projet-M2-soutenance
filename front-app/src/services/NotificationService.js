import axios from 'axios';

const API_URL = 'http://localhost:8200/api';

class NotificationService {
  getHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
  }

  // Récupérer toutes les notifications d'un utilisateur
  async getUserNotifications(userId) {
    try {
      const response = await axios.get(`${API_URL}/notifications/ user/${userId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues d'un utilisateur
  async getUnreadNotifications(userId) {
    try {
      const response = await axios.get(`${API_URL}/notifications/user/${userId}/unread`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId, userId) {
    try {
      const response = await axios.post(`${API_URL}/notifications/${notificationId}/read?userId=${userId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId) {
    try {
      const response = await axios.post(`${API_URL}/notifications/user/${userId}/read-all`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId, userId) {
    try {
      const response = await axios.delete(`${API_URL}/notifications/${notificationId}?userId=${userId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Compter le nombre de notifications non lues pour un utilisateur
  async countUnreadNotifications(userId) {
    try {
      const response = await axios.get(`${API_URL}/notifications/user/${userId}/count`, {
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
