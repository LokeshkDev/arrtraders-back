import React, { useState, useEffect } from 'react';

const About = () => {
  return (
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh', paddingBottom: '0' }}>
      {/* Hero Section */}
      <section className="container-fluid px-0 position-relative overflow-hidden mb-5" style={{ height: '400px' }}>
        <img 
          src="https://images.unsplash.com/photo-1547517023-7ca0c162f816?auto=format&fit=crop&q=80&w=2000" 
          alt="Artisanal Heritage" 
          className="w-100 h-100 object-fit-cover opacity-75"
        />
        <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
          <span className="text-secondary text-uppercase font-label fw-bold small mb-2 d-inline-block ls-lg">About Us</span>
          <h1 className="display-3 font-headline text-primary mb-0">Our Story</h1>
          <div className="bg-secondary mx-auto mt-4" style={{ width: '80px', height: '3px' }}></div>
        </div>
      </section>

      <section className="container-lg py-5">
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <h2 className="font-headline text-primary mb-4">From the Farm to Your Table</h2>
            <p className="font-body text-primary fs-5 lh-lg opacity-75 mb-4">
              AR Rahman Dates and Nuts brings you nature's finest treasures. We focus on high quality and natural products, providing the best dried fruits and nuts carefully selected from the best sources.
            </p>
            <p className="font-body text-primary lh-lg opacity-75">
              Our journey began with a simple vision: to connect small producers with customers who want healthy and delicious food.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="p-2 border rounded-4 bg-white shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1000" 
                alt="Quality Selects" 
                className="w-100 rounded-3"
              />
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4 text-center p-4">
            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <span className="fs-2">🌿</span>
            </div>
            <h4 className="font-headline text-primary mb-3">Pure Quality</h4>
            <p className="font-body text-muted small px-lg-3">No additives or artificial preservatives. Just natural goodness from the earth.</p>
          </div>
          <div className="col-md-4 text-center p-4">
            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <span className="fs-2">🌍</span>
            </div>
            <h4 className="font-headline text-primary mb-3">Direct Sourcing</h4>
            <p className="font-body text-muted small px-lg-3">We work directly with farms to ensure ethical practices and the best quality.</p>
          </div>
          <div className="col-md-4 text-center p-4">
            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <span className="fs-2">📦</span>
            </div>
            <h4 className="font-headline text-primary mb-3">Quality Packaging</h4>
            <div className="p-4 bg-surface-container-low rounded border-start border-4 border-secondary mt-3">
              <h4 className="font-headline text-primary mb-3 fs-6">Our Mission</h4>
              <p className="font-body text-primary opacity-75 mb-0 small">
                To provide healthy and tasty snacks that bring joy and wellness to every customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Values */}
      <section className="bg-primary text-white py-5 mt-5">
        <div className="container-lg py-4 text-center">
          <h2 className="font-headline mb-4">Our Quality Standard</h2>
          <p className="font-body opacity-75 mb-0 mx-auto" style={{ maxWidth: '700px' }}>
            Every product is hand-picked and carefully inspected. We believe that true quality comes from natural products.
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;
