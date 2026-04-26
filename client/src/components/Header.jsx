import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Menu, X, Heart, ShoppingBag, User, LayoutGrid, ChevronDown } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import SideCategoryMenu from './SideCategoryMenu';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileHelpMenuOpen, setMobileHelpMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [shippingThreshold, setShippingThreshold] = useState(1999);
  const [promos, setPromos] = useState([]);
  const [currentPromoIdx, setCurrentPromoIdx] = useState(0);

  const location = useLocation();
  const cartContext = useContext(CartContext);
  const getCartCount = cartContext?.getCartCount || (() => 0);

  useEffect(() => {
    const fetchUserInfo = () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) setUserInfo(JSON.parse(storedUser));
      else setUserInfo(null);
    };

    const fetchShippingSettings = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
        if (data.freeShippingThreshold) setShippingThreshold(data.freeShippingThreshold);
        if (data.promos) setPromos(data.promos);
      } catch (e) { console.error('Failed to fetch shipping settings'); }
    };

    fetchUserInfo();
    fetchShippingSettings();
    window.addEventListener('storage', fetchUserInfo);
    return () => window.removeEventListener('storage', fetchUserInfo);
  }, []);

  useEffect(() => {
    if (promos.length > 1) {
      const timer = setInterval(() => {
        setCurrentPromoIdx((prev) => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [promos]);

  const activePromo = promos.length > 0 ? promos[currentPromoIdx] : null;

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    window.dispatchEvent(new Event('storage'));
    setUserDropdownOpen(false);
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileHelpMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const UserMenu = ({ isScrolled = false }) => (
    <div className="position-relative user-dropdown-container">
      <button
        className={`action-icon border-0 bg-transparent ${isScrolled ? 'text-secondary' : ''}`}
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
      >
        <User size={isScrolled ? 22 : 24} />
      </button>

      {userDropdownOpen && (
        <div className="user-dropdown-menu shadow-premium">
          {!userInfo ? (
            <Link to="/login" className="dropdown-item-premium">
              <span>Sign In</span>
            </Link>
          ) : (
            <>
              <div className="dropdown-header-premium">
                <p className="user-name">{userInfo.name}</p>
                <p className="user-email">{userInfo.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              {userInfo.isAdmin && (
                <Link to="/admin" className="dropdown-item-premium">
                  <span>Admin Console</span>
                </Link>
              )}
              <Link to="/profile" className="dropdown-item-premium">
                <span>My Profile</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item-premium logout text-danger">
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`header-wrapper ${scrolled ? 'header-sticky' : ''}`}>
      {/* Layer 1: Top Utility Bar */}
      <div className="top-utility-bar d-none d-lg-block">
        <div className="container-lg d-flex justify-content-between align-items-center py-2">
          <div className="utility-promo">
            {/* <span className="promo-badge">PROMO</span> */}
            <span className="promo-text transition-all">
              {activePromo ? (
                <>
                  {activePromo.title}
                  {activePromo.code && <strong className="ms-2 promo-badge" style={{ color: 'var(--primary)', borderLeft: '1px solid rgba(212,175,55,0.3)', paddingLeft: '10px' }}>CODE: {activePromo.code}</strong>}
                </>
              ) : (
                `Free shipping on all orders over ₹${shippingThreshold.toLocaleString()}`
              )}
            </span>
          </div>
          <div className="utility-links d-flex gap-4">
            <Link to="/about" className="utility-link">Our Story</Link>
            <Link to="/faq" className="utility-link">Help Center</Link>
            <Link to="/contact" className="utility-link">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Layer 2: Main Header Bar */}
      <div className="main-header-bar py-3">
        <div className="container-lg">
          <div className="row align-items-center">
            {/* Logo Section */}
            <div className="col-lg-3 col-9 d-flex align-items-center gap-3">
              <button
                className="category-sidebar-trigger border-0 bg-transparent p-0 d-flex align-items-center justify-content-center"
                onClick={() => setCategoryMenuOpen(true)}
                title="Browse Categories"
              >
                <LayoutGrid size={24} className="text-secondary hover-primary transition" />
              </button>
              <Link to="/" className="main-logo-brand text-decoration-none">
                <h1 className="logo-text mb-0">AR Rahman <span>Dates</span></h1>
              </Link>
            </div>

            {/* Centered Search Bar (Desktop) */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="trendy-search-container">
                <div className="search-bar-inner">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search for pure organic products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="search-submit-btn">Search</button>
                </div>
              </div>
            </div>

            {/* Action Icons Section */}
            <div className="col-lg-4 col-3">
              <div className="d-flex justify-content-end align-items-center gap-4">
                <div className="d-none d-lg-flex align-items-center gap-4 me-2">
                  <Link to="/" className="nav-link-trendy">Home</Link>
                  <Link to="/categories" className="nav-link-trendy">Shop</Link>
                </div>

                {/* Desktop Icons */}
                <div className="header-actions-group d-none d-lg-flex align-items-center gap-2">
                  <UserMenu isScrolled={scrolled} />
                  <Link to="/wishlist" className="action-icon-trendy d-none d-md-flex">
                    <Heart size={22} />
                  </Link>
                  <Link to="/cart" className="action-icon-trendy position-relative cart-icon-special">
                    <ShoppingBag size={22} />
                    {getCartCount() > 0 && <span className="cart-badge-trendy">{getCartCount()}</span>}
                  </Link>
                </div>

                {/* Mobile: Search Icon + Hamburger */}
                <div className="d-lg-none d-flex align-items-center gap-3">
                  <button
                    className="mobile-search-toggle border-0 bg-transparent p-0"
                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    aria-label="Toggle search"
                  >
                    <Search size={22} className="text-secondary" />
                  </button>
                  <button
                    className="mobile-hamburger-btn border-0 bg-transparent"
                    onClick={() => setMobileHelpMenuOpen(true)}
                  >
                    <Menu size={28} className="text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search - Expandable overlay */}
          {mobileSearchOpen && (
            <div className="mobile-search-expanded d-lg-none">
              <div className="mobile-search-bar">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  className="mobile-search-close border-0 bg-transparent p-0"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <X size={18} className="text-muted" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Category Menu */}
      <SideCategoryMenu
        isOpen={categoryMenuOpen}
        onClose={() => setCategoryMenuOpen(false)}
      />

      {/* Mobile Help Menu Overlay */}
      <div className={`mobile-help-drawer ${mobileHelpMenuOpen ? 'open' : ''}`}>
        <div className="drawer-overlay" onClick={() => setMobileHelpMenuOpen(false)}></div>
        <div className="drawer-content shadow-premium">
          <div className="drawer-header d-flex justify-content-between align-items-center p-4 border-bottom">
            <h5 className="font-headline text-primary m-0">Menú</h5>
            <button className="close-drawer-btn border-0 bg-transparent" onClick={() => setMobileHelpMenuOpen(false)}>
              <X size={24} className="text-secondary" />
            </button>
          </div>
          <div className="drawer-links d-flex flex-column p-4 gap-4">
            <Link to="/about" className="drawer-link-item">
              <span className="link-text">Our Story</span>
              <ChevronDown size={16} className="rotate-270" />
            </Link>
            <Link to="/faq" className="drawer-link-item">
              <span className="link-text">Help Center</span>
              <ChevronDown size={16} className="rotate-270" />
            </Link>
            <Link to="/contact" className="drawer-link-item">
              <span className="link-text">Contact Us</span>
              <ChevronDown size={16} className="rotate-270" />
            </Link>
          </div>
          <div className="drawer-footer mt-auto p-4 border-top">
            <div className="d-flex justify-content-center gap-4">
              <Link to="/wishlist" className="drawer-footer-icon"><Heart size={24} /></Link>
              <Link to="/cart" className="drawer-footer-icon position-relative">
                <ShoppingBag size={24} />
                {getCartCount() > 0 && <span className="cart-badge-mini">{getCartCount()}</span>}
              </Link>
              <Link to="/profile" className="drawer-footer-icon"><User size={24} /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
