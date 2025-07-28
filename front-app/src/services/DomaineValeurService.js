import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

class DomaineValeurService {

  getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Get all domaine valeurs
   * @returns {Promise} Promise with the list of domaine valeurs
   */
  getAllDomaineValeurs() {
    return axios.get(`${API_URL}/api/domaine-valeurs`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get a domaine valeur by id
   * @param {number} id - The domaine valeur id
   * @returns {Promise} Promise with the domaine valeur
   */
  getDomaineValeurById(id) {
    return axios.get(`${API_URL}/api/domaine-valeurs/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new domaine valeur
   * @param {object} domaineValeurData - The domaine valeur data
   * @returns {Promise} Promise with the created domaine valeur
   */
  createDomaineValeur(domaineValeurData) {
    return axios.post(`${API_URL}/api/domaine-valeurs`, domaineValeurData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a domaine valeur
   * @param {number} id - The domaine valeur id
   * @param {object} domaineValeurData - The updated domaine valeur data
   * @returns {Promise} Promise with the updated domaine valeur
   */
  updateDomaineValeur(id, domaineValeurData) {
    return axios.put(`${API_URL}/api/domaine-valeurs/${id}`, domaineValeurData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a domaine valeur
   * @param {number} id - The domaine valeur id
   * @returns {Promise} Promise with the operation result
   */
  deleteDomaineValeur(id) {
    return axios.delete(`${API_URL}/api/domaine-valeurs/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}

export default new DomaineValeurService();
