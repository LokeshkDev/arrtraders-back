import React from 'react';
import { Star, Quote, User } from 'lucide-react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import './Testimonials.css';

const Testimonials = ({ testimonials = [] }) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="testimonials-section-premium bg-light bg-opacity-30" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="container-lg">
        <div className="text-center mb-5 pb-2">
          <div className="d-inline-flex align-items-center gap-2 bg-secondary bg-opacity-10 text-primary px-4 py-2 rounded-pill font-label extra-small fw-bold mb-3">
            <Quote size={14} fill="currentColor" /> VOICES OF TRUST
          </div>
          <h2 className="display-5 fw-bold font-headline text-primary mb-3">Our Happy Harvest Tribe</h2>
          <p className="text-muted max-w-600 mx-auto font-body">Real experiences from our community of organic lovers across the country.</p>
        </div>

        <div className="row g-4 justify-content-center testimonials-grid-desktop">
          {testimonials.map((item, idx) => (
            <div key={idx} className="col-lg-3 col-md-6 h-auto">
              <div className="testimonial-card-premium h-100 p-4 p-lg-5 rounded-5 bg-white border border-opacity-10 shadow-sm transition-all hover-translate-y hover-shadow-lg position-relative overflow-hidden">
                <div className="quote-icon-bg position-absolute top-0 end-0 p-4 opacity-5 text-secondary">
                  <Quote size={80} />
                </div>

                <div className="stars-wrapper d-flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < (item.rating || 5) ? "var(--secondary)" : "none"}
                      stroke={i < (item.rating || 5) ? "var(--secondary)" : "#ddd"}
                    />
                  ))}
                </div>

                <p className="testimonial-text-premium font-body fs-6 mb-5 position-relative z-1" style={{ fontStyle: 'italic', color: 'var(--primary)' }}>
                  "{item.text}"
                </p>

                <div className="testimonial-user d-flex align-items-center gap-3 mt-auto">
                  <div className="user-avatar-wrapper shadow-md rounded-circle overflow-hidden bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', border: '3px solid white' }}>
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <User size={24} className="text-primary opacity-50" />
                    )}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 font-headline" style={{ fontSize: '15px' }}>{item.name}</h5>
                    <span className="extra-small text-muted fw-bold opacity-75 uppercase font-label" style={{ letterSpacing: '0.5px' }}>{item.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1.08}
          spaceBetween={14}
          centeredSlides={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          className="testimonials-mobile-carousel"
        >
          {testimonials.map((item, idx) => (
            <SwiperSlide key={idx} className="h-auto">
              <div className="testimonial-card-premium h-100 p-4 rounded-4 bg-white border border-opacity-10 shadow-sm position-relative overflow-hidden">
                <div className="quote-icon-bg position-absolute top-0 end-0 p-4 opacity-5 text-secondary">
                  <Quote size={72} />
                </div>

                <div className="stars-wrapper d-flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < (item.rating || 5) ? "var(--secondary)" : "none"}
                      stroke={i < (item.rating || 5) ? "var(--secondary)" : "#ddd"}
                    />
                  ))}
                </div>

                <p className="testimonial-text-premium font-body mb-4 position-relative z-1" style={{ fontStyle: 'italic', color: 'var(--primary)' }}>
                  "{item.text}"
                </p>

                <div className="testimonial-user d-flex align-items-center gap-3 mt-auto">
                  <div className="user-avatar-wrapper shadow-md rounded-circle overflow-hidden bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', border: '3px solid white' }}>
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <User size={22} className="text-primary opacity-50" />
                    )}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 font-headline" style={{ fontSize: '14px' }}>{item.name}</h5>
                    <span className="extra-small text-muted fw-bold opacity-75 uppercase font-label" style={{ letterSpacing: '0.5px' }}>{item.role}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
