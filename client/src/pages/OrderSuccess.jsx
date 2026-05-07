import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Package, Calendar, ArrowRight, Home, ShoppingBag, Loader2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './OrderSuccess.css';
import { API_BASE_URL } from '../config/api';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useContext(CartContext);
    const [verifying, setVerifying] = useState(!!searchParams.get('cashfree_order_id'));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const verifyPayment = async () => {
            const cashfreeOrderId = searchParams.get('cashfree_order_id');
            if (!cashfreeOrderId) return;

            try {
                const { data } = await axios.post(`${API_BASE_URL}/api/orders/${id}/verify-payment`, {
                    cashfreeOrderId
                });

                if (!data.paid) {
                    navigate('/order-failure', { replace: true });
                    return;
                }

                clearCart();
            } catch (error) {
                console.error('Payment verification failed:', error);
                navigate('/order-failure', { replace: true });
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [clearCart, id, navigate, searchParams]);

    if (verifying) {
        return (
            <div className="order-success-page min-vh-100 d-flex align-items-center py-5">
                <div className="container text-center">
                    <Loader2 size={48} className="text-secondary animate-spin mb-4" />
                    <h2 className="font-headline text-primary mb-2">Verifying Payment</h2>
                    <p className="font-body text-muted mb-0">Please wait while we confirm your payment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-success-page min-vh-100 d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 text-center">
                        <div className="success-card-luxury p-5">
                            <div className="success-icon-wrap mb-4">
                                <CheckCircle2 size={80} className="text-secondary" />
                            </div>
                            
                            <h1 className="font-headline text-primary mb-3">Order Confirmed</h1>
                            <p className="font-body text-muted mb-5">
                                Your order has been placed successfully. We are preparing your artisanal selection for delivery.
                            </p>

                            <div className="order-meta-luxury bg-surface p-4 rounded-3 mb-5 border border-gold-subtle">
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-gold-subtle">
                                    <span className="font-heading extra-small fw-bold text-secondary tracking-widest uppercase">Order Number</span>
                                    <span className="font-headline text-primary fw-bold">#{id?.slice(-8).toUpperCase() || 'RAHMAN-77'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={16} className="text-secondary" />
                                        <span className="font-heading extra-small fw-bold text-secondary tracking-widest uppercase">Est. Delivery</span>
                                    </div>
                                    <span className="font-body text-primary fw-bold">3-5 Business Days</span>
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                <Link to="/profile?tab=orders" className="btn-add-luxury py-3 w-100 d-flex align-items-center justify-content-center gap-2">
                                    <Package size={18} /> TRACK YOUR ORDER <ArrowRight size={16} />
                                </Link>
                                <div className="d-flex gap-3">
                                    <Link to="/" className="btn-secondary-luxury py-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                                        <Home size={18} /> HOME
                                    </Link>
                                    <Link to="/categories" className="btn-secondary-luxury py-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                                        <ShoppingBag size={18} /> SHOP MORE
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 opacity-50">
                            <p className="extra-small font-heading tracking-widest text-primary fw-bold">AR RAHMAN • AUTHENTIC ARABIC LUXURY</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
