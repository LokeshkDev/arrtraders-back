import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Sparkles, ArrowRight, X } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    const handleMoveToCart = (product) => {
        addToCart(product);
        toggleWishlist(product);
    };

    if (wishlist.length === 0) {
        return (
            <div className="empty-wishlist-hero d-flex flex-column align-items-center justify-content-center text-center px-4">
                <div className="empty-wishlist-icon-wrapper mb-4">
                    <Heart size={64} className="text-secondary opacity-20" />
                    <Sparkles className="sparkle-icon position-absolute text-secondary" size={24} style={{ top: -10, right: -10 }} />
                </div>
                <h2 className="font-headline text-primary mb-3 display-6">Your Favorites Collection</h2>
                <p className="font-body text-muted mb-5 max-w-sm mx-auto">
                    Curate your own selection of artisanal dates and premium nuts. Your saved treasures will appear here.
                </p>
                <Link to="/categories" className="btn-add-luxury px-5 py-3 d-flex align-items-center gap-2">
                    EXPLORE COLLECTIONS <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page-wrapper">
            <div className="container-lg pt-5 pb-7">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5 border-bottom pb-4 border-gold-subtle">
                    <div>
                        <span className="text-secondary text-uppercase font-heading fw-bold small mb-2 d-inline-block tracking-widest">My Selection</span>
                        <h1 className="font-headline text-primary m-0 display-4">Wishlist</h1>
                    </div>
                    <div className="wishlist-status-info font-heading text-muted d-flex align-items-center gap-2 tracking-widest small fw-bold">
                        <span className="badge-count-luxury">
                            {wishlist.length}
                        </span>
                        ITEMS CURATED
                    </div>
                </div>

                <div className="row g-4">
                    {wishlist.map(product => (
                        <div key={product._id} className="col-sm-6 col-lg-4 col-xl-3">
                            <div className="wishlist-art-card h-100 position-relative">
                                {/* Remove button */}
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className="wishlist-abs-remove shadow-sm"
                                    title="Remove from favorites"
                                >
                                    <X size={16} />
                                </button>

                                <div className="wishlist-art-img-box position-relative overflow-hidden rounded-2">
                                    <img
                                        src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`}
                                        className="w-100 h-100 object-fit-cover transition-all hover-jewel"
                                        alt={product.name}
                                    />
                                    {product.isFeatured && (
                                        <span className="badge-luxury-reserve position-absolute top-0 start-0 m-3" style={{ fontSize: '10px' }}>CHOICE PICK</span>
                                    )}
                                </div>

                                <div className="wishlist-art-body p-4 d-flex flex-column">
                                    <small className="font-heading text-secondary text-uppercase tracking-widest mb-2 fw-bold" style={{fontSize: '9px'}}>{product.category}</small>
                                    <h5 className="font-headline text-primary mb-3 text-truncate fs-5">{product.name}</h5>

                                    <div className="mt-auto pt-3 border-top border-gold-subtle d-flex flex-column gap-3">
                                        <div className="d-flex align-items-baseline gap-2">
                                            <span className="font-headline fs-4 text-primary fw-bold">₹{product.price}</span>
                                            {product.originalPrice && (
                                                <span className="text-muted text-decoration-line-through small opacity-50">₹{product.originalPrice}</span>
                                            )}
                                        </div>
                                        
                                        <button
                                            onClick={() => handleMoveToCart(product)}
                                            className="btn-add-luxury w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                                            style={{ padding: '12px' }}
                                        >
                                            <ShoppingCart size={16} />
                                            MOVE TO BASKET
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
