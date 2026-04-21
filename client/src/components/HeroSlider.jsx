import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import './HeroSlider.css';

const slides = [
  {
    tag: '100% ORGANIC FOOD',
    title: 'Choose the best healthier way of life',
    subtitle: 'Browse an incredible range of high quality organic food and drink, delivered direct to your door.',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
    bgColor: '#FCFAF8',
    discount: 'UP TO 50% OFF'
  },
  {
    tag: 'FRESH FROM FARM',
    title: 'Pure organic grocery shop for your family',
    subtitle: 'From sun-drenched fields to your doorstep—experience nature’s finest artisan treasures.',
    img: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1000',
    bgColor: '#FDFCF6',
    discount: 'FRESH ARRIVALS'
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="side-hero-container">
      {slides.map((slide, idx) => (
        <div 
          key={idx} 
          className={`hero-slide-split ${idx === current ? 'active' : ''}`}
          style={{ backgroundColor: slide.bgColor }}
        >
          <div className="hero-split-content">
            <span className="hero-tag animated fadeInUp">{slide.tag}</span>
            <h1 className="hero-main-title animated fadeInUp delay-1">
              {slide.title}
            </h1>
            <p className="hero-subtext animated fadeInUp delay-2">
              {slide.subtitle}
            </p>
            <div className="hero-price-badge animated zoomIn delay-3">
              <span className="badge-text">{slide.discount}</span>
            </div>
            <div className="hero-btn-wrap animated fadeInUp delay-4">
              <button className="btn-organio d-flex align-items-center gap-2">
                Shop now <ArrowRight size={18} />
              </button>
            </div>
          </div>
          
          <div className="hero-split-image animated fadeIn">
             <div className="image-circle-bg"></div>
             <img src={slide.img} alt="Fresh organic food" className="hero-img" />
             <div className="floating-badge d-none d-xl-block">
                <div className="inner">
                  <strong>100%</strong>
                  <span>Organic</span>
                </div>
             </div>
          </div>
        </div>
      ))}

      <div className="hero-dots-indicator">
        {slides.map((_, i) => (
          <span 
            key={i} 
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;

