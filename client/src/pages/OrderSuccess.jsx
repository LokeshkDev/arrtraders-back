import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Calendar, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
