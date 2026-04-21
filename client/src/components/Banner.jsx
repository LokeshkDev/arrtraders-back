import React from 'react';
import { Leaf } from 'lucide-react';
import './Banner.css';

const Banner = () => {
  return (
    <section className="promo-banner-section section-padding">
      <div className="container-custom">
        <div className="banner-content-box animated fadeInUp">
          <div className="banner-icon">
            <Leaf size={40} />
          </div>
          <span className="banner-subtitle">Get up to 50% Off</span>
          <h2 className="banner-title">Premium Organic <br/>Collection For Your Health</h2>
          <p className="banner-text">We source only the purest and finest artisan essentials directly from nature's fields to your doorstep.</p>
          <div className="banner-btn">
            <a href="/categories" className="btn-organio">
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
