import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import DOMPurify from 'dompurify';
import { CartContext } from '../context/CartContext';
import { ArrowRight, ShoppingCart, Heart, Eye, TrendingUp, Star, ShieldCheck, Truck, RefreshCcw, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Testimonials from '../components/Testimonials';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import './Home.css';

const Home = () => {
  const cartContext = useContext(CartContext);

  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!cmsData?.flashSaleEndTime) return;

    const timer = setInterval(() => {
      const distance = new Date(cmsData.flashSaleEndTime).getTime() - new Date().getTime();
      if (distance < 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cmsData?.flashSaleEndTime]);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
        setCmsData(data);
      } catch (error) {
        console.error('CMS fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCMS();
  }, []);

  const handleAddToCart = (product) => {
    if (cartContext && cartContext.addToCart) {
      cartContext.addToCart(product, 1);
    }
  };

  const defaultHeroSlides = [
    {
      title: "Estate <span>Reserve</span> Selection",
      subtitle: "AR RAHMAN EXCLUSIVE",
      text: "Indulge in our curated treasury of hand-picked seasonal treasures, sourced for the discerning palate.",
      img: "/images/reference/hero-slide-3.jpg",
      bgImg: "/images/reference/hero-slide-3.jpg",
      btnText: "Explore Reserve"
    },
    {
      title: "Artisan <span>Gift</span> Treasures",
      subtitle: "CELEBRATION HAMPERS",
      text: "Elevate your gifting experience with our bespoke artisanal collections, designed for royal moments.",
      img: "/images/reference/hero-slide-4.jpg",
      bgImg: "/images/reference/hero-slide-4.jpg",
      btnText: "Discover Gifting"
    }
  ];

  const heroSlides = cmsData?.heroSlides?.length > 0 ? cmsData.heroSlides.map(s => ({
    title: s.title,
    subtitle: s.subtitle,
    text: s.text,
    img: s.productImg || "/images/reference/product-large-1.jpg",
    bgImg: s.bgImg || "/images/reference/banner-1.jpg",
    btnText: s.btnText,
    btnLink: s.btnLink || '/categories'
  })) : defaultHeroSlides;

  const lucideIcons = { ShieldCheck, Star, Truck, RefreshCcw };

  const defaultFeatures = [
    { icon: ShieldCheck, title: "Farm to Table", desc: "100% Certified Organic" },
    { icon: Star, title: "Premium Quality", desc: "Hand-picked Selection" },
    { icon: Truck, title: "Express Shipping", desc: "Free on orders above ₹999" },
    { icon: RefreshCcw, title: "Easy Returns", desc: "No questions asked policy" }
  ];

  const features = cmsData?.features?.length > 0 ? cmsData.features.map(f => ({
    icon: lucideIcons[f.icon] || Star,
    title: f.title,
    desc: f.desc
  })) : defaultFeatures;

  const defaultCategoryItems = [
    { name: "Premium Dates", img: "/images/reference/category-thumb-1.jpg", count: "12 Items" },
    { name: "Exotic Nuts", img: "/images/reference/category-thumb-2.jpg", count: "15 Items" },
    { name: "Gifting Hampers", img: "/images/reference/category-thumb-5.jpg", count: "8 Items" },
    { name: "Wellness Mix", img: "/images/reference/category-thumb-4.jpg", count: "10 Items" },
    { name: "Organic Honey", img: "/images/reference/category-thumb-6.jpg", count: "5 Items" }
  ];

  const categoryItems = cmsData?.categoryItems?.length > 0 ? cmsData.categoryItems : defaultCategoryItems;

  const experienceBanners = cmsData?.experienceBanners?.length > 0 ? cmsData.experienceBanners : [
    {
      title: 'Luxury Gifting <span class="text-primary">Collection</span>',
      text: 'Exquisite artisanal hampers for royal celebrations and corporate excellence.',
      img: '/images/reference/banner-ad-1.jpg',
      btnText: 'Discover Gifting Art',
      btnStyle: 'primary'
    }
  ];

  const [bestSellers, setBestSellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);

        // 1. Best Sellers
        const bs = data.filter(p => p.isBestSeller).slice(0, 8);
        setBestSellers(bs);

        // 2. Featured Products
        const fp = data.filter(p => p.isFeatured).slice(0, 8);
        setFeaturedProducts(fp);

        // 3. Flash Sale
        const fs = data.filter(p => p.flashSale).slice(0, 8);
        setFlashSaleProducts(fs);

      } catch (e) {
        console.error('Products fetch error:', e);
      }
    }
    fetchProducts();
  }, []);

  return (
    <main className={`home-page animate-fade-in ${loading ? 'opacity-50' : ''}`}>
      {/* Hero Billboard - Fit to Screen */}
      {(cmsData?.showHero !== false) && (
        <section className="billboard">
          {loading ? (
            <div className="hero-slide-content bg-light d-flex align-items-center justify-content-center">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay, EffectFade]}
              effect={'fade'}
              autoplay={{ delay: 7000 }}
              loop={true}
              className="main-swiper"
            >
              {heroSlides.map((slide, idx) => (
                <SwiperSlide key={idx}>
                  <div className="hero-slide-content">
                    {/* Cinematic Background with Ken Burns Effect */}
                    <div
                      className="hero-bg-zoom"
                      style={{ backgroundImage: `url(${slide.bgImg})` }}
                    ></div>

                    <div className="container-lg h-100 position-relative" style={{ zIndex: 10 }}>
                      <div className="row align-items-center justify-content-end h-100">
                        <div className="col-lg-8 banner-content text-white text-end pe-lg-5">
                          <div className="banner-bg-text animate-stagger-1 text-end w-100" style={{ right: '5%' }}>AR RAHMAN</div>
                          <div className="badge-premium mb-4 d-inline-block border-white text-white animate-stagger-1 glass-badge">
                            {slide.subtitle}
                          </div>
                          <h1 className="banner-title mb-4 text-white animate-stagger-2 shadow-text"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(slide.title) }}></h1>
                          <p className="fs-5 mb-5 opacity-85 fw-light lh-base animate-stagger-3 ms-auto shadow-text" style={{ maxWidth: '650px' }}>
                            {slide.text}
                          </p>
                          <div className="d-flex gap-3 mt-5 animate-stagger-4 justify-content-end">
                            <Link to={slide.btnLink || '/categories'} className="btn btn-primary btn-lg rounded-pill px-5 shadow-lg">
                              {slide.btnText}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>
      )}

      {/* Features Section - High Density - HIDDEN ON MOBILE */}
      {(cmsData?.showFeatures !== false) && (
        <section className="padding-medium bg-white border-bottom shadow-sm position-relative d-none d-lg-block" style={{ zIndex: 10, marginTop: '-40px', borderRadius: '40px 40px 0 0' }}>
          <div className="container-lg">
            <div className="row g-4">
              {features.map((F, i) => (
                <div key={i} className="col-lg-3 col-md-6">
                  <div className="feature-item d-flex align-items-center gap-3 p-3">
                    <div className="feature-icon-wrapper rounded-4 bg-primary bg-opacity-10 text-secondary p-3" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <F.icon size={28} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold fs-6">{F.title}</h5>
                      <p className="mb-0 text-muted extra-small fw-bold uppercase opacity-75">{F.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Grid - fit to screen */}
      {(cmsData?.showCategories !== false) && (
        <section className="padding-large category-section-refined">
          <div className="container-lg">
            <div className="text-center mb-5 pb-3">
              <h2 className="display-5 fw-bold mb-3 font-headline">Explore categories</h2>
              <div className="mx-auto bg-primary rounded-pill mb-3" style={{ width: '80px', height: '4px' }}></div>
              <p className="text-muted fs-6">Experience the finest selection of premium dates, exotic nuts, and artisanal wellness blends.</p>
            </div>

            <div className="category-minimal-grid">
              {categoryItems.map((cat, i) => (
                <Link to={`/categories?selected=${cat.name}`} className="category-minimal-item" key={i}>
                  <div className="category-minimal-img-wrapper">
                    <img src={cat.img} alt={cat.name} className="category-minimal-img" loading="lazy" />
                  </div>
                  <div className="category-minimal-label">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Collections - IF ENABLED */}
      {(cmsData?.showFeatured !== false) && featuredProducts.length > 0 && (
        <section className="padding-large bg-light bg-opacity-30 border-top border-bottom">
          <div className="container-lg">
            <div className="d-flex justify-content-between align-items-end mb-5 align-items-end flex-lg-row flex-column">
               <div>
                <h4 className="text-secondary fw-bold mb-2 font-body uppercase extra-small" style={{ letterSpacing: '2px' }}>Handpicked For You</h4>
                <h2 className="display-5 fw-bold font-headline mb-0 text-dark">Featured Today</h2>
              </div>
              <Link to={cmsData?.featuredBtnLink || '/featured'} className="btn btn-outline-primary rounded-pill px-4 fw-bold mb-2">
                {cmsData?.featuredBtnText || 'Visit Now'} <ArrowRight size={16} className="ms-2" />
              </Link>
            </div>

            <div className="row g-4 d-none d-lg-flex">
              {featuredProducts.map(product => (
                <div key={product._id} className="col-lg-3 col-md-6">
                  <ProductCard product={product} showFeaturedBadge={true} />
                </div>
              ))}
            </div>

            {/* Mobile Swiper for Featured */}
            <div className="d-lg-none product-swiper-wrap pb-4">
              <Swiper
                modules={[]}
                slidesPerView={1.4}
                spaceBetween={20}
              >
                {featuredProducts.map(product => (
                  <SwiperSlide key={product._id} className="h-auto">
                    <ProductCard product={product} showFeaturedBadge={true} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale - IF ENABLED */}
      {(cmsData?.showFlashSale !== false) && (timeLeft === null || timeLeft > 0) && flashSaleProducts.length > 0 && (
        <section className="padding-medium bg-danger bg-opacity-5">
          <div className="container-lg">
            <div className="bg-white p-4 p-md-5 rounded-5 shadow-premium border border-danger border-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5 flex-lg-row flex-column">
                <div className="d-flex align-items-center gap-4">
                  <div className="bg-danger text-white p-3 rounded-4 shadow-sm animate-pulse">
                    <Star size={32} fill="white" />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-1 font-headline text-danger">Flash Sale Ending Soon!</h2>
                    <p className="text-muted mb-0 font-body">Limited quantity items at exclusive harvest-deal prices.</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <div className="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-4 fw-bold font-label d-flex align-items-center gap-2">
                    <Clock size={16} /> {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              <div className="row g-4 d-none d-lg-flex">
                {flashSaleProducts.map(product => (
                  <div key={product._id} className="col-lg-3 col-md-6">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Mobile Swiper for Flash Sale */}
              <div className="d-lg-none product-swiper-wrap pb-2">
                <Swiper
                  modules={[]}
                  slidesPerView={1.4}
                  spaceBetween={20}
                >
                  {flashSaleProducts.map(product => (
                    <SwiperSlide key={product._id} className="h-auto">
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers - Premium Desktop Polish */}
      {(cmsData?.showBestSellers !== false) && (
        <section className="padding-large bg-white shadow-inner">
          <div className="container-lg">
            <div className="d-flex justify-content-between align-items-end mb-5 flex-lg-row flex-column">
               <div>
                <h4 className="text-primary fw-bold mb-2 font-body">FRESH FROM HARVEST</h4>
                <h2 className="display-5 fw-bold font-headline mb-0 text-dark">Best Selling Products</h2>
              </div>
              <Link to={cmsData?.bestSellersBtnLink || '/best-sellers'} className="btn btn-outline-primary rounded-pill px-4 fw-bold mb-2">
                {cmsData?.bestSellersBtnText || 'Explore All Catalog'} <ArrowRight size={18} className="ms-2" />
              </Link>
            </div>

            <div className="row g-4 g-xxl-5 d-none d-lg-flex">
              {bestSellers.map((product) => (
                <div key={product._id} className="col-lg-3 col-md-6">
                  <ProductCard product={product} showBestSellerBadge={true} />
                </div>
              ))}
            </div>

            {/* Mobile Swiper for Best Sellers */}
            <div className="d-lg-none product-swiper-wrap pb-4">
              <Swiper
                modules={[]}
                slidesPerView={1.4}
                spaceBetween={20}
                breakpoints={{
                  576: { slidesPerView: 2.2 }
                }}
              >
                {bestSellers.map((product) => (
                  <SwiperSlide key={product._id} className="h-auto">
                    <ProductCard product={product} showBestSellerBadge={true} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

      {/* Wellness & Gifting Experience */}
      {(cmsData?.showExperience !== false) && (
        <section className="py-2 py-lg-5">
          <div className="container-lg">
            <div className="row g-4 g-lg-5">
              {experienceBanners.map((banner, i) => (                 <div key={i} className="col-lg-10 offset-lg-1">
                  <div className="experience-card rounded-5 overflow-hidden shadow-premium position-relative h-100 group" style={{ minHeight: '450px' }}>
                    <img src={banner.img} alt={banner.title} className="w-100 h-100 object-fit-cover position-absolute top-0 start-0 transition-all group-hover-scale" loading="lazy" />
                    <div className="experience-content position-absolute bottom-0 start-0 p-4 p-md-5 text-white w-100" style={{ background: 'linear-gradient(transparent, rgba(26, 38, 26, 0.95))', zIndex: 2 }}>
                      <h4 className="fw-bold fs-3 fs-md-2 mb-2 mb-md-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(banner.title) }}></h4>
                      <p className="opacity-75 mb-3 mb-md-4 small font-body">{banner.text}</p>
                      <Link to={banner.btnLink || "/categories"} className={`btn btn-${banner.btnStyle || 'primary'} rounded-pill px-4 py-2 py-md-3 small ${banner.btnStyle === 'light' ? 'text-primary fw-bold' : ''}`}> {banner.btnText} </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {cmsData?.showTestimonials !== false && cmsData?.testimonials?.length > 0 && (
        <Testimonials testimonials={cmsData.testimonials} />
      )}
      {/* Bottom Spacer for Mobile Nav */}
      <div className="pb-5 mb-5 d-lg-none"></div>
    </main>
  );
};

export default Home;
