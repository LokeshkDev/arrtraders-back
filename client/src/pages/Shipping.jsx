import React from 'react';

const Shipping = () => {
  return (
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh' }}>
      <section className="container-lg py-5 px-4" style={{ maxWidth: '800px' }}>
        <h1 className="font-headline text-primary mb-4 text-center">Shipping Policy</h1>
        <div className="bg-secondary mx-auto mb-5" style={{ width: '60px', height: '3px' }}></div>
        
        <div className="bg-white p-5 rounded-4 shadow-sm border border-opacity-10 font-body text-primary opacity-75 lh-lg">
          <p className="mb-4">At AR Rahman Dates and Nuts, we strive to deliver your artisanal selections in the freshest possible condition.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">1. Shipping Coverage</h4>
          <p className="mb-4">We currently ship all across India. International shipping is available upon request for bulk orders.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">2. Delivery Timelines</h4>
          <p className="mb-4">Orders are processed within 24-48 hours. Domestic delivery typically takes 3-7 business days depending on your location.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">3. Shipping Charges</h4>
          <p className="mb-0">Free shipping is available on orders above ₹1999. A flat shipping fee applies to all other orders.</p>
        </div>
      </section>
    </main>
  );
};

export default Shipping;
