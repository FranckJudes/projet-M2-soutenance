import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { backendHealthMonitor } from '../../api/BackendHealthMonitor.jsx';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    console.log('Login useEffect - Vérification de l\'authentification');
    if (authService.isAuthenticated()) {
      console.log('Login useEffect - Utilisateur déjà authentifié, redirection vers dashboard');
      // Démarrer le monitoring avant de rediriger
      backendHealthMonitor.startMonitoring();
      navigate('/dashboard');
    }
    
    // Restaurer l'email si "se souvenir de moi" était activé
    const storedEmail = sessionStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, [navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      console.log('Login - Tentative de connexion avec:', email);
      const response = await authService.login(email, password);
      console.log('Login - Réponse reçue:', response);
      
      // Gérer "se souvenir de moi"
      if (rememberMe) {
        sessionStorage.setItem('rememberedEmail', email);
      } else {
        sessionStorage.removeItem('rememberedEmail');
      }
      
      // Démarrer le monitoring immédiatement après une connexion réussie
      backendHealthMonitor.startMonitoring();
      
      toast.success('Connexion réussie', { id: loadingToast });
      console.log('Login - Redirection vers dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login - Erreur de connexion:', err);
      const errorMessage = err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
      toast.error(errorMessage, { id: loadingToast });
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