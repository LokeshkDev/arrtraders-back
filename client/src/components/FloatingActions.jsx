import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, ChevronUp, Headset, X } from 'lucide-react';
import './FloatingActions.css';

const FloatingActions = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="floating-actions-container">
            {/* Left Side: Contact Actions (Horizontal Expanding) */}
            <div className="contact-actions-left d-flex align-items-center pe-auto">
                <button
                    className="floating-btn support-toggle-btn shadow-lg z-2"
                    onClick={() => setIsSupportOpen(!isSupportOpen)}
                    title="Support"
                >
                    {isSupportOpen ? <X size={24} /> : <Headset size={24} />}
                </button>

                <div className={`support-actions-horizontal d-flex gap-2 ms-2 ${isSupportOpen ? 'open' : ''}`}>
                    <a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="floating-btn mini whatsapp-btn shadow-sm"
                        title="WhatsApp Chat"
                    >
                        <MessageCircle size={20} fill="currentColor" />
                    </a>
                    <a
                        href="tel:+919876543210"
                        className="floating-btn mini call-btn shadow-sm"
                        title="Call Us"
                    >
                        <Phone size={20} fill="currentColor" />
                    </a>
                </div>
            </div>

            {/* Right Side: Scroll to Top (only visible when scrolled) */}
            <div className={`scroll-actions-right ${isVisible ? 'visible' : ''}`}>
                <button
                    onClick={scrollToTop}
                    className="floating-btn scroll-top-btn shadow-lg"
                    title="Scroll to Top"
                >
                    <ChevronUp size={28} />
                </button>
            </div>
        </div>
    );
};

export default FloatingActions;
