import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    { 
      q: "Where do your dates come from?", 
      a: "We source our premium dates from the finest farms across the Middle East and Africa, ensuring authentic variety and high quality." 
    },
    { 
      q: "Do you offer discounts for large orders?", 
      a: "Yes, we provide special pricing for weddings, corporate gifts, and wholesale orders. Please contact us for a quote." 
    },
    { 
      q: "How should I store the dates?", 
      a: "Most dates stay fresh at room temperature for up to a month, but we recommend keeping them in the refrigerator in a closed container to last longer." 
    },
    { 
      q: "Are your products organic?", 
      a: "We work with traditional farmers who use natural methods without synthetic additives to give you the best products." 
    },
    {
      q: "How long does delivery take?",
      a: "Standard delivery usually takes 3-5 business days depending on your location. We also offer express shipping if you need it faster."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh' }}>
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
