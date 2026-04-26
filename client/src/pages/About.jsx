import React, { useState, useEffect } from 'react';
import axios from 'axios';

const About = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/pages/about`);
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
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh', paddingBottom: '0' }}>
      {/* Hero Section */}
      <section className="container-fluid px-0 position-relative overflow-hidden mb-5" style={{ height: '400px' }}>
        <img 
          src={data?.bannerImage || "https://images.unsplash.com/photo-1547517023-7ca0c162f816?auto=format&fit=crop&q=80&w=2000"} 
          alt={content.heroTitle || "Artisanal Heritage"} 
          className="w-100 h-100 object-fit-cover opacity-75"
        />
        <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
          <span className="text-secondary text-uppercase font-label fw-bold small mb-2 d-inline-block ls-lg">{content.heroSubtitle || "About Us"}</span>
          <h1 className="display-3 font-headline text-primary mb-0">{content.heroTitle || "Our Story"}</h1>
          <div className="bg-secondary mx-auto mt-4" style={{ width: '80px', height: '3px' }}></div>
        </div>
      </section>

      <section className="container-lg py-5">
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <h2 className="font-headline text-primary mb-4">{content.storyTitle || "From the Farm to Your Table"}</h2>
            <p className="font-body text-primary fs-5 lh-lg opacity-75 mb-4">
              {content.storyText1 || "AR Rahman Dates and Nuts brings you nature's finest treasures."}
            </p>
            <p className="font-body text-primary lh-lg opacity-75">
              {content.storyText2 || "Our journey began with a simple vision: to connect small producers with customers who want healthy and delicious food."}
            </p>
          </div>
          <div className="col-lg-6">
            <div className="p-2 border rounded-4 bg-white shadow-sm">
              <img 
                src={content.storyImage || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1000"} 
                alt="Quality Selects" 
                className="w-100 rounded-3"
              />
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {(content.features || []).map((f, idx) => (
            <div key={idx} className="col-md-4 text-center p-4">
              <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                <span className="fs-2">{f.icon}</span>
              </div>
              <h4 className="font-headline text-primary mb-3">{f.title}</h4>
              <p className="font-body text-muted small px-lg-3">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Production Values */}
      <section className="bg-primary text-white py-5 mt-5">
        <div className="container-lg py-4 text-center">
          <h2 className="font-headline mb-4">{content.footerTitle || "Our Quality Standard"}</h2>
          <p className="font-body opacity-75 mb-0 mx-auto" style={{ maxWidth: '700px' }}>
            {content.footerText || "Every product is hand-picked and carefully inspected. We believe that true quality comes from natural products."}
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;
