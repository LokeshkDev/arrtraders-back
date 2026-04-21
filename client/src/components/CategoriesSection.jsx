import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './CategoriesSection.css';

const CategoriesSection = ({ categories }) => {
  return (
    <section className="categories-section section-padding">
      <div className="container-custom">
        <div className="section-title">
          <span>Our Collections</span>
          <h2>Shop By Categories</h2>
        </div>
        
        <div className="grid-4">
          {categories.map((cat, idx) => (
            <div key={cat._id || idx} className="category-card-organio animated fadeInUp">
              <div className="category-img-wrap">
                <img 
                  src={cat.image?.startsWith('http') ? cat.image : `${import.meta.env.VITE_API_URL}${cat.image}`} 
                  alt={cat.name} 
                />
              </div>
              <div className="category-info-organio">
                <h3>{cat.name}</h3>
                <Link to="/categories" className="cat-cta-btn">
                  Explore <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
