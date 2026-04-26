import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';
import './ComingSoon.css';

const ComingSoon = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Set target date (e.g., 30 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="coming-soon-container">
            <div className="coming-soon-bg-overlay"></div>
            
            <div className="coming-soon-content">
                <div className="coming-soon-logo animate-fade-in">
                    AR RAHMAN
                </div>
                
                <h1 className="coming-soon-title animate-stagger-1">
                    Artisanal Luxury <span>Coming Soon</span>
                </h1>
                
                <p className="coming-soon-subtitle animate-stagger-2">
                    We are crafting a new experience for the connoisseurs of fine taste. 
                    Our curated treasury of premium dates and exotic nuts will be available shortly.
                </p>

                <div className="countdown-grid animate-stagger-3">
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.days}</span>
                        <span className="countdown-label">Days</span>
                    </div>
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.hours}</span>
                        <span className="countdown-label">Hours</span>
                    </div>
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.minutes}</span>
                        <span className="countdown-label">Minutes</span>
                    </div>
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.seconds}</span>
                        <span className="countdown-label">Seconds</span>
                    </div>
                </div>

                <div className="newsletter-box animate-stagger-4">
                    <h4>Be the first to know when we launch</h4>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email address" required />
                        <button type="submit">
                            Notify Me <ArrowRight size={18} className="ms-2" />
                        </button>
                    </form>
                </div>

                <div className="social-links mt-5 animate-stagger-5 d-flex justify-content-center gap-4">
                    <a href="#" className="text-white opacity-50 hover-opacity-100"><Instagram size={24} /></a>
                    <a href="#" className="text-white opacity-50 hover-opacity-100"><Facebook size={24} /></a>
                    <a href="#" className="text-white opacity-50 hover-opacity-100"><Twitter size={24} /></a>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
