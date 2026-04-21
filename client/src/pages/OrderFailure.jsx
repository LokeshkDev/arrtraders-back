import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import './OrderFailure.css';

const OrderFailure = () => {
    return (
        <div className="order-failure-page min-vh-100 d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 text-center">
                        <div className="failure-card-luxury p-5">
                            <div className="failure-icon-wrap mb-4">
                                <AlertCircle size={60} className="text-danger" />
                            </div>
                            
                            <h2 className="font-headline text-primary mb-3">Order Unsuccessful</h2>
                            <p className="font-body text-muted mb-5">
                                We couldn't process your order at this time. This could be due to a payment timeout or a connection issue.
                            </p>

                            <div className="action-stack-luxury d-flex flex-column gap-3">
                                <Link to="/checkout" className="btn-add-luxury py-3 w-100 d-flex align-items-center justify-content-center gap-2">
                                    <RefreshCw size={18} /> TRY AGAIN
                                </Link>
                                <Link to="/contact" className="btn-secondary-luxury py-3 w-100 d-flex align-items-center justify-content-center gap-2">
                                    <MessageCircle size={18} /> CONTACT SUPPORT
                                </Link>
                                <Link to="/cart" className="back-link-luxury mt-3 d-flex align-items-center justify-content-center gap-2 font-heading small fw-bold tracking-widest text-muted text-decoration-none">
                                    <ArrowLeft size={16} /> RETURN TO CART
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderFailure;
