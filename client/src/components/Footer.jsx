import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="artisanal-footer">
      <div className="container-lg">
        <div className="row g-5">
          {/* Brand Column */}
          <div className="col-lg-4 col-md-6">
            <address className="footer-contact-info mb-4">
              <h1 className="footer-brand-title fs-3 mb-2">AR Rahman <span>Dates</span></h1>
              <p className="footer-brand-text mb-4">
                Providing the finest quality of premium dates, nuts and healthy snacks. Traditional quality, delivered for your health.
              </p>
            </address>
            <div className="d-flex gap-3 social-links" aria-label="Social Media Links">
              <a href="#" aria-label="Follow us on Facebook" title="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" aria-label="Follow us on Instagram" title="Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="Follow us on Twitter" title="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" aria-label="Follow us on YouTube" title="YouTube">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h4 className="footer-section-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/" className="footer-nav-link">Home</Link></li>
              <li><Link to="/about" className="footer-nav-link">About Us</Link></li>
              <li><Link to="/categories" className="footer-nav-link">Shop</Link></li>
              <li><Link to="/contact" className="footer-nav-link">Contact</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="col-lg-2 col-md-6">
            <h4 className="footer-section-heading">Customer Help</h4>
            <ul className="footer-links-list">
              <li><Link to="/shipping" className="footer-nav-link">Shipping Policy</Link></li>
              <li><Link to="/returns" className="footer-nav-link">Returns & Refunds</Link></li>
              <li><Link to="/privacy" className="footer-nav-link">Privacy Policy</Link></li>
              <li><Link to="/faq" className="footer-nav-link">FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="col-lg-4 col-md-6">
            <h4 className="footer-section-heading">Join Our Newsletter</h4>
            <p className="footer-brand-text mb-3">Subscribe to get updates on new arrivals and special offers.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" className="footer-email-input" placeholder="Your Email Address" required />
              <button type="submit" className="footer-subscribe-btn">Subscribe Now</button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <div className="footer-copy mb-0">
            © {new Date().getFullYear()} AR Rahman Dates and Nuts. Crafted for health and quality.
          </div>
          <div className="payment-icons-wrapper d-flex align-items-center gap-3">
             <span className="payment-label">Accepted Payments</span>
             <div className="payment-svg-list d-flex gap-2">
                {/* Visa SVG */}
                <svg width="34" height="22" viewBox="0 0 34 22" fill="none" className="payment-svg"><path d="M13.84 15.3l1.38-8.15h2.1l-1.38 8.15h-2.1zm7.06-7.98c-.5-.19-1.27-.39-2.22-.39-2.46 0-4.19 1.24-4.21 3.03-.02 1.32 1.24 2.05 2.18 2.49.97.45 1.3.74 1.29 1.14 0 .62-.77.9-1.48.9-.99 0-1.51-.15-2.31-.48l-.33-.15-.35 2.04c.58.25 1.64.47 2.74.48 2.62 0 4.32-1.23 4.35-3.14.02-1.05-.65-1.84-2.09-2.5-.46-.22-.74-.36-.74-.58 0-.21.24-.42.76-.42.58-.01 1.01.12 1.33.26l.16.07.5-.21-.01.01-.1-.38z" fill="currentColor"/></svg>
                {/* MasterCard */}
                <svg width="34" height="22" viewBox="0 0 34 22" fill="none" className="payment-svg"><circle cx="12" cy="11" r="7" fill="currentColor" fillOpacity="0.8"/><circle cx="20" cy="11" r="7" fill="currentColor" fillOpacity="0.5"/></svg>
                {/* AMEX */}
                <svg width="34" height="22" viewBox="0 0 40 25" fill="none" className="payment-svg"><rect width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.1"/><path d="M10 8h2l1 4 1-4h2v9h-2v-5l-1 4h-1l-1-4v5h-2V8z" fill="currentColor"/></svg>
                {/* PayPal */}
                <svg width="34" height="22" viewBox="0 0 24 24" fill="none" className="payment-svg"><path d="M7 2h7c3.5 0 6 2 6 5s-2.5 5-6 5h-4l-1 5H4l3-15z" fill="currentColor"/></svg>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
