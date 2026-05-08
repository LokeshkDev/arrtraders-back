import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import './Login.css';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect path from URL
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');
  
  // Distinguish between Admin and User login
  const isAdminLogin = redirectPath?.includes('/arrt-panel') || location.pathname === '/arrt-panel/login';

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const parsed = JSON.parse(userInfoStr);
      // If redirect target is admin panel but user is NOT admin, go to profile
      if (redirectPath?.includes('/arrt-panel') && !parsed.isAdmin) {
        navigate('/profile');
      } else {
        navigate(redirectPath || '/profile');
      }
    }
  }, [navigate, redirectPath]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });

      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) localStorage.setItem('userToken', data.token);
      window.dispatchEvent(new Event('storage'));
      
      const nextPath = redirectPath || (data.isAdmin ? '/arrt-panel' : '/');
      navigate(nextPath, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const { data } = await axios.post(`${API_BASE_URL}/api/users/google-login`, { idToken });

      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) localStorage.setItem('userToken', data.token);
      window.dispatchEvent(new Event('storage'));
      
      navigate(redirectPath || '/', { replace: true });
    } catch (error) {
      console.error('Google Auth Error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(error.response?.data?.message || 'An error occurred during Google registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
        <div className="card shadow-premium border-0 p-3 login-card animate-fade-in">
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-5">
              <span className="font-label text-primary extra-small fw-bold uppercase tracking-widest mb-2 d-inline-block">
                {isAdminLogin ? 'System Administration' : 'Customer Access'}
              </span>
              <h2 className="fw-bold font-headline text-primary mb-2 display-6">
                {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
              </h2>
              <p className="text-muted small font-body">
                {isAdminLogin 
                  ? 'Access the global marketplace control center.' 
                  : 'Sign in to access your premium account.'}
              </p>
            </div>

            {isAdminLogin ? (
              <form onSubmit={handleAdminLogin}>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">Admin Email</label>
                  <input 
                    type="email" 
                    className="form-control login-input" 
                    placeholder="admin@arrahman.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">Secure Password</label>
                  <input 
                    type="password" 
                    className="form-control login-input" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold mb-3 login-btn" disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
                  ADMIN ACCESS
                </button>
              </form>
            ) : (
              <div className="py-4">
                <button 
                  type="button" 
                  className="btn btn-outline-dark bg-white w-100 fw-bold mb-4 google-btn d-flex align-items-center justify-content-center"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="me-2" width="20" />
                  Continue with Google
                </button>

                <div className="mt-4 pt-3 border-top text-center">
                  <p className="small text-muted">
                    Secure authentication provided by Google
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Login;
