import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

class ValeurService {

  getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Get all valeurs by domaine valeur id
   * @param {number} domaineValeurId - The domaine valeur id
   * @returns {Promise} Promise with the list of valeurs
   */
  getValeursByDomaineValeurId(domaineValeurId) {
    return axios.get(`${API_URL}/api/valeurs/domaine/${domaineValeurId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get all active valeurs by domaine valeur id
   * @param {number} domaineValeurId - The domaine valeur id
   * @returns {Promise} Promise with the list of active valeurs
   */
  getActiveValeursByDomaineValeurId(domaineValeurId) {
    return axios.get(`${API_URL}/api/valeurs/domaine/${domaineValeurId}/active`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get a valeur by id
   * @param {number} id - The valeur id
   * @returns {Promise} Promise with the valeur
   */
  getValeurById(id) {
    return axios.get(`${API_URL}/api/valeurs/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new valeur
   * @param {object} valeurData - The valeur data
   * @returns {Promise} Promise with the created valeur
   */
  createValeur(valeurData) {
    return axios.post(`${API_URL}/api/valeurs`, valeurData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a valeur
   * @param {number} id - The valeur id
   * @param {object} valeurData - The updated valeur data
   * @returns {Promise} Promise with the updated valeur
   */
  updateValeur(id, valeurData) {
    return axios.put(`${API_URL}/api/valeurs/${id}`, valeurData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a valeur
   * @param {number} id - The valeur id
   * @returns {Promise} Promise with the operation result
   */
  deleteValeur(id) {
    return axios.delete(`${API_URL}/api/valeurs/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Toggle valeur active status
   * @param {number} id - The valeur id
   * @returns {Promise} Promise with the updated valeur
   */
  toggleValeurStatus(id) {
    return axios.patch(`${API_URL}/api/valeurs/${id}/toggle-status`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Count valeurs by domaine valeur id
   * @param {number} domaineValeurId - The domaine valeur id
   * @returns {Promise} Promise with the count
   */
  countValeursByDomaineValeurId(domaineValeurId) {
    return axios.get(`${API_URL}/api/valeurs/domaine/${domaineValeurId}/count`, {
      headers: this.getAuthHeaders()
    });
  }
}

export default new ValeurService();
