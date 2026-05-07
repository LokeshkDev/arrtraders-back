import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Footer.css';
import { API_BASE_URL } from '../config/api';

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, footerRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/cms/pages/contact`),
          axios.get(`${API_BASE_URL}/api/cms/pages/footer`)
        ]);
        
        if (contactRes.data?.content) setSocialLinks(contactRes.data.content);
        if (footerRes.data?.content) setFooterData(footerRes.data.content);
      } catch (e) {
        // Silently fail
      }
    };
    fetchData();
  }, []);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socials = [
    { key: 'facebook', url: socialLinks.facebook, label: 'Facebook', svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg> },
    { key: 'instagram', url: socialLinks.instagram, label: 'Instagram', svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
    { key: 'twitter', url: socialLinks.twitter, label: 'Twitter / X', svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { key: 'youtube', url: socialLinks.youtube, label: 'YouTube', svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg> },
    { key: 'whatsapp', url: socialLinks.whatsapp ? `https://wa.me/${socialLinks.whatsapp}` : '', label: 'WhatsApp', svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
  ].filter(s => s.url);

  return (
    <footer className="artisanal-footer">
      <div className="container-lg">
        <div className="row g-5">
          {/* Brand Column */}
          <div className="col-lg-3 col-md-6">
            <address className="footer-contact-info mb-4">
              <h1 className="footer-brand-title fs-3 mb-2">AR Rahman <span>Dates N' Nuts</span></h1>
              <p className="footer-brand-text mb-4">
                Providing the finest quality of premium dates, nuts and healthy snacks. Traditional quality, delivered for your health.
              </p>
            </address>
            <div className="d-flex gap-3 social-links" aria-label="Social Media Links">
              {socials.length > 0 ? (
                socials.map(s => (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${s.label}`} title={s.label}>
                    {s.svg}
                  </a>
                ))
              ) : (
                <>
                  <a href="#" aria-label="Follow us on Facebook" title="Facebook">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                  </a>
                  <a href="#" aria-label="Follow us on Instagram" title="Instagram">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                  <a href="#" aria-label="Follow us on Twitter" title="Twitter">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="#" aria-label="Follow us on YouTube" title="YouTube">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h4 className="footer-section-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/" className="footer-nav-link" onClick={handleLinkClick}>Home</Link></li>
              <li><Link to="/about" className="footer-nav-link" onClick={handleLinkClick}>About Us</Link></li>
              <li><Link to="/categories" className="footer-nav-link" onClick={handleLinkClick}>Shop</Link></li>
              <li><Link to="/contact" className="footer-nav-link" onClick={handleLinkClick}>Contact</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="col-lg-2 col-md-6">
            <h4 className="footer-section-heading">Customer Help</h4>
            <ul className="footer-links-list">
              <li><Link to="/shipping" className="footer-nav-link" onClick={handleLinkClick}>Shipping Policy</Link></li>
              <li><Link to="/returns" className="footer-nav-link" onClick={handleLinkClick}>Returns & Refunds</Link></li>
              <li><Link to="/privacy" className="footer-nav-link" onClick={handleLinkClick}>Privacy Policy</Link></li>
              <li><Link to="/faq" className="footer-nav-link" onClick={handleLinkClick}>FAQs</Link></li>
            </ul>
          </div>

          {/* SEO Categories */}
          <div className="col-lg-5 col-md-6">
            <h4 className="footer-section-heading">{footerData?.categoriesTitle || 'Shop Premium Categories'}</h4>
            <nav aria-label="Premium product categories">
              <ul className="footer-links-list footer-category-grid">
                {footerData?.categories && footerData.categories.length > 0 ? (
                  footerData.categories.map((cat, idx) => (
                    <li key={idx}><Link to={cat.link} className="footer-nav-link" onClick={handleLinkClick}>{cat.name}</Link></li>
                  ))
                ) : (
                  <>
                    <li><Link to="/categories?selected=Premium Dates" className="footer-nav-link" onClick={handleLinkClick}>Premium Dates Online</Link></li>
                    <li><Link to="/categories?selected=Medjool Dates" className="footer-nav-link" onClick={handleLinkClick}>Medjool Dates</Link></li>
                    <li><Link to="/categories?selected=Ajwa Dates" className="footer-nav-link" onClick={handleLinkClick}>Ajwa Dates</Link></li>
                    <li><Link to="/categories?selected=Dry Fruits" className="footer-nav-link" onClick={handleLinkClick}>Dry Fruits</Link></li>
                    <li><Link to="/categories?selected=Exotic Nuts" className="footer-nav-link" onClick={handleLinkClick}>Exotic Nuts</Link></li>
                    <li><Link to="/categories?selected=Gift Hampers" className="footer-nav-link" onClick={handleLinkClick}>Dates Gift Hampers</Link></li>
                    <li><Link to="/categories?selected=Wellness Mix" className="footer-nav-link" onClick={handleLinkClick}>Healthy Snack Mixes</Link></li>
                    <li><Link to="/categories?selected=Organic Honey" className="footer-nav-link" onClick={handleLinkClick}>Organic Honey</Link></li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <div className="footer-copy mb-0">
            © {new Date().getFullYear()} AR Rahman Traders. Delivering health and quality.
          </div>
          <div className="payment-icons-wrapper d-flex align-items-center gap-3">
            <span className="payment-label">Accepted Payments</span>
            <div className="payment-svg-list d-flex gap-2">
              {/* Visa SVG */}
              <svg width="34" height="22" viewBox="0 0 34 22" fill="none" className="payment-svg"><path d="M13.84 15.3l1.38-8.15h2.1l-1.38 8.15h-2.1zm7.06-7.98c-.5-.19-1.27-.39-2.22-.39-2.46 0-4.19 1.24-4.21 3.03-.02 1.32 1.24 2.05 2.18 2.49.97.45 1.3.74 1.29 1.14 0 .62-.77.9-1.48.9-.99 0-1.51-.15-2.31-.48l-.33-.15-.35 2.04c.58.25 1.64.47 2.74.48 2.62 0 4.32-1.23 4.35-3.14.02-1.05-.65-1.84-2.09-2.5-.46-.22-.74-.36-.74-.58 0-.21.24-.42.76-.42.58-.01 1.01.12 1.33.26l.16.07.5-.21-.01.01-.1-.38z" fill="currentColor" /></svg>
              {/* MasterCard */}
              <svg width="34" height="22" viewBox="0 0 34 22" fill="none" className="payment-svg"><circle cx="12" cy="11" r="7" fill="currentColor" fillOpacity="0.8" /><circle cx="20" cy="11" r="7" fill="currentColor" fillOpacity="0.5" /></svg>
              {/* AMEX */}
              <svg width="34" height="22" viewBox="0 0 40 25" fill="none" className="payment-svg"><rect width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.1" /><path d="M10 8h2l1 4 1-4h2v9h-2v-5l-1 4h-1l-1-4v5h-2V8z" fill="currentColor" /></svg>
              {/* PayPal */}
              <svg width="34" height="22" viewBox="0 0 24 24" fill="none" className="payment-svg"><path d="M7 2h7c3.5 0 6 2 6 5s-2.5 5-6 5h-4l-1 5H4l3-15z" fill="currentColor" /></svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
