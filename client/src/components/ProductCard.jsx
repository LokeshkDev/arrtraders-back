import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, Minus, Plus, Star, ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import QuickViewModal from './QuickViewModal';
import './ProductCard.css';

const createSlug = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

const ProductCard = ({ 
  product, 
  showBestSellerBadge = false, 
  showFeaturedBadge = false 
}) => {
  const { cart, addToCart, removeFromCart, updateQty } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const productId = product._id || product.id;
  const productSlug = product.slug || createSlug(product.name);
  const categorySlug = createSlug(product.category || 'all');
  const path = `/${categorySlug}/${productSlug}`;
  const primaryWeight = product.weight ? `${product.weight}${product.unit === 'gram' ? 'g' : product.unit === 'kg' ? 'kg' : product.unit === 'ml' ? 'ml' : 'L'}` : (product.qty || "500g");
  const weights = product.availableWeights && product.availableWeights.length > 0 
    ? [primaryWeight, ...product.availableWeights.map(w => typeof w === 'object' ? w.value : w)]
    : [primaryWeight];
  
  const uniqueWeights = [...new Set(weights.filter(Boolean))];
  const [selectedWeight, setSelectedWeight] = useState(uniqueWeights[0]);

  const cartItem = cart?.find(item => 
    (item._id === productId || item.id === productId) && 
    item.weight === selectedWeight
  );
  const qty = cartItem ? cartItem.qty : 0;
  const inWishlist = isInWishlist(productId);

  const currentPrice = (() => {
    if (selectedWeight === primaryWeight) return product.price;
    const variant = product.availableWeights?.find(v => (typeof v === 'object' ? v.value : v) === selectedWeight);
    return variant && typeof variant === 'object' ? variant.price : product.price;
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const numericPrice = typeof currentPrice === 'string' 
      ? parseFloat(currentPrice.replace(/[^0-9.]/g, '')) 
      : currentPrice;
    
    addToCart({ ...product, price: numericPrice, weight: selectedWeight }, 1);
  };

  const handleUpdateQty = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty + delta <= 0) {
      removeFromCart(productId, selectedWeight);
    } else {
      updateQty(productId, selectedWeight, delta);
    }
  };

  const formattedPrice = typeof currentPrice === 'number' 
    ? currentPrice.toFixed(2) 
    : parseFloat(String(currentPrice).replace(/[^0-9.]/g, '') || "0").toFixed(2);

  const numericOriginalPrice = typeof currentOriginalPrice === 'number'
    ? currentOriginalPrice
    : parseFloat(String(currentOriginalPrice || "0").replace(/[^0-9.]/g, ''));
  const hasDiscount = numericOriginalPrice > parseFloat(formattedPrice);
  const formattedOriginalPrice = numericOriginalPrice.toFixed(2);
  const discountPercent = hasDiscount ? Math.round(((numericOriginalPrice - parseFloat(formattedPrice)) / numericOriginalPrice) * 100) : 0;

  return (
    <div className="universal-product-card d-flex flex-column">
      <div className="card-image-container">
        <Link to={path} className="d-block overflow-hidden">
          <img 
            src={product.img || product.image || "/images/reference/product-thumb-1.png"} 
            alt={product.name} 
            className="w-100 h-100 object-fit-cover transition-all" 
            loading="lazy"
          />
        </Link>

        <div className="product-card-badges position-absolute top-0 start-0 m-3 d-flex flex-column gap-2 z-1">
            {showBestSellerBadge && product.isBestSeller && (
                <span className="badge-best-seller px-3 py-1 fw-bold rounded-1">
                    BEST SELLER
                </span>
            )}
            {showFeaturedBadge && product.isFeatured && (
                <span className="badge-featured px-3 py-1 fw-bold rounded-1">
                    FEATURED
                </span>
            )}
            {product.badge && (
                <span className="product-card-badge px-3 py-1 fw-bold rounded-1">
                    {product.badge}
                </span>
            )}
            {hasDiscount && (
                <span className="badge-discount px-3 py-1 fw-bold rounded-1">
                    {discountPercent}% OFF
                </span>
            )}
        </div>

        <div className="card-action-overlay position-absolute top-50 start-50 translate-middle d-flex gap-3">
           <button 
             className={`icon-circle-btn ${inWishlist ? 'active' : ''}`}
             onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
           >
             <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
           </button>
           <button 
             className="icon-circle-btn"
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
           >
             <Eye size={20} />
           </button>
        </div>
      </div>

      <div className="card-info-container flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link to={path} className="text-decoration-none flex-grow-1">
            <h3 className="product-card-title fw-bold mb-0">{product.name}</h3>
          </Link>
          <div className="d-flex align-items-center gap-1 ps-2">
             <Star size={14} fill="var(--secondary)" className="text-secondary" />
             <span className="fs-8 fw-bold text-primary">{product.rating || "4.5"}</span>
          </div>
        </div>
        
        {uniqueWeights.length > 1 ? (
            <div className="d-flex flex-wrap gap-2 mb-4" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                {uniqueWeights.map(w => (
                    <button
                        key={w}
                        className={`weight-pill ${selectedWeight === w ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedWeight(w); }}
                    >
                        {w}
                    </button>
                ))}
            </div>
        ) : (
            <p className="text-muted fs-8 mb-4 font-body">
              {selectedWeight}
            </p>
        )}
        
        <div className="mt-auto d-flex align-items-end justify-content-between">
          <div className="product-card-pricing">
             {hasDiscount && <span className="original-price">₹{formattedOriginalPrice}</span>}
             <div className="current-price">₹{formattedPrice}</div>
          </div>

          <div className="purchase-action">
            {qty > 0 ? (
              <div className="persistent-qty-pill d-flex align-items-center">
                 <button onClick={(e) => handleUpdateQty(e, -1)} className="qty-btn"><Minus size={14} /></button>
                 <span className="qty-value">{qty}</span>
                 <button onClick={(e) => handleUpdateQty(e, 1)} className="qty-btn"><Plus size={14} /></button>
              </div>
            ) : (
              <button 
                className="btn-add-action"
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <ShoppingCart size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProductCard;
