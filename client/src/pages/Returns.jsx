import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Returns = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/cms/pages/returns`);
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
    <main className="bg-surface" style={{ minHeight: '80vh' }}>
      {data?.bannerImage && (
        <section className="container-fluid px-0 position-relative overflow-hidden" style={{ height: '250px' }}>
          <img src={data.bannerImage} className="w-100 h-100 object-fit-cover opacity-50" alt="Returns" />
          <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
             <h1 className="display-4 font-headline text-primary mb-0 fw-bold">Returns & Refunds</h1>
          </div>
        </section>
      )}

      <section className="container-lg py-5 px-4" style={{ maxWidth: '900px' }}>
        {!data?.bannerImage && (
          <>
            <h1 className="font-headline text-primary mb-4 text-center">Returns & Refunds</h1>
            <div className="bg-secondary mx-auto mb-5" style={{ width: '60px', height: '3px' }}></div>
          </>
        )}
        
        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-opacity-10 font-body text-primary opacity-75 lh-lg policy-content">
          {content.text ? (
            <div dangerouslySetInnerHTML={{ __html: content.text }} />
          ) : (
            <>
              <p className="mb-4">We want you to be completely satisfied with your purchase. Due to the perishable nature of our products, our return policy is as follows:</p>
              <h4 className="font-headline fs-5 text-primary mb-3">1. Eligibility for Returns</h4>
              <p className="mb-4">Returns are accepted only for quality issues. The request must be made within 24 hours.</p>
              <h4 className="font-headline fs-5 text-primary mb-3">2. Refund Process</h4>
              <p className="mb-4">Approved refunds are processed within 5-7 business days.</p>
            </>
          )}
        </div>
      </section>
      <style>{`
        .policy-content p { margin-bottom: 1.5rem; }
        .policy-content ul, .policy-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .policy-content h1, .policy-content h2, .policy-content h3, .policy-content h4 { margin-top: 2rem; margin-bottom: 1rem; color: var(--primary); font-family: var(--font-heading); }
      `}</style>
    </main>
  );
};

export default Returns;
