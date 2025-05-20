//// filepath: /home/gallagher/Documents/GitHub/Kairos/FrontEnd/front-app/src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authService.login(email, password);
      // Stockez les tokens et redirigez vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      setError("Login failed");
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
            {error && <div className="alert alert-danger">{error}</div>}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="invalid-feedback">
                  Please fill in your email
                </div>
              </div>
              <div className="form-group">
                <div className="d-block">
                  <label htmlFor="password" className="control-label">
                    Password
                  </label>
                  <div className="float-right">
                    <a href="#" className="text-small">
                      Forgot Password?
                    </a>
                  </div>
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  name="password"
                  tabIndex="2"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="invalid-feedback">
                  Please fill in your password
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
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="remember-me"
                  >
                    Remember Me
                  </label>
                </div>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-lg btn-block" tabIndex="4">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}