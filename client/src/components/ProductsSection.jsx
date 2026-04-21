import React from 'react';
import ProductCard from './ProductCard';
import './ProductsSection.css';

const ProductsSection = ({ 
  products, 
  title, 
  subtitle, 
  showBestSellerBadge = true, 
  showFeaturedBadge = true 
}) => {
  return (
    <section className="products-section section-padding">
      <div className="container-custom">
        <div className="section-title mb-5">
          <span className="text-gold fw-bold text-uppercase fs-8 tracking-wider">{subtitle}</span>
          <h2 className="fs-2 text-primary fw-bold mt-2">{title}</h2>
        </div>

        <div className="product-grid-organio row g-4">
          {Array.isArray(products) && products.map((prod) => (
            <div key={prod._id || prod.id} className="col-12 col-sm-6 col-lg-3">
              <ProductCard 
                product={prod} 
                showBestSellerBadge={showBestSellerBadge} 
                showFeaturedBadge={showFeaturedBadge} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
