import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './FloatingActions.css';

const FloatingActions = () => {
    const [isVisible, setIsVisible] = useState(false);

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
