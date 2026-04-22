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
    // 1. Try to add App Check Token (Optional)
    try {
        if (appCheck) {
            const { token } = await getToken(appCheck);
            if (token) config.headers['X-Firebase-AppCheck'] = token;
        }
    } catch (err) {
        console.warn("App Check skipped:", err.message);
    }

    // 2. Add Auth Token (Mandatory for subdomains)
    try {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            config.headers['Authorization'] = `Bearer ${userToken}`;
        }
    } catch (err) {
        console.error("Auth Token error:", err.message);
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
