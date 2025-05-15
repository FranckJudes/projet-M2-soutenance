import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import * as tokenUtils from '../utils/tokenUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenUtils.getAccessToken();
      const refreshToken = tokenUtils.getRefreshToken();

      try {
        if (accessToken && !tokenUtils.isTokenExpired(accessToken)) {
          const userData = await authService.getCurrentUser(accessToken);
          setUser(userData);
          setTokens({ accessToken, refreshToken });
        } else if (refreshToken) {
          const newTokens = await authService.refreshToken(refreshToken);
          tokenUtils.setTokens(newTokens);
          
          setUser(newTokens.user);
          setTokens(newTokens);
        }
      } catch (error) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const authResult = await authService.login(email, password);
      
      tokenUtils.setTokens(authResult);
      
      setUser(authResult.user);
      setTokens(authResult);

      return authResult.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout failed on server', error);
    } finally {
      tokenUtils.removeTokens();
      setUser(null);
      setTokens(null);
    }
  };

  const isAuthenticated = () => {
    const accessToken = tokenUtils.getAccessToken();
    return !!accessToken && !tokenUtils.isTokenExpired(accessToken);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAuthority = (authority) => {
    return user?.authorities?.includes(authority);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        tokens, 
        login, 
        logout, 
        isAuthenticated,
        hasRole,
        hasAuthority,
        isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};