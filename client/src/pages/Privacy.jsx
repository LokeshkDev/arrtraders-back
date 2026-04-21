import React from 'react';

const Privacy = () => {
  return (
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh' }}>
      <section className="container-lg py-5 px-4" style={{ maxWidth: '800px' }}>
        <h1 className="font-headline text-primary mb-4 text-center">Privacy Policy</h1>
        <div className="bg-secondary mx-auto mb-5" style={{ width: '60px', height: '3px' }}></div>
        
        <div className="bg-white p-5 rounded-4 shadow-sm border border-opacity-10 font-body text-primary opacity-75 lh-lg">
          <p className="mb-4">Your privacy is important to us. We collect minimal data required to fulfill your orders and improve your shopping experience.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">1. Information Collection</h4>
          <p className="mb-4">We collect your name, email, and shipping address when you place an order. We do not store credit card details.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">2. Data Usage</h4>
          <p className="mb-4">Your data is used solely for order processing and occasionally sending news about our curated collections if you subscribe.</p>
          
          <h4 className="font-headline fs-5 text-primary mb-3">3. Security</h4>
          <p className="mb-0">We use industry-standard encryption to protect your information and ensure secure transactions.</p>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
