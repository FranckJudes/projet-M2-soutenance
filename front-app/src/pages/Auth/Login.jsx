import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { backendHealthMonitor } from '../../api/BackendHealthMonitor.jsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config/urls.jsx';
import { Form, Input, Button, Checkbox, Card, Typography, Row, Col, Spin, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import '../../../src/styles/login.css';

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
    console.log(storedEmail);
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


  const { Title, Text } = Typography;

  const onFinish = (values) => {
    handleSubmit({
      preventDefault: () => {}
    });
  };

  return (
    <div className="login-container">
      <Row justify="center" align="middle" className="login-row">
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Card 
            className="login-card" 
            bordered={false}
            cover={
              <div className="login-header">
                <Title level={2} className="login-title">Harmoni</Title>
                <Text type="secondary">Plateforme de gestion des processus métier</Text>
              </div>
            }
          >
            <Form
              name="login"
              className="login-form"
              initialValues={{ remember: rememberMe, email: email }}
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: 'Veuillez saisir un email valide' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined className="site-form-item-icon" />} 
                  placeholder="Email" 
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  autoComplete="email"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Mot de passe"
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  autoComplete="current-password"
                />
              </Form.Item>
              
              <Form.Item>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    >
                      Se souvenir de moi
                    </Checkbox>
                  </Col>
                  <Col>
                    <Link to="/forgot-password" className="login-form-forgot">
                      Mot de passe oublié
                    </Link>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="login-form-button" 
                  block
                  icon={<LoginOutlined />}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </Form.Item>
            </Form>
            
            <div className="login-footer">
              <Text type="secondary">© {new Date().getFullYear()} Harmoni - Tous droits réservés</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}