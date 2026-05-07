import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopData = async () => {
            setLoading(true);
            try {
                const apiURL = API_BASE_URL || '';
                const [catsRes, prodsRes] = await Promise.all([
                    axios.get(`${apiURL}/api/cms/categories`),
                    axios.get(`${apiURL}/api/products`)
                ]);
                setCategories(catsRes.data);
                setProducts(prodsRes.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch shop data:', err);
                setError('Failed to load shop data.');
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/reference/placeholder.png'; // Fallback
        if (imagePath.startsWith('http')) return imagePath;
        const apiURL = API_BASE_URL || '';
        return `${apiURL}${imagePath}`;
    };

    return (
        <ShopContext.Provider value={{ categories, products, loading, error, getImageUrl }}>
            {children}
        </ShopContext.Provider>
    );
};
