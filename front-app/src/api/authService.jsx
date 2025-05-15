import axiosInstance from '../config/axiosInstance';
import axios from 'axios';
import { API_URL } from '../config/urls.jsx';

const LOGIN_USER = API_URL.LOGGIN_USER;
const REFRESH_TOKEN_USER = API_URL.REFRESH_TOKEN_USER;

export const authService = {
  async login(email, password) {
    
    try {
      const response = await axios.post({LOGIN_USER}, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${REFRESH_TOKEN_USER}`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/me');
      return response.data;
    } catch (error) {
      throw new Error('Fetch user failed');
    }
  },

  logout() {
  }
};