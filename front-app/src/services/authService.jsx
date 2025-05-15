import axios from 'axios';
import { mapUserResponse } from '../types/auth';

const API_URL = 'https://your-api-endpoint.com/auth';

export const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      
      return {
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken,
        user: mapUserResponse(response.data.user)
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${API_URL}/refresh`, {
        refreshToken
      });
      
      return {
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken,
        user: mapUserResponse(response.data.user)
      };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  async getCurrentUser(accessToken) {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      return mapUserResponse(response.data);
    } catch (error) {
      throw new Error('Fetch user failed');
    }
  },

  logout() {
  
    return axios.post(`${API_URL}/logout`);
  }
};