import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ShoppingBag,
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  BadgeCheck,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Info,
  AlertCircle,
  Package,
  Leaf
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { useLocation } from '../context/LocationContext';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';

const ProductDetails = () => {
  const { categorySlug, productSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, updateQty, cart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { location, serviceable, loading: locationLoading } = useLocation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [isMobileLightboxOpen, setIsMobileLightboxOpen] = useState(false);
  
  const productId = product?._id || product?.id;

  // Variant awareness logic
  const cartItem = cart?.find(item => 
    (item._id === productId || item.id === productId) && 
    item.weight === selectedWeight
  );
  const qtyInCart = cartItem ? cartItem.qty : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/slug/${categorySlug}/${productSlug}`);
        setProduct(data);
        
        // Synthesize weights including Primary Weight
        const primaryWeight = data.weight ? `${data.weight}${data.unit === 'gram' ? 'g' : data.unit === 'kg' ? 'kg' : data.unit === 'ml' ? 'ml' : 'L'}` : '';
        const customWeights = data.availableWeights && data.availableWeights.length > 0 
          ? data.availableWeights.map(w => typeof w === 'object' ? w.value : w)
          : [];
        
        const allWeights = primaryWeight 
          ? [...new Set([primaryWeight, ...customWeights])] 
          : (customWeights.length > 0 ? customWeights : ['250g', '500g', '1kg']);
          
        setSelectedWeight(allWeights[0]);
      } catch (error) {
        console.error('Product fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // Fetch global shipping info from CMS
    const fetchShipping = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
        if (data?.shippingInfo) setShippingInfo(data.shippingInfo);
      } catch (e) { console.error('Shipping fetch error:', e); }
    };
    fetchShipping();

    // Fetch featured products
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        const fp = data.filter(p => p.isFeatured).slice(0, 8);
        setFeaturedProducts(fp);
      } catch (e) { console.error('Featured fetch error:', e); }
    };
    fetchFeatured();
  }, [categorySlug, productSlug]);
  
  const productImages = (product?.images && product.images.length > 0) 
    ? product.images 
    : [product?.img || product?.image];

  // Update active image when weight changes if a specific image is linked
  useEffect(() => {
    if (!product || !selectedWeight || !productImages[0]) return;
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    if (variant && typeof variant === 'object' && variant.image) {
      const imgIndex = productImages.findIndex(img => img === variant.image);
      if (imgIndex !== -1) {
        setActiveImage(imgIndex);
      }
    }
  }, [selectedWeight, product, productImages]);

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" role="status"></div></div>;
  if (!product) return <div className="min-vh-100 d-flex align-items-center justify-content-center font-headline fs-4">Product collection not found.</div>;

  const primaryWeight = product.weight ? `${product.weight}${product.unit === 'gram' ? 'g' : product.unit === 'kg' ? 'kg' : product.unit === 'ml' ? 'ml' : 'L'}` : '';
  const customWeights = product.availableWeights && product.availableWeights.length > 0 
    ? product.availableWeights.map(w => typeof w === 'object' ? w.value : w)
    : [];

  const weights = primaryWeight 
    ? [...new Set([primaryWeight, ...customWeights])] 
    : (customWeights.length > 0 ? customWeights : ['250g', '500g', '1kg']);

  const currentPrice = (() => {
    // 1. Check if selected matches a specifically priced variation
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    if (variant && typeof variant === 'object' && variant.price) return variant.price;
    
    // 2. Fallback to product base price
    return product.price;
  })();

  const numBasePrice = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  const numBaseOrig = parseFloat(String(product.originalPrice || "0").replace(/[^0-9.]/g, '')) || 0;
  const baseRatio = (numBaseOrig > numBasePrice && numBasePrice > 0) ? (numBaseOrig / numBasePrice) : 1;

  const currentOriginalPrice = (() => {
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    if (variant && typeof variant === 'object') {
        if (variant.originalPrice) return variant.originalPrice;
        if (variant.price) return variant.price * baseRatio;
    }
    return product.originalPrice;
  })();

  const formattedPrice = (p) => {
    if (!p) return null;
    let val = typeof p === 'number' ? p : parseFloat(String(p).replace(/[^0-9.]/g, ''));
    if (isNaN(val)) return null;
    return val.toFixed(2);
  };

  const numPrice = parseFloat(formattedPrice(currentPrice));
  const numOrig = parseFloat(formattedPrice(currentOriginalPrice));
  const hasDiscount = numOrig > numPrice;
  const discountPercent = hasDiscount ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;


  const inWishlist = isInWishlist(product._id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.subtitle,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // We could use a toast here if we had one in this page's context
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  const handleAddToCart = () => {
    const productToCart = {
      ...product,
      weight: selectedWeight,
      price: currentPrice
    };
    addToCart(productToCart, qty);
  };

  return (
    <main className="product-details-page bg-white animate-fade-in">
      {/* Mobile-only Floating Header */}
      <div className="pd-mobile-header d-lg-none">
        <button onClick={() => navigate(-1)} className="mobile-nav-btn">
          <ArrowLeft size={20} />
        </button>
        <div className="d-flex gap-2">
          <button className="mobile-nav-btn" onClick={handleShare}>
            <Share2 size={20} />
          </button>
          <button className={`mobile-nav-btn ${inWishlist ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
            <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="container-lg py-4 px-0 px-lg-3">
        <nav aria-label="breadcrumb" className="mb-4 d-none d-lg-block">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-muted">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/categories" className="text-muted">Collections</Link></li>
            <li className="breadcrumb-item breadcrumb-active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-lg-5 m-0 align-items-start">
          <div className="col-lg-6 px-0">
            <div className="sticky-gallery-wrapper">
                <div className="d-none d-lg-block">
                    <div className="amazon-gallery-wrapper d-flex gap-3">
                        <div className="vertical-thumbnails d-flex flex-column gap-3">
                            {productImages.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`thumb-item ${activeImage === idx ? 'active-thumb' : ''}`}
                                    onMouseEnter={() => setActiveImage(idx)}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} className="w-100 h-100 object-fit-cover" />
                                </div>
                            ))}
                        </div>

                        <div className="main-preview-stage flex-grow-1 overflow-hidden">
                            <div 
                                className="zoom-container cursor-zoom-in h-100 w-100"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img 
                                    src={productImages[activeImage]} 
                                    alt={product.name} 
                                    className="w-100 h-100 object-fit-contain transition-all hover-zoom-amazon" 
                                    style={zoomStyle}
                                />
                                <div className="qv-image-badge position-absolute bottom-0 start-0 m-4 px-3 py-1">
                                    ARTISANAL GRADE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-lg-none mobile-app-gallery">
                   <Swiper
                     modules={[Pagination]}
                     pagination={{ clickable: true }}
                     className="bg-light"
                   >
                     {productImages.map((img, idx) => (
                       <SwiperSlide key={idx} onClick={() => setIsMobileLightboxOpen(true)}>
                         <div className="mobile-img-container">
                            <img src={img} alt={product.name} className="w-100 h-100 object-fit-contain" />
                            <div className="mobile-zoom-hint">
                                <Plus size={16} /> Tap to zoom
                            </div>
                         </div>
                       </SwiperSlide>
                     ))}
                   </Swiper>
                </div>
            </div>
          </div>

          <div className="col-lg-6 px-3 px-lg-5">
            <div className="pd-main-info mt-n4 mt-lg-0 mobile-app-card">
               <div className="d-flex align-items-center mb-3">
                   <span className="badge-luxury-reserve text-uppercase">{product.category || 'PREMIUM COLLECTION'}</span>
               </div>

                <h1 className="display-5 font-headline mb-2 text-primary">{product.name}</h1>
                <p className="fs-5 text-muted opacity-80 mb-4">{product.subtitle}</p>

                <div className="d-flex align-items-baseline flex-wrap gap-2 gap-md-3 mb-4 mb-lg-5">
                   <span className="price-premium">₹{formattedPrice(currentPrice)}</span>
                   {hasDiscount && (
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-4 text-muted text-decoration-line-through opacity-50">₹{formattedPrice(currentOriginalPrice)}</span>
                        <span className="badge-discount px-3 py-2 ms-1">SAVE {discountPercent}%</span>
                      </div>
                   )}
                </div>

                <div className="mb-4 mb-lg-5">
                   <h6 className="fw-bold tracking-widest text-muted extra-small uppercase mb-3 font-heading">CHOOSE WEIGHT</h6>
                   <div className="d-flex flex-wrap gap-2 gap-md-3">
                      {weights.map(w => (
                        <button 
                          key={w}
                          className={`pd-weight-pill ${selectedWeight === w ? 'active' : ''}`}
                          onClick={() => setSelectedWeight(w)}
                        >
                          {w}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="d-none d-lg-flex flex-wrap align-items-center gap-2 gap-md-3 mb-5 pb-2">
                   <div className="pd-qty-stepper d-flex align-items-center">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="stepper-btn"><Minus size={16} /></button>
                      <span className="stepper-val">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="stepper-btn"><Plus size={16} /></button>
                   </div>
                   {qtyInCart > 0 && (
                       <div className="pd-cart-badge d-flex align-items-center gap-2 px-3 py-2" style={{ fontSize: '0.75rem' }}>
                           <ShoppingBag size={14} />
                           <span className="fw-bold">{qtyInCart} in cart</span>
                       </div>
                   )}
                   <div className="flex-grow-1">
                       {!location && (
                           <p className="text-warning small mb-2 d-flex align-items-center gap-1">
                               <Info size={14} /> Please select delivery location
                           </p>
                       )}
                       {location && !serviceable && (
                           <p className="text-danger small mb-2 d-flex align-items-center gap-1">
                               <AlertCircle size={14} /> Not serviceable at {location.pincode}
                           </p>
                       )}
                       <button 
                         className="btn-add-luxury w-100" 
                         onClick={handleAddToCart}
                         disabled={!serviceable || locationLoading}
                       >
                          <ShoppingCart size={20} /> <span className="d-none d-sm-inline">{!serviceable ? 'UNSERVICEABLE' : 'ADD TO BASKET'}</span><span className="d-sm-none">{!serviceable ? 'N/A' : 'ADD'}</span>
                       </button>
                   </div>
                   <button className={`pd-wish-btn ${inWishlist ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
                     <Heart size={22} fill={inWishlist ? "currentColor" : "none"} />
                   </button>
                </div>

                <div className="usp-grid row g-4 mb-4 mb-lg-5">
                   {[
                     { icon: BadgeCheck, title: "Source Verified", sub: "Authentic Selection" },
                     { icon: Leaf, title: "100% Quality", sub: "No Added Preservatives" },
                     { icon: Package, title: "Secure Delivery", sub: "Vacuum Sealed Freshness" }
                   ].map((usp, i) => (
                     <div key={i} className="col-md-4 col-4">
                          <div className="usp-item text-center">
                              <div className="usp-icon mx-auto mb-2 text-primary bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                  <usp.icon size={18} className="text-secondary" />
                              </div>
                              <h6 className="extra-small fw-bold mb-0 font-heading" style={{ fontSize: '10px' }}>{usp.title}</h6>
                          </div>
                     </div>
                   ))}
                </div>

                <div className="pd-mobile-action-bar d-lg-none mt-4">
                  <div className="pd-mobile-bar-inner">
                    <div className="pd-mobile-qty-wrap">
                      <div className="pd-qty-stepper d-flex align-items-center">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="stepper-btn"><Minus size={14} /></button>
                        <span className="stepper-val">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="stepper-btn"><Plus size={14} /></button>
                      </div>
                      <div className="price-stack mt-1">
                        <span className="price-small">₹{formattedPrice(currentPrice)}</span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <button
                        className="btn-add-luxury-mobile w-100"
                        onClick={handleAddToCart}
                        disabled={!serviceable || locationLoading}
                      >
                        {!serviceable ? 'UNSERVICEABLE' : (
                          <><ShoppingCart size={18} /> ADD TO CART</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pd-info-tabs mt-4 mt-lg-5">
                   <div className="d-flex border-bottom gap-4 mb-4">
                      {['description', 'shipping'].map(tab => (
                         <button 
                           key={tab}
                           className={`tab-link py-2 border-0 bg-transparent fw-bold small uppercase tracking-wider position-relative ${activeTab === tab ? 'active' : 'text-muted'}`}
                           onClick={() => setActiveTab(tab)}
                         >
                           {tab}
                           {activeTab === tab && <div className="tab-indicator"></div>}
                         </button>
                      ))}
                   </div>
                   <div className="tab-content-area min-h-100">
                      {activeTab === 'description' && (
                         <div className="anim-fade-in">
                            <div 
                              className="text-muted fs-7 lh-lg product-description-html" 
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '') }} 
                            />
                            {product.features && (
                               <ul className="premium-list-app mt-3 list-unstyled">
                                  {product.features.map((f, i) => (
                                    <li key={i} className="d-flex align-items-baseline gap-2 mb-2 fs-7 text-primary">
                                       <div className="dot bg-secondary mt-2"></div> {f}
                                    </li>
                                  ))}
                               </ul>
                            )}
                         </div>
                      )}

                      {activeTab === 'shipping' && (
                         <div className="anim-fade-in">
                            {shippingInfo ? (
                               <>
                                 <p className="text-muted fs-7 lh-lg mb-4">{shippingInfo.content}</p>
                                 <div className="row g-2 mb-4">
                                   <div className="col-6">
                                     <div className="bg-light p-3 rounded-4 text-center border">
                                       <Truck size={20} className="text-secondary mb-2" />
                                       <span className="d-block extra-small text-muted uppercase fw-bold mb-1 font-heading">Delivery Time</span>
                                       <span className="d-block fs-7 fw-bold text-primary">{shippingInfo.deliveryTime}</span>
                                     </div>
                                   </div>
                                   <div className="col-6">
                                     <div className="bg-light p-3 rounded-4 text-center border">
                                       <Package size={20} className="text-secondary mb-2" />
                                       <span className="d-block extra-small text-muted uppercase fw-bold mb-1 font-heading">Free Shipping</span>
                                       <span className="d-block fs-7 fw-bold text-primary">Above {shippingInfo.freeShippingMin}</span>
                                     </div>
                                   </div>
                                 </div>
                                 {shippingInfo.returnPolicy && (
                                   <div className="luxury-return-box p-3 rounded-4">
                                     <h6 className="extra-small fw-bold text-secondary uppercase mb-1 font-heading">Return Policy</h6>
                                     <p className="text-muted fs-7 mb-0">{shippingInfo.returnPolicy}</p>
                                   </div>
                                 )}
                               </>
                            ) : (
                               <p className="text-muted fs-7 italic opacity-50">Shipping information will be available soon.</p>
                            )}
                         </div>
                      )}
                   </div>
                </div>
            </div>
          </div>
        </div>

        {featuredProducts.length > 0 && (
        <section className="mt-5 pt-5 border-top mb-5 pb-5">
            <div className="d-flex justify-content-between align-items-end mb-4 px-3 px-lg-0">
                <div>
                   <h4 className="text-secondary fw-bold mb-2 font-body uppercase extra-small" style={{ letterSpacing: '2px' }}>Handpicked For You</h4>
                   <h2 className="display-6 font-headline mb-0 text-primary">Featured Today</h2>
                </div>
                <Link to="/categories" className="text-secondary fw-bold text-decoration-none d-flex align-items-center gap-2 small font-heading tracking-widest">
                    <span className="d-none d-sm-inline">VIEW ALL</span> <ArrowRight size={16} />
                </Link>
            </div>

            <div className="row g-4 g-xxl-5 d-none d-lg-flex">
                {featuredProducts.slice(0, 4).map(p => (
                   <div key={p._id} className="col-6 col-md-3">
                      <ProductCard product={p} showFeaturedBadge={true} />
                   </div>
                ))}
            </div>

            <div className="d-lg-none product-swiper-wrap pb-5 px-3">
                <Swiper
                    modules={[Pagination]}
                    slidesPerView={1.3}
                    spaceBetween={15}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    breakpoints={{ 576: { slidesPerView: 2.2 } }}
                >
                    {featuredProducts.slice(0, 8).map(p => (
                       <SwiperSlide key={p._id} className="h-auto">
                           <ProductCard product={p} showFeaturedBadge={true} />
                       </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
        )}
      </div>

      {/* Mobile-only Sticky Action Bar */}
      <div className="pd-mobile-action-bar d-none">
        <div className="pd-mobile-bar-inner">
           <div className="pd-mobile-qty-wrap">
              <div className="pd-qty-stepper d-flex align-items-center">
                 <button onClick={() => setQty(Math.max(1, qty - 1))} className="stepper-btn"><Minus size={14} /></button>
                 <span className="stepper-val">{qty}</span>
                 <button onClick={() => setQty(qty + 1)} className="stepper-btn"><Plus size={14} /></button>
              </div>
              <div className="price-stack mt-1">
                 <span className="price-small">₹{formattedPrice(currentPrice)}</span>
              </div>
           </div>
           <div className="flex-grow-1">
              <button 
                className="btn-add-luxury-mobile w-100" 
                onClick={handleAddToCart}
                disabled={!serviceable || locationLoading}
              >
                {!serviceable ? 'UNSERVICEABLE' : (
                  <><ShoppingCart size={18} /> ADD TO CART</>
                )}
              </button>
           </div>
        </div>
      </div>
      {/* Mobile Lightbox / Fullscreen Zoom */}
      {isMobileLightboxOpen && (
        <div className="mobile-lightbox" onClick={() => setIsMobileLightboxOpen(false)}>
            <button className="close-lightbox" onClick={() => setIsMobileLightboxOpen(false)}>
                <Plus size={32} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                <Swiper
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    initialSlide={activeImage}
                >
                    {productImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="lightbox-img-wrap">
                                <img src={img} alt="Zoomed" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetails;
