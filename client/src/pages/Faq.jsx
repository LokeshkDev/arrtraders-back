import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/cms/pages/faq`);
        setData(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center bg-surface"><div className="spinner-border text-primary"></div></div>;

  const faqs = data?.content?.items || [];

  return (
    <main className="bg-surface" style={{ minHeight: '80vh' }}>
      {data?.bannerImage && (
        <section className="container-fluid px-0 position-relative overflow-hidden" style={{ height: '250px' }}>
          <img src={data.bannerImage} className="w-100 h-100 object-fit-cover opacity-50" alt="FAQ" />
          <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
             <h1 className="display-4 font-headline text-primary mb-0 fw-bold">FAQ</h1>
          </div>
        </section>
      )}

      <section className="container-lg py-5 px-4" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-5">
           <span className="font-label text-primary extra-small fw-bold uppercase tracking-widest mb-2 d-inline-block">Help Center</span>
           <h1 className="display-5 font-headline text-primary mb-3">Frequently Asked Questions</h1>
           <p className="text-muted font-body">Find answers to common questions about our products and services.</p>
        </div>
        
        <div className="accordion-wrapper d-flex flex-column gap-3">
          {faqs.map((item, i) => (
            <div key={i} className={`faq-item bg-white rounded-4 border transition-all ${activeIndex === i ? 'shadow-md border-primary-subtle' : 'shadow-sm border-light'}`}>
              <button 
                className="w-100 border-0 bg-transparent p-4 d-flex align-items-center justify-content-between text-start"
                onClick={() => toggleAccordion(i)}
                aria-expanded={activeIndex === i}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className={`p-2 rounded-3 transition-all ${activeIndex === i ? 'bg-primary text-white' : 'bg-light text-primary'}`}>
                    <HelpCircle size={20} />
                  </div>
                  <h5 className={`font-headline mb-0 fs-6 transition-all ${activeIndex === i ? 'text-primary fw-bold' : 'text-primary'}`}>
                    {item.q}
                  </h5>
                </div>
                <div className={`transition-all ${activeIndex === i ? 'rotate-180 text-primary' : 'text-muted'}`}>
                  {activeIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              
              <div className={`faq-answer-container transition-all overflow-hidden ${activeIndex === i ? 'max-height-1000 p-4 pt-0' : 'max-height-0 overflow-hidden'}`} style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                 <div className="p-3 bg-light rounded-3 font-body text-primary opacity-75 small lh-lg">
                    {item.a}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <style>{`
        .max-height-0 { max-height: 0; }
        .max-height-1000 { max-height: 1000px; }
        .rotate-180 { transform: rotate(180deg); }
        .faq-item { transition: all 0.3s ease; }
        .faq-item:hover { transform: translateY(-2px); }
      `}</style>
    </main>
  );
};

export default Faq;
