import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { getToken } from "firebase/app-check";
import { app, appCheck } from "./firebase";
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

axios.defaults.withCredentials = true;

// Axios Interceptor for Firebase App Check
axios.interceptors.request.use(async (config) => {
    try {
        // 1. Add App Check Token
        if (appCheck) {
            const { token } = await getToken(appCheck);
            if (token) config.headers['X-Firebase-AppCheck'] = token;
        }

        // 2. Add Auth Token (Fix for 401 errors on subdomains)
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            config.headers['Authorization'] = `Bearer ${userToken}`;
        }
    } catch (err) {
        console.warn("Request interceptor error:", err.message);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
