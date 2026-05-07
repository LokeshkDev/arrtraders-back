import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
  </svg>
);

const YouTubeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Contact = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/cms/pages/contact`);
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

  const socialLinks = [
    { key: 'whatsapp', url: content.whatsapp ? `https://wa.me/${content.whatsapp}` : '', label: 'WhatsApp', Icon: WhatsAppIcon, color: '#25D366' },
    { key: 'instagram', url: content.instagram, label: 'Instagram', Icon: InstagramIcon, color: '#E4405F' },
    { key: 'facebook', url: content.facebook, label: 'Facebook', Icon: FacebookIcon, color: '#1877F2' },
    { key: 'youtube', url: content.youtube, label: 'YouTube', Icon: YouTubeIcon, color: '#FF0000' },
    { key: 'twitter', url: content.twitter, label: 'Twitter / X', Icon: TwitterIcon, color: '#1DA1F2' },
  ].filter(s => s.url);

  const extractMapSrc = (val) => {
    if (!val) return '';
    const srcMatch = val.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : val;
  };

  const mapUrl = extractMapSrc(content.mapEmbed);

  return (
    <main className="bg-surface" style={{ minHeight: '80vh', paddingBottom: '5rem' }}>
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

                {content.whatsapp && (
                  <div className="d-flex align-items-start gap-3">
                    <a href={`https://wa.me/${content.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1 text-decoration-none" style={{ width: '48px', height: '48px', background: '#25D366' }}>
                       <WhatsAppIcon size={22} />
                    </a>
                    <div>
                      <h6 className="font-label text-primary fw-bold mb-1 text-uppercase ls-sm">WhatsApp</h6>
                      <a href={`https://wa.me/${content.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-medium font-body fs-5" style={{ color: '#25D366' }}>
                        Chat with us
                      </a>
                      <span className="text-muted extra-small d-block">Quick responses on WhatsApp.</span>
                    </div>
                  </div>
                )}

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

              {/* Social Media Links */}
              {socialLinks.length > 0 && (
                <div className="mt-4 p-4 bg-light rounded-4 border border-opacity-10">
                  <h6 className="font-label fw-bold small text-uppercase ls-sm text-secondary mb-3">Follow Us</h6>
                  <div className="d-flex gap-3 flex-wrap">
                    {socialLinks.map(({ key, url, label, Icon, color }) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon-btn d-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none"
                        style={{ width: '44px', height: '44px', background: color, transition: 'all 0.3s ease' }}
                        title={label}
                        aria-label={`Follow us on ${label}`}
                      >
                        <Icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
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

        {/* Google Maps Embed */}
        {mapUrl && (
          <div className="mt-5">
            <h3 className="font-headline text-primary mb-4 text-center">Find Us Here</h3>
            <div className="rounded-4 overflow-hidden shadow-sm border border-opacity-10" style={{ height: '400px' }}>
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
              />
            </div>
          </div>
        )}
      </section>
      <style>{`
        .ls-lg { letter-spacing: 0.2em; }
        .ls-sm { letter-spacing: 0.1em; }
        .focus-ring:focus { box-shadow: 0 0 0 .25rem rgba(160, 65, 0, 0.1); background-color: #fff !important; outline: 1px solid var(--primary); }
        .hover-translate-y:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .social-icon-btn:hover { transform: translateY(-3px) scale(1.1); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
      `}</style>
    </main>
  );
};

export default Contact;
