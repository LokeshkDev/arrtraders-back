import React from 'react';

const Returns = () => {
  return (
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh' }}>
      <section className="container-lg py-5 px-4" style={{ maxWidth: '800px' }}>
        <h1 className="font-headline text-primary mb-4 text-center">Returns & Refunds</h1>
        <div className="bg-secondary mx-auto mb-5" style={{ width: '60px', height: '3px' }}></div>
        
        <div className="bg-white p-5 rounded-4 shadow-sm border border-opacity-10 font-body text-primary opacity-75 lh-lg">
          <p className="mb-4">We want you to be completely satisfied with your purchase. Due to the perishable nature of our products, our return policy is as follows:</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">1. Eligibility for Returns</h4>
          <p className="mb-4">Returns are accepted only for quality issues or if the wrong item was delivered. The request must be made within 24 hours of delivery.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">2. Refund Process</h4>
          <p className="mb-4">Approved refunds are processed within 5-7 business days via the original payment method.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">3. Damaged Goods</h4>
          <p className="mb-0">If you receive a damaged package, please take a photo and contact our support team immediately.</p>
        </div>
      </section>
    </main>
  );
};

export default Returns;
