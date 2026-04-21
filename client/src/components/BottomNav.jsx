import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './BottomNav.css';

const BottomNav = () => {
  const { getCartCount } = useContext(CartContext);
  const cartCount = getCartCount();

  return (
    <nav className="bottom-nav d-md-none">
      <div className="bottom-nav-container">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} className="nav-icon" />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/categories" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutGrid size={24} className="nav-icon" />
          <span>Categories</span>
        </NavLink>
        
        {/* Center Floating Cart Button */}
        <div className="bottom-nav-cart-wrapper">
          <NavLink to="/cart" className="bottom-nav-cart-btn">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
               <span className="bottom-cart-badge">{cartCount}</span>
            )}
          </NavLink>
        </div>
        
        <NavLink to="/wishlist" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Heart size={24} className="nav-icon" />
          <span>Wishlist</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} className="nav-icon" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
