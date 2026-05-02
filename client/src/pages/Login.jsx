import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect path from URL
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate(redirectPath || '/profile');
    }
  }, [navigate, redirectPath]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, { email, password });

      // Store BOTH user info and token for header-based auth
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) localStorage.setItem('userToken', data.token);

      window.dispatchEvent(new Event('storage'));
      
      // Handle redirection
      const nextPath = redirectPath || (data.isAdmin ? '/admin' : '/');
      window.location.href = nextPath;
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

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/google-login`, { idToken });

      // Store BOTH user info and token for header-based auth
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) localStorage.setItem('userToken', data.token);
      
      window.dispatchEvent(new Event('storage'));
      
      // Handle redirection
      const nextPath = redirectPath || '/';
      window.location.href = nextPath;
    } catch (error) {
      console.error('Google Auth Error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMsg = error.response?.data?.message || 'An error occurred during Google registration';
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
        <div className="card shadow-premium border-0 p-3 login-card animate-fade-in">
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <span className="font-label text-primary extra-small fw-bold uppercase tracking-widest mb-2 d-inline-block">Sign In</span>
              <h2 className="fw-bold font-headline text-primary mb-2 display-6">Login</h2>
              <p className="text-muted small font-body">Enter your email and password to access your account.</p>
            </div>

            <button 
              type="button" 
              className="btn btn-outline-dark bg-white w-100 fw-bold mb-4 google-btn d-flex align-items-center justify-content-center"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="me-2" 
                width="20"
              />
              Continue with Google
            </button>

            <div className="google-divider my-4">
              <span>OR</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">Email Address</label>
                <input 
                  type="email" 
                  className="form-control login-input" 
                  placeholder="admin@arrahman.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">Password</label>
                <input 
                  type="password" 
                  className="form-control login-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold mb-3 login-btn" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Sign In
              </button>

              <div className="text-center">
                <a href="#" className="small text-decoration-none text-muted">Forgot password?</a>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
