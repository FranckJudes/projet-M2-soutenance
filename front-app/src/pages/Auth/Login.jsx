import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { backendHealthMonitor } from '../../api/BackendHealthMonitor.jsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config/urls.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  const verifyAuthentication = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      await axios.get(`${API_URL.SERVICE_HARMONI}/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        },
        timeout: 3000
      });
      
      // Démarrer le monitoring avant de rediriger
      backendHealthMonitor.startMonitoring();
      navigate('/dashboard');
    } catch (error) {
      if (!error.response) {
        toast.error('Le serveur est indisponible. Vous serez automatiquement reconnecté lorsqu\'il sera de nouveau accessible.');
      } else if (error.response.status === 401) {
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        authService.logout();
      }
    }
  }, [navigate]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
    
    verifyAuthentication();
  }, [verifyAuthentication]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Veuillez entrer un email valide');
      return;
    }
    
    const loadingToast = toast.loading('Connexion en cours...');
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (rememberMe) {
        sessionStorage.setItem('rememberedEmail', email);
      } else {
        sessionStorage.removeItem('rememberedEmail');
      }
      
      // Démarrer le monitoring immédiatement après une connexion réussie
      backendHealthMonitor.startMonitoring();
      
      toast.success('Connexion réussie', { id: loadingToast });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
      
      toast.error(errorMessage, { id: loadingToast });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="pt-5">
      <div className="col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4">
        <div className="card card-primary">
          <div className="card-header">
            <h4>Harmoni Authentification</h4>
          </div>
          <div className="card-body">
            
            
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  name="email"
                  tabIndex="1"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <div className="invalid-feedback">
                  Veuillez renseigner votre email
                </div>
              </div>
              <div className="form-group">
                <div className="d-block">
                  <label htmlFor="password" className="control-label">
                    Mot de passe
                  </label>
                  <div className="float-right">
                    <Link to="/forgot-password" className="text-small">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  name="password"
                  tabIndex="2"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <div className="invalid-feedback">
                  Veuillez renseigner votre mot de passe
                </div>
              </div>
              <div className="form-group">
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    name="remember"
                    className="custom-control-input"
                    tabIndex="3"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="remember-me"
                  >
                    Se souvenir de moi
                  </label>
                </div>
              </div>
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg btn-block" 
                  tabIndex="4"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </div>
            </form>
            <div className="mt-5 text-center">
              <p>Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}