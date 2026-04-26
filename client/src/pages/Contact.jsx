import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, Send, Clock, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/pages/contact`);
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
    <main className="pt-5 mt-5 bg-surface" style={{ minHeight: '80vh', paddingBottom: '5rem' }}>
      {/* Banner Section */}
      {data?.bannerImage && (
        <section className="container-fluid px-0 position-relative overflow-hidden" style={{ height: '300px' }}>
          <img src={data.bannerImage} className="w-100 h-100 object-fit-cover opacity-50" alt="Contact Us" />
          <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
             <h1 className="display-4 font-headline text-primary mb-0 fw-bold">Contact Us</h1>
          </div>
        </section>
      )}

      <section className="container-lg px-4 py-5" style={{ maxWidth: '1100px' }}>
        <div className="text-center mb-5 mt-4">
          <span className="text-secondary text-uppercase font-label fw-bold small mb-2 d-inline-block ls-lg">Connect With Us</span>
          <h1 className="display-4 font-headline text-primary mb-3">{content.subtitle || "We would love to hear from you."}</h1>
          <div className="bg-secondary mx-auto mb-5" style={{ width: '60px', height: '3px' }}></div>
        </div>

        <div className="row g-5">
          <div className="col-lg-5">
            <div className="bg-white p-5 rounded-4 shadow-sm border border-opacity-10 h-100">
              <h3 className="font-headline text-primary mb-4">Contact Information</h3>
              <p className="text-primary opacity-75 mb-5 font-body">
                Reach out to us for bulk orders, premium gifting solutions, or simply to learn more about our curated collections.
              </p>
              
              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: '48px', height: '48px' }}>
                     <Phone size={20} />
                  </div>
                  <div>
                    <h6 className="font-label text-primary fw-bold mb-1 text-uppercase ls-sm">Call Support</h6>
                    <p className="text-primary opacity-75 mb-0 fw-medium font-body fs-5">{content.phone}</p>
                    <span className="text-muted extra-small">{content.hours || "Mon-Sat: 10:00 AM - 8:00 PM"}</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: '48px', height: '48px' }}>
                     <Mail size={20} />
                  </div>
                  <div>
                    <h6 className="font-label text-primary fw-bold mb-1 text-uppercase ls-sm">Email Queries</h6>
                    <p className="text-primary opacity-75 mb-0 fw-medium font-body fs-5">{content.email}</p>
                    <span className="text-muted extra-small">Expect a response within 24 hours.</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: '48px', height: '48px' }}>
                     <MapPin size={20} />
                  </div>
                  <div>
                    <h6 className="font-label text-primary fw-bold mb-1 text-uppercase ls-sm">Store Location</h6>
                    <p className="text-primary opacity-75 mb-0 fw-medium font-body fs-5">{content.address}</p>
                    <span className="text-muted extra-small">Visit our flagship artisanal boutique.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-4 bg-light rounded-4 border border-opacity-10">
                <div className="d-flex align-items-center gap-3 text-secondary mb-2">
                  <Clock size={18} />
                  <span className="font-label fw-bold small text-uppercase ls-sm">Business Hours</span>
                </div>
                <p className="font-body text-muted mb-0 small">{content.hours || "Mon-Sat: 10:00 AM - 8:00 PM"}</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-7">
            <div className="bg-white p-5 rounded-4 shadow-sm border border-opacity-10 h-100">
              <div className="d-flex align-items-center gap-3 mb-4">
                <MessageSquare className="text-secondary" size={24} />
                <h3 className="font-headline text-primary mb-0">Send a Message</h3>
              </div>
              <form>
                <div className="row g-4 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label font-label text-primary fw-bold small text-uppercase ls-sm">First Name</label>
                    <input type="text" className="form-control bg-light border-0 py-3 font-body focus-ring" placeholder="John" />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label font-label text-primary fw-bold small text-uppercase ls-sm">Last Name</label>
                    <input type="text" className="form-control bg-light border-0 py-3 font-body focus-ring" placeholder="Doe" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label font-label text-primary fw-bold small text-uppercase ls-sm">Email Address</label>
                  <input type="email" className="form-control bg-light border-0 py-3 font-body focus-ring" placeholder="john@example.com" />
                </div>
                <div className="mb-5">
                  <label className="form-label font-label text-primary fw-bold small text-uppercase ls-sm">Your Message</label>
                  <textarea className="form-control bg-light border-0 py-3 font-body focus-ring" rows="5" placeholder="How can we assist you today?"></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-3 font-label fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all hover-translate-y">
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .ls-lg { letter-spacing: 0.2em; }
        .ls-sm { letter-spacing: 0.1em; }
        .focus-ring:focus { box-shadow: 0 0 0 .25rem rgba(160, 65, 0, 0.1); background-color: #fff !important; outline: 1px solid var(--primary); }
        .hover-translate-y:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
      `}</style>
    </main>
  );
};

export default Contact;
