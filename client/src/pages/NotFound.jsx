import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-surface px-4">
      <div className="text-center animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="mb-4 d-inline-block p-4 rounded-circle bg-white shadow-sm border border-light">
          <Search size={64} className="text-primary opacity-25" />
        </div>
        
        <h1 className="display-1 font-headline fw-bold text-primary mb-3" style={{ fontSize: '120px', letterSpacing: '-0.05em' }}>404</h1>
        <h2 className="font-headline h3 text-secondary mb-4 fw-bold">Page Not Found</h2>
        
        <p className="text-muted font-body mb-5 fs-5">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <Link to="/" className="btn btn-primary rounded-pill px-5 py-3 fw-bold font-label d-flex align-items-center justify-content-center gap-2 shadow-sm">
            <Home size={18} /> BACK TO HOME
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-outline-primary rounded-pill px-5 py-3 fw-bold font-label d-flex align-items-center justify-content-center gap-2">
            <ArrowLeft size={18} /> GO BACK
          </button>
        </div>

        <div className="mt-5 pt-5 opacity-50">
          <p className="small text-muted mb-0">AR Rahman Dates N' Nuts</p>
          <div className="d-flex gap-3 justify-content-center mt-2">
            <Link to="/categories" className="text-decoration-none small text-primary hover-underline">Shop</Link>
            <Link to="/contact" className="text-decoration-none small text-primary hover-underline">Contact</Link>
            <Link to="/faq" className="text-decoration-none small text-primary hover-underline">Help</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
