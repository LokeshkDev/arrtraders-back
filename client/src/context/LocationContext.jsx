import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        const saved = localStorage.getItem('user_location');
        return saved ? JSON.parse(saved) : null;
    });
    const [serviceable, setServiceable] = useState(false);
    const [deliveryDetails, setDeliveryDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateLocation = async (loc) => {
        if (!loc || !loc.pincode) return null;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/delivery/validate`, {
                pincode: loc.pincode,
                city: loc.city,
                state: loc.state
            });
            setServiceable(data.serviceable);
            setDeliveryDetails(data);
            setLocation(prev => ({ ...prev, ...loc, ...data }));
            localStorage.setItem('user_location', JSON.stringify({ ...loc, ...data }));
            return data;
        } catch (error) {
            setServiceable(false);
            setDeliveryDetails(null);
            console.error('Location validation failed:', error);
            return { serviceable: false, message: 'Service is not available at this time. Please try another pincode.' };
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            return Promise.resolve({ serviceable: false, message: 'Location detection is not supported by this browser.' });
        }

        setLoading(true);

        const getPosition = (options) => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
        };

        const performReverseGeocoding = async (latitude, longitude) => {
            try {
                // Nominatim requires a User-Agent and a valid contact email/app name
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
                    headers: { 
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'ARRahman-Ecommerce-App'
                    }
                });
                const data = await response.json();
                
                if (data && data.address) {
                    const pincode = data.address.postcode;
                    if (!pincode) {
                        return { serviceable: false, message: 'We detected your area, but could not find the exact pincode. Please enter it manually.' };
                    }
                    const newLoc = {
                        pincode: pincode,
                        city: data.address.city || data.address.town || data.address.village || data.address.county || '',
                        state: data.address.state || '',
                        address: data.display_name
                    };
                    const validationResult = await validateLocation(newLoc);
                    return validationResult || { serviceable: false, message: 'Could not validate the detected pincode. Please enter it manually.' };
                }
                return { serviceable: false, message: 'Unable to detect your pincode from your location. Please enter it manually.' };
            } catch (error) {
                console.error('Reverse geocoding failed:', error);
                return { serviceable: false, message: 'Network error while detecting location. Please enter it manually.' };
            }
        };

        return new Promise(async (resolve) => {
            try {
                // Try with high accuracy first, but with a shorter timeout
                try {
                    const position = await getPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
                    const result = await performReverseGeocoding(position.coords.latitude, position.coords.longitude);
                    resolve(result);
                } catch (err) {
                    // Fallback to low accuracy if high accuracy fails or times out
                    console.warn('High accuracy geolocation failed, trying low accuracy...', err);
                    const position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
                    const result = await performReverseGeocoding(position.coords.latitude, position.coords.longitude);
                    resolve(result);
                }
            } catch (error) {
                console.warn('Geolocation failed or unavailable:', error.message || error);
                let message = 'Location detection failed. Please enter your pincode manually.';
                
                if (error.code === 1) { // PERMISSION_DENIED
                    message = 'Location permission denied. Please enable location services in your browser settings.';
                } else if (error.code === 3) { // TIMEOUT
                    message = 'Location detection timed out. Please try again or enter your pincode manually.';
                } else if (error.code === 2) { // POSITION_UNAVAILABLE
                    message = 'Location information is unavailable on this device. Please enter manually.';
                }
                
                resolve({ serviceable: false, message });
            } finally {
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        if (location && location.pincode) {
            validateLocation(location);
        } else {
            // Auto-detect on first load if no location saved
            detectLocation();
        }
    }, []);

    return (
        <LocationContext.Provider value={{ 
            location, 
            setLocation: validateLocation, 
            serviceable, 
            deliveryDetails, 
            loading,
            detectLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
};
