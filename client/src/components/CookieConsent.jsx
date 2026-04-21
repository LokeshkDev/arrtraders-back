import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import './CookieConsent.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Delay showing the popup for a smoother entrance
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = (type) => {
        localStorage.setItem('cookieConsent', type);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-overlay">
            <div className="cookie-consent-card">
                <div className="cookie-content">
                    <h5 className="cookie-title">
                        <Cookie size={20} />
                        Your Privacy Matters
                    </h5>
                    <p className="cookie-text">
                        We use cookies to enhance your shopping experience, analyze site traffic, and serve personalized content. 
                        By clicking "Accept All", you consent to our use of all cookies. You can manage your preferences or read our 
                        <a href="/privacy" className="text-secondary ms-1 fw-bold text-decoration-none">Privacy Policy</a>.
                    </p>
                </div>
                <div className="cookie-actions">
                    <button 
                        className="cookie-btn cookie-btn-outline" 
                        onClick={() => handleAccept('essential')}
                    >
                        Necessary Only
                    </button>
                    <button 
                        className="cookie-btn cookie-btn-primary shadow-sm" 
                        onClick={() => handleAccept('all')}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
