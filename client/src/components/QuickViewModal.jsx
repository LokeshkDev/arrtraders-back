import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Star, Heart, ShoppingBag, Truck, ShieldCheck, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './QuickViewModal.css';

const QuickViewModal = ({ isOpen, onClose, product }) => {
  const { cart, addToCart, removeFromCart, updateQty } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [swiperRef, setSwiperRef] = useState(null);
  
  const productId = product?._id || product?.id;
  const unitMap = { gram: 'g', kg: 'kg', ml: 'ml', litre: 'L', piece: ' pc', cup: ' Cup', box: ' Box', packet: ' Packet', bottle: ' Bottle' };
  const primaryWeight = product?.weight ? `${product.weight}${unitMap[product.unit] || product.unit || 'g'}` : '';
  const customWeights = product?.availableWeights && product.availableWeights.length > 0 
    ? product.availableWeights.map(w => typeof w === 'object' ? w.value : w)
    : [];

  const weights = primaryWeight 
    ? [...new Set([primaryWeight, ...customWeights])] 
    : (customWeights.length > 0 ? customWeights : ['250g', '500g', '1kg']);

  const [selectedWeight, setSelectedWeight] = useState(weights[0]);

  const productImages = (() => {
    if (product?.images && product.images.length > 0) return product.images;
    if (product?.img) return [product.img];
    if (product?.image) return [product.image];
    return ["/images/reference/product-thumb-1.png"];
  })();

  // Update swiper when weight changes
  useEffect(() => {
    if (!product || !selectedWeight || !swiperRef) return;
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    if (variant && typeof variant === 'object' && variant.image) {
      const imgIndex = productImages.findIndex(img => img === variant.image);
      if (imgIndex !== -1) {
        swiperRef.slideTo(imgIndex);
      }
    }
  }, [selectedWeight, product, productImages, swiperRef]);

  const cartItem = cart?.find(item => 
    (item._id === productId || item.id === productId) && 
    item.weight === selectedWeight
  );
  const qty = cartItem ? cartItem.qty : 0;

  const currentPrice = (() => {
    if (selectedWeight === primaryWeight) return product.price;
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    return variant && typeof variant === 'object' && variant.price ? variant.price : product.price;
  })();

  const numBasePrice = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  const numBaseOrig = parseFloat(String(product.originalPrice || "0").replace(/[^0-9.]/g, '')) || 0;
  const baseRatio = (numBaseOrig > numBasePrice && numBasePrice > 0) ? (numBaseOrig / numBasePrice) : 1;

  const currentOriginalPrice = (() => {
    if (selectedWeight === primaryWeight) return product.originalPrice;
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    if (variant && typeof variant === 'object') {
        if (variant.originalPrice) return variant.originalPrice;
        if (variant.price) return variant.price * baseRatio;
    }
    return product.originalPrice;
  })();

  if (!isOpen || !product) return null;

  const inWishlist = isInWishlist(productId);

  const handleAddToCart = () => {
    const numericPrice = typeof currentPrice === 'string' 
      ? parseFloat(currentPrice.replace(/[^0-9.]/g, '')) 
      : currentPrice;
    addToCart({ ...product, price: numericPrice, weight: selectedWeight }, 1);
  };

  const handleUpdateQty = (delta) => {
    if (qty + delta <= 0) {
      removeFromCart(productId, selectedWeight);
    } else {
      updateQty(productId, selectedWeight, delta);
    }
  };

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


  const currentImage = (() => {
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    if (variant && typeof variant === 'object' && variant.image) return variant.image;
    return product.img || product.image;
  })();

  return ReactDOM.createPortal(
    <div className="qv-modal-overlay" onClick={onClose}>
      <div className="qv-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="qv-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="qv-modal-content">
          {/* LEFT: IMAGE PANE with Carousel */}
          <div className="qv-image-pane position-relative">
            <Swiper
              onSwiper={setSwiperRef}
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: '.qv-next',
                prevEl: '.qv-prev',
              }}
              pagination={{ clickable: true }}
              className="qv-swiper h-100 w-100"
            >
              {productImages.map((img, idx) => (
                <SwiperSlide key={idx} className="h-100 w-100">
                  <img 
                    src={img} 
                    alt={`${product.name} ${idx + 1}`} 
                    className="qv-product-img"
                  />
                </SwiperSlide>
              ))}
              
              {productImages.length > 1 && (
                <>
                  <button className="qv-nav-btn qv-prev position-absolute top-50 start-0 translate-middle-y z-3 ms-2">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="qv-nav-btn qv-next position-absolute top-50 end-0 translate-middle-y z-3 me-2">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </Swiper>

            <div className="qv-image-badge position-absolute bottom-0 start-0 m-3 px-3 py-1 z-2">
               ARTISANAL GRADE
            </div>
          </div>

          {/* RIGHT: DETAILS PANE */}
          <div className="qv-details-pane p-4">
            <h2 className="qv-title font-headline mb-2">{product.name}</h2>
            
            <div className="qv-rating d-flex align-items-center gap-2 mb-3">
               <div className="stars d-flex gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(product.rating || 4) ? "currentColor" : "none"} />
                  ))}
               </div>
               <span className="text-muted fs-8">({product.reviews || '128'} Reviews)</span>
            </div>

            <div className="qv-pricing d-flex align-items-center gap-3 mb-4">
              <span className="qv-current-price font-headline">₹{formattedPrice(currentPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="qv-old-price text-muted text-decoration-line-through fs-5">₹{formattedPrice(currentOriginalPrice)}</span>
                  <span className="badge-discount px-2 py-1 fs-9 fw-bold rounded shadow-sm">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            <div className="qv-weight-selector mb-4">
              <h4 className="qv-weight-label mb-2 uppercase fs-9 fw-bold text-muted">SELECT WEIGHT</h4>
              <div className="d-flex gap-2">
                {weights.map(w => (
                  <button 
                    key={w}
                    className={`qv-weight-pill ${selectedWeight === w ? 'active' : ''}`}
                    onClick={() => setSelectedWeight(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="qv-actions d-flex gap-3 pt-3">
              {qty > 0 ? (
                <div className="qv-refined-qty-control d-flex align-items-center">
                  <button onClick={() => handleUpdateQty(-1)} className="qv-qty-btn"><Minus size={14} /></button>
                  <span className="qv-qty-value">{qty}</span>
                  <button onClick={() => handleUpdateQty(1)} className="qv-qty-btn"><Plus size={14} /></button>
                </div>
              ) : (
                <button className="qv-btn-add flex-grow-1" onClick={handleAddToCart}>
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              )}
              <button 
                className={`qv-btn-wishlist ${inWishlist ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuickViewModal;
