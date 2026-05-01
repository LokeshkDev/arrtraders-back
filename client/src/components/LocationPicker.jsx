import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, X, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import './LocationPicker.css';

const LocationPicker = () => {
    const { location, setLocation, serviceable, loading, detectLocation } = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(false);
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');
    const [servicePopup, setServicePopup] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        if (showModal || servicePopup) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = prevBody || '';
            document.documentElement.style.overflow = prevHtml || '';
        }
        return () => {
            document.body.style.overflow = prevBody || '';
            document.documentElement.style.overflow = prevHtml || '';
        };
    }, [showModal, servicePopup]);

    const showServiceUnavailablePopup = (message) => {
        setServicePopup(message || 'Service is not available at this time. Please try another pincode.');
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (pincode.length !== 6) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }
        setError('');
        const result = await setLocation({ pincode });
        if (result && !result.serviceable) {
            showServiceUnavailablePopup('Service is not available at this time. Please try another pincode.');
            return;
        }
        setShowModal(false);
        setMobileExpanded(false);
    };

    const handleAutoDetect = async () => {
        const result = await detectLocation();
        if (result && !result.serviceable) {
            showServiceUnavailablePopup('Service is not available at this time. Please try another pincode.');
            return;
        }
        setShowModal(false);
        setMobileExpanded(false);
    };

    const handleTriggerClick = () => {
        if (isMobile) {
            setMobileExpanded(!mobileExpanded);
        } else {
            setShowModal(true);
        }
    };

    /* Shared inline location content for mobile panel + desktop modal body */
    const locationContentJSX = (
        <>
            <button className="detect-location-btn" onClick={handleAutoDetect} disabled={loading}>
                <Navigation size={16} />
                <span>{loading ? 'Detecting...' : 'Use current location'}</span>
            </button>

            <div className="modal-divider">
                <span>or enter pincode</span>
            </div>

            <form onSubmit={handleManualSubmit} className="pincode-form">
                <div className="pincode-input-wrapper">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter 6-digit pincode"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    />
                    <button type="submit" className="pincode-submit">Apply</button>
                </div>
                {error && <p className="error-text"><AlertCircle size={14} /> {error}</p>}
            </form>

            {location && (
                <div className={`current-status-card ${serviceable ? 'serviceable' : 'not-serviceable'}`}>
                    {serviceable ? (
                        <>
                            <CheckCircle size={18} className="status-icon" />
                            <div>
                                <p className="status-title">Serviceable at {location.pincode}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={18} className="status-icon" />
                            <div>
                                <p className="status-title">Not Serviceable</p>
                                <p className="status-details">Sorry, we don't deliver to {location.pincode} yet.</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="location-picker-container">
            {/* Desktop: full trigger button / Mobile: icon only */}
            <button
                className={`location-trigger-btn ${!serviceable && location ? 'not-serviceable' : ''} ${mobileExpanded ? 'mobile-active' : ''}`}
                onClick={handleTriggerClick}
            >
                <MapPin size={18} className="pin-icon" />
                <div className="location-info location-info-desktop">
                    <span className="location-label">Deliver to</span>
                    <span className="location-value">
                        {location ? (location.pincode || location.city || 'Select Location') : 'Select Location'}
                    </span>
                </div>
                <ChevronDown size={14} className="arrow-icon location-info-desktop" />
            </button>

            {/* Mobile: Inline expandable panel (show/hide like search) */}
            {mobileExpanded && isMobile && (
                <div className="mobile-location-panel d-lg-none">
                    <div className="mobile-location-panel-inner">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="mobile-loc-title">Delivery Location</span>
                            <button className="mobile-loc-close" onClick={() => setMobileExpanded(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        {locationContentJSX}
                    </div>
                </div>
            )}

            {/* Desktop: Modal popup (unchanged) */}
            {showModal && !isMobile && (
                <div className="location-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="location-modal-content shadow-premium" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-premium">
                            <h5 className="modal-title-premium">Choose delivery location</h5>
                            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body-premium">
                            <p className="modal-description">
                                Select a delivery location to see product availability.
                            </p>
                            {locationContentJSX}
                        </div>
                    </div>
                </div>
            )}

            {servicePopup && (
                <div className="service-popup-overlay" onClick={() => setServicePopup(null)}>
                    <div className="service-popup-card" onClick={e => e.stopPropagation()}>
                        <button className="service-popup-close" onClick={() => setServicePopup(null)}>
                            <X size={18} />
                        </button>
                        <AlertCircle size={34} className="service-popup-icon" />
                        <h5>Service Not Available</h5>
                        <p>{servicePopup}</p>
                        <button className="service-popup-action" onClick={() => setServicePopup(null)}>
                            Try another pincode
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
