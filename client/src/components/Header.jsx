import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Menu, X, Heart, ShoppingBag, User, LayoutGrid, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { ShopContext } from '../context/ShopContext';
import SideCategoryMenu from './SideCategoryMenu';
import LocationPicker from './LocationPicker';
import './Header.css';
import './LocationPicker.css';

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

  const location = useLocation();
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const getCartCount = cartContext?.getCartCount || (() => 0);
  const { products } = useContext(ShopContext) || { products: [] };

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = (products || []).filter(p =>
        p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))
      ).slice(0, 5);
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setMobileSearchOpen(false);
    }
  };

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

  const SearchSuggestionsDropdown = () => {
    if (!showSuggestions || searchSuggestions.length === 0) return null;
    return (
      <div className="search-suggestions-dropdown shadow-lg rounded-4 border bg-white position-absolute w-100 overflow-hidden" style={{ top: '100%', left: 0, zIndex: 1050, marginTop: '10px' }}>
        <ul className="list-unstyled mb-0">
          {searchSuggestions.map((product) => (
            <li key={product._id || product.id} className="border-bottom">
              <Link
                to={`/${(product.category ? product.category.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') : 'all')}/${product.slug || product.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')}`}
                className="d-flex align-items-center gap-3 p-3 text-decoration-none text-dark hover-bg-light transition-all"
                onClick={() => { setShowSuggestions(false); setMobileSearchOpen(false); }}
              >
                <img src={product.img || product.image || '/images/reference/product-thumb-1.png'} alt={product.name} className="rounded-3 object-fit-cover shadow-sm" style={{ width: '40px', height: '40px' }} />
                <div className="flex-grow-1">
                  <h6 className="mb-0 font-headline fw-bold text-truncate" style={{ fontSize: '14px' }}>{product.name}</h6>
                  <p className="mb-0 text-muted small font-label uppercase" style={{ letterSpacing: '1px', fontSize: '10px' }}>{product.category}</p>
                </div>
                <div className="text-primary fw-bold font-headline" style={{ fontSize: '14px' }}>₹{parseFloat(String(product.price).replace(/[^0-9.]/g, '')).toFixed(2)}</div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="bg-light p-2 text-center border-top">
          <button
            className="btn btn-link text-primary fw-bold font-label uppercase extra-small text-decoration-none"
            onClick={handleSearchSubmit}
          >
            View all results for "{searchQuery}"
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="header-placeholder"></div>
      <div className={`header-wrapper ${scrolled ? 'header-sticky' : ''}`}>
        {/* Layer 1: Top Utility Bar */}
        <div className="top-utility-bar">
          <div className="container-lg d-flex justify-content-between align-items-center py-0" style={{ minHeight: '40px' }}>
            <div className="promo-marquee-container flex-grow-1 overflow-hidden">
              <div className="promo-marquee-content">
                {(promos.length > 0 ? [...promos, ...promos, ...promos] : [{ title: `Free shipping on all orders over ₹${shippingThreshold.toLocaleString()}` }]).map((promo, idx) => (
                  <div className="promo-item" key={idx}>
                    <span className="me-2">{promo.title}</span>
                    {promo.code && (
                      <strong className="promo-badge">
                        CODE: {promo.code}
                      </strong>
                    )}
                    <span className="promo-separator">|</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="utility-links d-none d-lg-flex gap-4 ms-4" style={{ whiteSpace: 'nowrap' }}>
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
              <div className="col-lg-2 col-9 d-flex align-items-center gap-3">
                <button
                  className="category-sidebar-trigger border-0 bg-transparent p-0 d-flex align-items-center justify-content-center"
                  onClick={() => setCategoryMenuOpen(true)}
                  title="Browse Categories"
                >
                  <LayoutGrid size={24} className="text-secondary hover-primary transition" />
                </button>
                <Link to="/" className="main-logo-brand text-decoration-none">
                  <h1 className="logo-text mb-0">AR Rahman <span>Dates N' Nuts</span></h1>
                </Link>
              </div>

              {/* Location Picker (Desktop) */}
              <div className="col-lg-2 d-none d-lg-block">
                <LocationPicker />
              </div>

              {/* Centered Search Bar (Desktop) */}
              <div className="col-lg-4 d-none d-lg-block">
                <div className="trendy-search-container position-relative" ref={searchWrapperRef}>
                  <form className="search-bar-inner" onSubmit={handleSearchSubmit}>
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => { if (searchQuery.length > 1) setShowSuggestions(true); }}
                    />
                    <button type="submit" className="search-submit-btn">Search</button>
                  </form>
                  <SearchSuggestionsDropdown />
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
                  <div className="d-lg-none d-flex align-items-center gap-2">
                    <LocationPicker />
                    <button
                      className="mobile-search-toggle border-0 bg-transparent p-0"
                      onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                      aria-label="Toggle search"
                    >
                      <Search size={20} className="text-secondary" />
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
              <div className="mobile-search-expanded d-lg-none" ref={searchWrapperRef}>
                <form className="mobile-search-bar position-relative" onSubmit={handleSearchSubmit}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.length > 1) setShowSuggestions(true); }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="mobile-search-close border-0 bg-transparent p-0"
                    onClick={() => setMobileSearchOpen(false)}
                  >
                    <X size={18} className="text-muted" />
                  </button>
                  <SearchSuggestionsDropdown />
                </form>
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
    </>
  );
};

export default Header;
