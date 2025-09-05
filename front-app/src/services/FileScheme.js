import axios from 'axios';
import API_URL from '../config/urls.jsx';

class FileSchemeService {
  getAuthHeaders() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Fetch all file schemes (flat list)
  getAllFileSchemes() {
    return axios.get(`${API_URL.BPMN}/api/file-schemes`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Fetch pre-built tree from backend if available
  getFileSchemeTree() {
    return axios.get(`${API_URL.BPMN}/api/file-schemes/tree`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export default new FileSchemeService();
