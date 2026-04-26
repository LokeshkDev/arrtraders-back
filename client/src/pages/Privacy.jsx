import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Privacy = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/pages/privacy`);
        setData(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center bg-surface"><div className="spinner-border text-primary"></div></div>;

  const content = data?.content || {};

  return (
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh' }}>
      {data?.bannerImage && (
        <section className="container-fluid px-0 position-relative overflow-hidden" style={{ height: '250px' }}>
          <img src={data.bannerImage} className="w-100 h-100 object-fit-cover opacity-50" alt="Privacy" />
          <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
             <h1 className="display-4 font-headline text-primary mb-0 fw-bold">Privacy Policy</h1>
          </div>
        </section>
      )}

      <section className="container-lg py-5 px-4" style={{ maxWidth: '800px' }}>
        {!data?.bannerImage && (
          <>
            <h1 className="font-headline text-primary mb-4 text-center">Privacy Policy</h1>
            <div className="bg-secondary mx-auto mb-5" style={{ width: '60px', height: '3px' }}></div>
          </>
        )}
        
        <div className="bg-white p-5 rounded-4 shadow-sm border border-opacity-10 font-body text-primary opacity-75 lh-lg">
          {content.text ? content.text.split('\n').map((para, i) => (
            <p key={i} className="mb-4">{para.trim()}</p>
          )) : (
            <>
              <p className="mb-4">Your privacy is important to us. We collect minimal data required to fulfill your orders.</p>
              <h4 className="font-headline fs-5 text-primary mb-3">1. Information Collection</h4>
              <p className="mb-4">We collect your name, email, and shipping address when you place an order.</p>
              <h4 className="font-headline fs-5 text-primary mb-3">2. Data Usage</h4>
              <p className="mb-4">Your data is used solely for order processing.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Privacy;
