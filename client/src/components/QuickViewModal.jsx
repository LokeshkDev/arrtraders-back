import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { X, Star, Heart, ShoppingBag, Truck, ShieldCheck, Minus, Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './QuickViewModal.css';

const QuickViewModal = ({ isOpen, onClose, product }) => {
  const { cart, addToCart, removeFromCart, updateQty } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  
  const productId = product._id || product.id;
  const primaryWeight = product.weight ? `${product.weight}${product.unit === 'gram' ? 'g' : product.unit === 'kg' ? 'kg' : product.unit === 'ml' ? 'ml' : 'L'}` : '';
  const customWeights = product.availableWeights && product.availableWeights.length > 0 
    ? product.availableWeights.map(w => typeof w === 'object' ? w.value : w)
    : [];

  const weights = primaryWeight 
    ? [...new Set([primaryWeight, ...customWeights])] 
    : (customWeights.length > 0 ? customWeights : ['250g', '500g', '1kg']);

  const [selectedWeight, setSelectedWeight] = useState(weights[0]);

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


  return ReactDOM.createPortal(
    <div className="qv-modal-overlay" onClick={onClose}>
      <div className="qv-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="qv-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="qv-modal-content">
          {/* LEFT: IMAGE PANE */}
          <div className="qv-image-pane position-relative">
            <img 
              src={product.img || product.image} 
              alt={product.name} 
              className="qv-product-img"
            />
            <div className="qv-image-badge position-absolute bottom-0 start-0 m-4 px-3 py-1">
               ARTISANAL GRADE
            </div>
          </div>

          {/* RIGHT: DETAILS PANE */}
          <div className="qv-details-pane p-5">
            <div className="qv-header mb-2 text-muted fw-bold tracking-widest fs-9">
              HERITAGE BOUTIQUE • {product.category || 'NUTS'}
            </div>
            
            <h2 className="qv-title font-headline mb-3">{product.name}</h2>
            
            <div className="qv-rating d-flex align-items-center gap-2 mb-4">
               <div className="stars d-flex gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                  ))}
               </div>
               <span className="text-muted fs-8">({product.reviews || '128'} Reviews)</span>
            </div>

            <div className="qv-pricing d-flex align-items-center gap-3 mb-4">
              <span className="qv-current-price font-headline">₹{formattedPrice(currentPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="qv-old-price text-muted text-decoration-line-through fs-5">₹{formattedPrice(currentOriginalPrice)}</span>
                  <span className="badge-discount px-2 py-1 fs-9 fw-bold rounded shadow-sm" style={{ letterSpacing: '0.5px' }}>{discountPercent}% OFF</span>
                </>
              )}
            </div>

            <p className="qv-description lh-lg mb-5">
               {product.summary || "Hand-selected from the sun-drenched valleys, our premium selection is slow-roasted in small batches to preserve natural oils and crunch. A testament to purity and heritage."}
            </p>

            <div className="qv-weight-selector mb-5">
              <h4 className="qv-weight-label mb-3 uppercase">SELECT WEIGHT</h4>
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
                  <button onClick={() => handleUpdateQty(-1)} className="qv-qty-btn"><Minus size={18} /></button>
                  <span className="qv-qty-value">{qty}</span>
                  <button onClick={() => handleUpdateQty(1)} className="qv-qty-btn"><Plus size={18} /></button>
                </div>
              ) : (
                <button className="qv-btn-add flex-grow-1" onClick={handleAddToCart}>
                  <ShoppingBag size={18} /> Add to Collection
                </button>
              )}
              <button 
                className={`qv-btn-wishlist ${inWishlist ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="qv-trust-footer d-flex gap-4 mt-5 pt-4 border-top">
               <div className="d-flex align-items-center gap-2 text-muted fs-9 fw-bold">
                  <Truck size={14} className="text-gold" /> Global Dispatch
               </div>
               <div className="d-flex align-items-center gap-2 text-muted fs-9 fw-bold">
                  <ShieldCheck size={14} className="text-gold" /> Certified Organic
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuickViewModal;
