import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

class FormService {

  getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Get all forms
   * @returns {Promise} Promise with the list of forms
   */
  getAllForms() {
    return axios.get(`${API_URL}/api/forms`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get a form by id
   * @param {number} id - The form id
   * @returns {Promise} Promise with the form
   */
  getFormById(id) {
    return axios.get(`${API_URL}/api/forms/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new form
   * @param {object} formData - The form data
   * @returns {Promise} Promise with the created form
   */
  createForm(formData) {
    return axios.post(`${API_URL}/api/forms`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a form
   * @param {number} id - The form id
   * @param {object} formData - The updated form data
   * @returns {Promise} Promise with the updated form
   */
  updateForm(id, formData) {
    return axios.put(`${API_URL}/api/forms/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a form
   * @param {number} id - The form id
   * @returns {Promise} Promise with the operation result
   */
  deleteForm(id) {
    return axios.delete(`${API_URL}/api/forms/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Search forms by name
   * @param {string} searchTerm - The search term
   * @returns {Promise} Promise with the search results
   */
  searchForms(searchTerm) {
    return axios.get(`${API_URL}/api/forms/search`, {
      params: { searchTerm },
      headers: this.getAuthHeaders()
    });
  }
}

export default new FormService();
