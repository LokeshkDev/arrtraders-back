import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        let initialCart = saved ? JSON.parse(saved) : [];
        
        // Automatic Migration: Convert legacy name-based IDs to valid ObjectIds
        const legacyMap = {
            'Royal Medjool': '6617a23c4f5a34e8d89a0001',
            'Ajwa Al-Madinah': '6617a23c4f5a34e8d89a0002',
            'Sukkari Soft': '6617a23c4f5a34e8d89a0003',
            'Roasted Cashews': '6617a23c4f5a34e8d89a0004',
            'California Almonds': '6617a23c4f5a34e8d89a0005',
            'Golden Apricots': '6617a23c4f5a34e8d89a0006',
            'Turkish Figs': '6617a23c4f5a34e8d89a0007',
            'Wild Forest Honey': '6617a23c4f5a34e8d89a0008',
            'Sidr Premium Honey': '6617a23c4f5a34e8d89a0009'
        };

        let migrated = false;
        initialCart = initialCart.map(item => {
            if (legacyMap[item._id]) {
                migrated = true;
                return { ...item, _id: legacyMap[item._id], image: item.image || item.img || 'https://via.placeholder.com/150' };
            }
            // Ensure all items have an image field if it's missing (legacy items might only have img)
            if (!item.image && item.img) {
                migrated = true;
                return { ...item, image: item.img };
            }
            return item;
        });

        if (migrated && typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(initialCart));
        }

        return initialCart;
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, qty = 1) => {
        setCart(prev => {
            const prodId = product._id || product.id;
            const itemWeight = product.weight || 'Default';
            
            // Check for existing item with same ID AND same Weight
            const existing = prev.find(item => 
                (item._id === prodId || item.id === prodId) && 
                (item.weight === itemWeight)
            );
            
            if (existing) {
                return prev.map(item => 
                    ((item._id === prodId || item.id === prodId) && item.weight === itemWeight) 
                    ? { ...item, qty: item.qty + qty } 
                    : item
                );
            }
            
            // Ensure product has a standard numeric price for calculations
            const numericPrice = typeof product.price === 'string' 
                ? parseFloat(product.price.replace(/[^0-9.]/g, '')) 
                : product.price;

            return [...prev, { ...product, _id: prodId, price: numericPrice, qty, weight: itemWeight }];
        });
    };

    const removeFromCart = (id, weight) => {
        setCart(prev => prev.filter(item => 
            !((item._id === id || item.id === id) && item.weight === weight)
        ));
    };

    const updateQty = (id, weight, change) => {
        setCart(prev => prev.map(item => {
            if ((item._id === id || item.id === id) && item.weight === weight) {
                const newQty = Math.max(1, item.qty + change);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.qty), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.qty, 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, getCartTotal, getCartCount }}>
            {children}
        </CartContext.Provider>
    );
};
