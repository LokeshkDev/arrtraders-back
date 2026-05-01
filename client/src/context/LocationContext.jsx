import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/delivery/validate`, {
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
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
                        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
                    });
                    const data = await response.json();
                    if (data && data.address) {
                        const pincode = data.address.postcode;
                        if (!pincode) {
                            resolve({ serviceable: false, message: 'We detected your area, but could not find the exact pincode. Please enter it manually.' });
                            return;
                        }
                        const newLoc = {
                            pincode: pincode,
                            city: data.address.city || data.address.town || data.address.village || data.address.county || '',
                            state: data.address.state || '',
                            address: data.display_name
                        };
                        const validationResult = await validateLocation(newLoc);
                        // validateLocation might return null if something went wrong, so ensure we resolve an object
                        resolve(validationResult || { serviceable: false, message: 'Could not validate the detected pincode. Please enter it manually.' });
                    } else {
                        resolve({ serviceable: false, message: 'Unable to detect your pincode from your location. Please enter it manually.' });
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    resolve({ serviceable: false, message: 'Network error while detecting location. Please enter it manually.' });
                } finally {
                    setLoading(false);
                }
            }, (error) => {
                console.error('Geolocation failed:', error);
                setLoading(false);
                resolve({ serviceable: false, message: 'Location permission failed or timed out. Please enter your pincode manually.' });
            }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
        });
    };

    useEffect(() => {
        if (location && location.pincode) {
            validateLocation(location);
        } else {
            // Optional: Auto-detect on first load if no location saved
            // detectLocation();
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
