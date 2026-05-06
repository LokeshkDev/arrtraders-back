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
    <main className="bg-surface pb-0" style={{ minHeight: '80vh' }}>
      {/* Hero Section */}
      <section className="container-fluid px-0 position-relative overflow-hidden" style={{ height: '500px' }}>
        <img
          src={data?.bannerImage || "https://images.unsplash.com/photo-1547517023-7ca0c162f816?auto=format&fit=crop&q=80&w=2000"}
          alt={content.heroTitle || "Artisanal Heritage"}
          className="w-100 h-100 object-fit-cover opacity-75 animate-zoom"
        />
        <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3 z-index-1">
          <span className="text-secondary text-uppercase font-label fw-bold small mb-3 d-inline-block ls-lg animate-fade-up">
            {content.heroSubtitle || "About Us"}
          </span>
          <h1 className="display-2 font-headline text-primary mb-0 fw-bold animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {content.heroTitle || "Our Story"}
          </h1>
          <div className="bg-secondary mx-auto mt-4 animate-scale-in" style={{ width: '100px', height: '4px', animationDelay: '0.4s' }}></div>
        </div>
        <div className="position-absolute bottom-0 start-0 w-100 h-25 bg-gradient-to-t"></div>
      </section>

      {/* Story Section */}
      <section className="container-lg py-5 mt-5">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6 pr-lg-5">
            <div className="about-label mb-3">
              <span className="font-label text-secondary fw-bold small text-uppercase ls-md">Our Heritage</span>
            </div>
            <h2 className="display-5 font-headline text-primary mb-4 fw-bold">{content.storyTitle || "From the Farm to Your Table"}</h2>
            <div className="story-divider mb-4"></div>
            <p className="font-body text-primary fs-5 lh-lg opacity-75 mb-4">
              {content.storyText1 || "AR Rahman Dates and Nuts brings you nature's finest treasures."}
            </p>
            <p className="font-body text-primary lh-lg opacity-75">
              {content.storyText2 || "Our journey began with a simple vision: to connect small producers with customers who want healthy and delicious food."}
            </p>
          </div>
          <div className="col-lg-6">
            <div className="position-relative p-3">
              <div className="about-img-frame border rounded-4 bg-white shadow-premium p-3">
                <img
                  src={content.storyImage || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1000"}
                  alt="Quality Selects"
                  className="w-100 rounded-3 object-fit-cover"
                  style={{ height: '450px' }}
                />
              </div>
              {/* <div className="position-absolute bottom-0 start-0 translate-middle-x mb-5 d-none d-xl-block">
                <div className="bg-primary text-white p-4 rounded-4 shadow-lg" style={{ maxWidth: '200px' }}>
                  <h4 className="font-headline mb-0 h2 fw-bold">10+</h4>
                  <p className="font-label small text-uppercase mb-0 opacity-75">Years of Excellence</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Sections */}
      <section className="py-5 my-5 bg-light bg-opacity-50">
        <div className="container-lg py-5">
          {/* Vision */}
          <div className="row g-5 align-items-center mb-5 pb-5">
            <div className="col-lg-6 order-lg-2">
              <div className="ps-lg-5">
                <span className="font-label text-secondary fw-bold small text-uppercase ls-md mb-2 d-block">Forward Thinking</span>
                <h2 className="display-6 font-headline text-primary mb-4 fw-bold">{content.visionTitle || "Our Vision"}</h2>
                <p className="font-body text-primary fs-5 lh-lg opacity-75">
                  {content.visionText || "To be the most trusted source of premium dates and nuts globally, setting benchmarks in quality and sustainability."}
                </p>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="rounded-4 overflow-hidden shadow-premium border border-5 border-white">
                <img
                  src={content.visionImage || "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&q=80&w=1000"}
                  alt="Vision"
                  className="w-100 object-fit-cover"
                  style={{ height: '350px' }}
                />
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="row g-5 align-items-center pt-5">
            <div className="col-lg-6">
              <div className="pe-lg-5">
                <span className="font-label text-secondary fw-bold small text-uppercase ls-md mb-2 d-block">Our Purpose</span>
                <h2 className="display-6 font-headline text-primary mb-4 fw-bold">{content.missionTitle || "Our Mission"}</h2>
                <p className="font-body text-primary fs-5 lh-lg opacity-75">
                  {content.missionText || "Providing the highest quality artisanal products while supporting sustainable farming practices and ensuring customer well-being."}
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="rounded-4 overflow-hidden shadow-premium border border-5 border-white">
                <img
                  src={content.missionImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"}
                  alt="Mission"
                  className="w-100 object-fit-cover"
                  style={{ height: '350px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Values */}
      <section className="bg-primary text-white py-5 position-relative overflow-hidden">
        <div className="container-lg py-5 text-center position-relative z-index-1">
          <h2 className="display-5 font-headline text-secondary mb-4 fw-bold">{content.footerTitle || "Our Quality Standard"}</h2>
          <p className="font-body opacity-75 fs-5 mb-0 mx-auto lh-lg" style={{ maxWidth: '800px' }}>
            {content.footerText || "Every product is hand-picked and carefully inspected. We believe that true quality comes from natural products and traditional methods."}
          </p>
        </div>
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ background: 'radial-gradient(circle, var(--secondary) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </section>

      <style>{`
        .ls-md { letter-spacing: 0.15em; }
        .ls-lg { letter-spacing: 0.25em; }
        .shadow-premium { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08); }
        .story-divider { width: 60px; height: 3px; background: var(--secondary); border-radius: 2px; }
        .bg-surface { background-color: #FDFBF7; }
        .animate-fade-up { animation: fadeUp 1s ease forwards; opacity: 0; }
        .animate-scale-in { animation: scaleIn 0.8s ease forwards; transform: scaleX(0); }
        .animate-zoom { animation: zoomEffect 20s linear infinite alternate; }
        .z-index-1 { z-index: 1; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          to { transform: scaleX(1); }
        }
        @keyframes zoomEffect {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .bg-gradient-to-t {
          background: linear-gradient(to top, #FDFBF7, transparent);
        }
      `}</style>
    </main>
  );
};

export default About;
