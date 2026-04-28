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
                    // Using a reverse geocoding API (could be Google Maps or a free one like Nominatim)
                    // For now, we'll simulate or use a public one
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
                    const data = await response.json();
                    if (data.address) {
                        const newLoc = {
                            pincode: data.address.postcode,
                            city: data.address.city || data.address.town || data.address.village,
                            state: data.address.state,
                            address: data.display_name
                        };
                        const validationResult = await validateLocation(newLoc);
                        resolve(validationResult);
                    } else {
                        resolve({ serviceable: false, message: 'Unable to detect your pincode. Please enter it manually.' });
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    resolve({ serviceable: false, message: 'Unable to detect your pincode. Please enter it manually.' });
                } finally {
                    setLoading(false);
                }
            }, (error) => {
                console.error('Geolocation failed:', error);
                setLoading(false);
                resolve({ serviceable: false, message: 'Location permission failed. Please enter your pincode manually.' });
            });
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
