import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, User, ShoppingBag, Headset, MessageCircle, Phone, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './BottomNav.css';

const BottomNav = () => {
  const { getCartCount } = useContext(CartContext);
  const cartCount = getCartCount();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <nav className="bottom-nav d-md-none">
      <div className={`bottom-nav-support-sheet ${supportOpen ? 'open' : ''}`}>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="bottom-support-action whatsapp"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={18} />
          <span>WhatsApp</span>
        </a>
        <a href="tel:+919876543210" className="bottom-support-action call" aria-label="Call support">
          <Phone size={18} />
          <span>Call</span>
        </a>
      </div>

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
        
        <button
          type="button"
          className={`bottom-nav-item bottom-nav-support-btn ${supportOpen ? 'active' : ''}`}
          onClick={() => setSupportOpen((prev) => !prev)}
          aria-label="Toggle support options"
        >
          {supportOpen ? <X size={24} className="nav-icon" /> : <Headset size={24} className="nav-icon" />}
          <span>Support</span>
        </button>
        
        <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} className="nav-icon" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
