import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, ShieldCheck, Headphones, Leaf } from 'lucide-react';
import './Features.css';

const Features = () => {
  const [threshold, setThreshold] = useState(1999);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
        if (data.freeShippingThreshold) setThreshold(data.freeShippingThreshold);
      } catch (e) { console.error(e); }
    };
    fetchSettings();
  }, []);

  const featureData = [
    {
      icon: <Truck size={40} />,
      title: 'Free Delivery',
      desc: `Free shipping on all orders over ₹${threshold.toLocaleString()}`
    },
    {
      icon: <ShieldCheck size={40} />,
      title: 'Secure Payment',
      desc: '100% secure payment gateways only'
    },
    {
      icon: <Leaf size={40} />,
      title: '100% Organic',
      desc: 'Pure and organic products from trusted farms'
    },
    {
      icon: <ShieldCheck size={40} />,
      title: 'Best Quality',
      desc: 'Hand-picked products for your health and taste'
    }
  ];

  return (
    <section className="features-section section-padding bg-light">
      <div className="container-custom">
        <div className="grid-4">
          {featureData.map((item, idx) => (
            <div key={idx} className="feature-box animated fadeInUp">
              <div className="feature-icon">
                {item.icon}
              </div>
              <div className="feature-info">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
