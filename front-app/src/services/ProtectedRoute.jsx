import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {authService} from '../api/authService.jsx';
import { backendHealthMonitor } from '../api/BackendHealthMonitor.jsx';
import axios from 'axios';
import API_URL from '../config/urls.jsx';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setIsVerifying(false);
          return;
        }

        const token = authService.getToken();
        if (!token) {
          setIsAuthenticated(false);
          setIsVerifying(false);
          return;
        }

        const response = await axios.get(`${API_URL.SERVICE_HARMONI}/auth/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 5000
        });


        // Vérifier que la réponse contient success: true
        if (response.data && response.data.success === true) {
          // Vérifier le rôle si requis
          if (requiredRole) {
            const userRole = authService.getUserRole();
            if (userRole !== requiredRole) {
              toast.error('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
              setIsAuthenticated(false);
              setIsVerifying(false);
              return;
            }
          }

          setIsAuthenticated(true);
          
          // Démarrer le monitoring si pas déjà actif
          if (!backendHealthMonitor.isMonitoring) {
            backendHealthMonitor.startMonitoring();
          }
        } else {
          authService.logout();
          setIsAuthenticated(false);
        }
      } catch (error) {
        
        if (error.response && error.response.status === 401) {
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          authService.logout();
        } else if (!error.response) {
          toast.error('Impossible de vérifier votre authentification. Le serveur semble indisponible.');
        }
        
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [location.pathname, requiredRole]);

  if (isVerifying) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Chargement...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    console.log('ProtectedRoute - Redirection vers /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute - Affichage du contenu protégé');
  return children;
};

export default ProtectedRoute;