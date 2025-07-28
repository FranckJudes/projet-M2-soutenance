  import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

class MetadataService {

  getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  /**
   * Get all metadata
   * @returns {Promise} Promise with the list of metadata
   */
  getAllMetadata() {
    return axios.get(`${API_URL}/api/metadatas`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get a metadata by id
   * @param {number} id - The metadata id
   * @returns {Promise} Promise with the metadata
   */
  getMetadataById(id) {
    return axios.get(`${API_URL}/api/metadatas/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new metadata
   * @param {object} metadataData - The metadata data
   * @returns {Promise} Promise with the created metadata
   */
  createMetadata(metadataData) {
    return axios.post(`${API_URL}/api/metadatas`, metadataData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a metadata
   * @param {number} id - The metadata id
   * @param {object} metadataData - The updated metadata data
   * @returns {Promise} Promise with the updated metadata
   */
  updateMetadata(id, metadataData) {
    return axios.put(`${API_URL}/api/metadatas/${id}`, metadataData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a metadata
   * @param {number} id - The metadata id
   * @returns {Promise} Promise with the operation result
   */
  deleteMetadata(id) {
    return axios.delete(`${API_URL}/api/metadatas/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}

export default new MetadataService();
