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
        if (appCheck) {
            const { token } = await getToken(appCheck);
            if (token) {
                config.headers['X-Firebase-AppCheck'] = token;
            }
        }
    } catch (err) {
        // App check might not be initialized or fail on some browsers
        console.warn("App Check token retrieval failed:", err.message);
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
