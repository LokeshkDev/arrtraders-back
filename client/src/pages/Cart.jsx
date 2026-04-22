import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ShieldCheck, CreditCard, Truck, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQty, getCartTotal } = useContext(CartContext);
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);

    const deliveryCharge = 50;
    const subtotal = getCartTotal();
    const total = subtotal + (subtotal > 0 ? deliveryCharge : 0);

    // Hide global floating cart bar on this page
    useEffect(() => {
        const floatingBar = document.querySelector('.floating-cart-bar-wrapper');
        if (floatingBar) floatingBar.style.display = 'none';
        return () => {
            if (floatingBar) floatingBar.style.display = 'block';
        };
    }, []);

    if (cart.length === 0) {
        return (
            <div className="empty-cart-hero d-flex flex-column align-items-center justify-content-center text-center px-4">
                <div className="empty-cart-icon-box mb-4">
                    <ShoppingBag size={80} className="text-secondary opacity-20" />
                </div>
                <h2 className="font-headline text-primary mb-3 display-6">Your Basket is Empty</h2>
                <p className="font-body text-muted mb-5 max-w-sm mx-auto">
                    Explore our artisanal collections and discover something extraordinary for your table.
                </p>
                <Link to="/categories" className="btn-add-luxury px-5 py-3">
                    START SHOPPING
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page-wrapper min-vh-100">
            <div className="container-lg pt-5 pb-7">
                <div className="mb-5 d-flex align-items-center gap-2">
                    <Link to="/categories" className="cart-back-link d-flex align-items-center gap-2 font-heading small fw-bold tracking-widest">
                        <ArrowLeft size={16} /> BACK TO SHOP
                    </Link>
                </div>

                <div className="row g-5">
                    {/* Cart Items List */}
                    <div className="col-lg-8">
                        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-4 border-gold-subtle">
                            <h1 className="font-headline text-primary m-0">Shopping Cart</h1>
                            <span className="font-label text-muted small uppercase tracking-widest">{cart.length} ITEMS</span>
                        </div>

                        <div className="cart-items-stack d-flex flex-column gap-4">
                            {cart.map((item, idx) => (
                                <div key={`${item._id}-${item.weight || idx}`} className="cart-item-row d-flex gap-4">
                                    <div className="cart-item-img-container rounded-2 overflow-hidden shadow-sm">
                                        <img src={item.img || item.image} alt={item.name} className="w-100 h-100 object-fit-cover" />
                                    </div>

                                    <div className="flex-grow-1 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <h5 className="font-headline text-primary m-0 fw-bold fs-4">{item.name}</h5>
                                            <button
                                                onClick={() => removeFromCart(item._id, item.weight)}
                                                className="cart-remove-btn"
                                                title="Remove item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="sku-tag font-label text-secondary mb-3 small tracking-widest uppercase fw-bold">{item.weight || 'Standard'}</div>

                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                            <div className="pd-qty-stepper d-flex align-items-center">
                                                <button onClick={() => updateQty(item._id, item.weight, -1)} className="stepper-btn"><Minus size={16} /></button>
                                                <span className="stepper-val">{item.qty}</span>
                                                <button onClick={() => updateQty(item._id, item.weight, 1)} className="stepper-btn"><Plus size={16} /></button>
                                            </div>
                                            <div className="item-price-column text-end">
                                                <span className="font-headline fs-4 fw-bold text-primary">₹{item.price * item.qty}</span>
                                                {item.qty > 1 && <div className="text-muted extra-small font-body">₹{item.price} / each</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details Sidebar */}
                    <div className="col-lg-4">
                        <div className="summary-card-luxury position-sticky" style={{ top: '120px' }}>
                            <h4 className="font-headline text-primary mb-4 text-center border-bottom pb-3 border-gold-subtle">Order Summary</h4>

                            <div className={`summary-details-stack d-flex flex-column gap-3 mb-4 ${showDetails ? 'show-on-mobile' : 'hide-on-mobile'}`}>
                                <div className="d-flex justify-content-between font-body text-primary">
                                    <span>Subtotal</span>
                                    <span className="fw-bold">₹{subtotal}</span>
                                </div>
                                <div className="d-flex justify-content-between font-body text-primary">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>Shipping</span>
                                        <Truck size={14} className="text-secondary" />
                                    </div>
                                    <span className={subtotal > 1999 ? "fw-bold text-success" : "fw-bold text-secondary"}>
                                        {subtotal > 1999 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                {subtotal > 0 && subtotal <= 1999 && (
                                    <div className="free-shipping-promo p-3 rounded-3 small">
                                        Add ₹{1999 - subtotal} more for <span className="text-secondary fw-bold">Free Shipping</span>.
                                    </div>
                                )}
                            </div>

                            <div 
                                className="border-top pt-4 d-flex justify-content-between align-items-center mb-5 border-gold-subtle summary-total-clickable"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <span className="font-headline fs-5 text-secondary">Total Amount</span>
                                    <div className="mobile-only-chevron text-secondary">
                                        {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                                <span className="font-headline fs-2 text-secondary fw-bold">₹{subtotal > 1999 ? subtotal : total}</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn-add-luxury w-100 d-flex align-items-center justify-content-center gap-2"
                            >
                                <CreditCard size={18} />
                                PROCEED TO CHECKOUT
                            </button>

                            <div className="mt-5 pt-4 text-center">
                                <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mb-3">
                                    <ShieldCheck size={16} className="text-secondary" />
                                    <span className="font-heading fw-bold tracking-widest fs-10">SECURE CHECKOUT</span>
                                </div>
                                <div className="payment-support-icons d-flex justify-content-center gap-3 opacity-40">
                                    <img src="/images/reference/payment-visa.png" alt="Visa" height="18" />
                                    <img src="/images/reference/payment-mastercard.png" alt="Mastercard" height="18" />
                                    <img src="/images/reference/payment-paypal.png" alt="Paypal" height="18" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
