import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, CreditCard, Package, ShieldCheck, Truck, ChevronRight, Phone, Home, Briefcase, Plus, CheckCircle2, ArrowLeft, Ticket, X, Loader2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useContext(CartContext);

    const [step, setStep] = useState(1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const orderPlacedRef = useRef(false);

    // CMS-driven shipping settings
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(1999);
    const [deliveryChargeAmount, setDeliveryChargeAmount] = useState(50);
    const [cmsPromos, setCmsPromos] = useState([]);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null); // { code, discount, message }
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const [newAddress, setNewAddress] = useState({
        label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
    });

    const subtotal = getCartTotal();
    const deliveryCharge = subtotal > freeShippingThreshold ? 0 : deliveryChargeAmount;
    const discount = couponApplied ? couponApplied.discount : 0;
    const total = subtotal + deliveryCharge - discount;

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/checkout');
        } else {
            fetchAddresses();
        }
        if (cart.length === 0 && !orderPlacedRef.current) {
            navigate('/cart');
        }
    }, [navigate, userInfo, cart.length]);

    // Fetch CMS settings for dynamic shipping and promos
    useEffect(() => {
        const fetchShippingSettings = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
                if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(data.freeShippingThreshold);
                if (data.deliveryCharge !== undefined) setDeliveryChargeAmount(data.deliveryCharge);
                if (data.promos) setCmsPromos(data.promos.filter(p => p.code)); // Only show ones with codes
            } catch (e) { console.error('Failed to fetch shipping settings'); }
        };
        fetchShippingSettings();
    }, []);

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`);
            setAddresses(data.addresses || []);
            const defaultAddr = data.addresses?.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddress(defaultAddr);
            else if (data.addresses?.length > 0) setSelectedAddress(data.addresses[0]);
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/address`, newAddress);
            setAddresses(data);
            setSelectedAddress(data[data.length - 1]);
            setShowNewAddressForm(false);
        } catch (error) {
            console.error(error);
            alert('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    // Coupon handlers
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        setCouponApplied(null);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/validate`, {
                code: couponCode.trim(),
                cartTotal: subtotal
            });
            setCouponApplied({ code: data.code, discount: data.discount, message: data.message });
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(null);
        setCouponCode('');
        setCouponError('');
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) return alert('Please select a delivery address');

        try {
            setLoading(true);

            const orderItems = cart.map(item => ({
                name: item.name || 'Unknown Product',
                qty: item.qty || 1,
                image: item.image || item.img || 'https://via.placeholder.com/150',
                price: item.price || 0,
                variant: item.weight || 'Standard',
                product: item._id
            }));

            const orderData = {
                orderItems,
                shippingAddress: selectedAddress,
                paymentMethod,
                itemsPrice: subtotal,
                deliveryPrice: deliveryCharge,
                discountAmount: discount,
                totalPrice: total,
                couponCode: couponApplied?.code || null
            };

            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData);
            orderPlacedRef.current = true;
            clearCart();
            navigate(`/order-success/${data._id}`);
        } catch (error) {
            console.error('Order Error:', error);
            navigate('/order-failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-app min-vh-100">
            <div className="container-lg py-5">
                {/* Modern Step Indicator - Arabic Luxury Style */}
                <div className="checkout-nav-stepper mb-5 d-flex justify-content-center">
                    <div className="stepper-track d-flex align-items-center gap-2 gap-md-4">
                        <div className={`stepper-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="node-circle">{step > 1 ? <CheckCircle2 size={18} /> : <MapPin size={18} />}</div>
                            <span className="node-label">Shipping</span>
                        </div>
                        <div className={`stepper-connector ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`stepper-node ${step >= 2 ? 'active' : ''}`}>
                            <div className="node-circle"><CreditCard size={18} /></div>
                            <span className="node-label">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="row g-5">
                    <div className="col-lg-8">
                        {step === 1 && (
                            <div className="animated slideInUp">
                                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-4 border-gold-subtle">
                                    <h2 className="font-headline text-primary m-0">Delivery Address</h2>
                                    <button
                                        onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                                        className="btn-add-address-luxury"
                                    >
                                        {showNewAddressForm ? 'Cancel' : '+ Add Address'}
                                    </button>
                                </div>

                                {showNewAddressForm ? (
                                    <div className="addr-form-card bg-white p-5 rounded-4 shadow-sm border border-gold-subtle">
                                        <h5 className="font-headline text-primary mb-4 border-bottom pb-3 border-gold-subtle">New Address Details</h5>
                                        <form onSubmit={handleSaveAddress} className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">ADDRESS TYPE</label>
                                                <select className="form-select luxury-input" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}>
                                                    <option value="Home">Home</option>
                                                    <option value="Office">Office</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">RECIPIENT NAME</label>
                                                <input type="text" className="form-control luxury-input" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required placeholder="Full Name" />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">STREET ADDRESS</label>
                                                <input type="text" className="form-control luxury-input" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} required placeholder="House No, Street, Area" />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">CITY</label>
                                                <input type="text" className="form-control luxury-input" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">STATE</label>
                                                <input type="text" className="form-control luxury-input" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">PINCODE</label>
                                                <input type="text" className="form-control luxury-input" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">PHONE NUMBER</label>
                                                <input type="tel" className="form-control luxury-input" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required placeholder="For delivery contact" />
                                            </div>
                                            <div className="col-12 mt-4 pt-3 border-top border-gold-subtle">
                                                <button type="submit" disabled={loading} className="btn-add-luxury px-5 py-3 w-100">
                                                    {loading ? 'SAVING...' : 'SAVE ADDRESS'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {addresses.length === 0 ? (
                                            <div className="col-12">
                                                <div className="text-center py-5 bg-white rounded-4 border border-gold-subtle border-dashed">
                                                    <MapPin size={48} className="text-secondary opacity-25 mb-3" />
                                                    <p className="text-muted font-body">No saved addresses found. Please add a new one.</p>
                                                    <button onClick={() => setShowNewAddressForm(true)} className="btn-add-luxury py-2 px-4">ADD FIRST ADDRESS</button>
                                                </div>
                                            </div>
                                        ) : (
                                            addresses.map((addr, idx) => (
                                                <div key={idx} className="col-md-6">
                                                    <div
                                                        className={`check-addr-card luxury-card h-100 p-4 transition-all pointer ${selectedAddress?._id === addr._id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedAddress(addr)}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                {addr.label === 'Home' ? <Home size={14} className="text-secondary" /> : <Briefcase size={14} className="text-secondary" />}
                                                                <span className="font-heading extra-small fw-bold tracking-widest text-secondary">{addr.label}</span>
                                                            </div>
                                                            {selectedAddress?._id === addr._id && <div className="addr-check-ring"><CheckCircle2 size={20} className="text-primary" /></div>}
                                                        </div>
                                                        <h6 className="font-headline text-primary mb-2 fw-bold">{addr.name}</h6>
                                                        <p className="font-body small text-muted mb-1">{addr.line1}</p>
                                                        <p className="font-body small text-muted mb-3">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                        <div className="d-flex align-items-center gap-2 text-primary font-heading small fw-bold">
                                                            <Phone size={12} className="text-secondary" /> {addr.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div className="col-12 mt-5">
                                            <button
                                                className="btn-add-luxury w-100"
                                                disabled={!selectedAddress}
                                                onClick={() => setStep(2)}
                                            >
                                                CONTINUE TO PAYMENT <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animated fadeIn">
                                <h2 className="font-headline text-primary mb-4 border-bottom pb-3 border-gold-subtle">Payment Selection</h2>
                                <div className="d-flex flex-column gap-3 mb-5">
                                    <div
                                        className={`check-pay-card luxury-card p-4 d-flex align-items-center gap-4 pointer transition-all ${paymentMethod === 'COD' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('COD')}
                                    >
                                        <div className={`premium-radio-input ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                            <div className="pay-check-inner"></div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold font-headline text-primary fs-5">Cash on Delivery</div>
                                            <div className="small text-muted font-body">Pay when you receive your order.</div>
                                        </div>
                                        <Truck size={32} className="text-secondary opacity-25" />
                                    </div>

                                    <div className="check-pay-card disabled-luxury p-4 d-flex align-items-center gap-4">
                                        <div className="flex-shrink-0 opacity-40">
                                            <ShieldCheck size={20} className="text-muted" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold font-headline text-muted fs-5">Online Transfer</div>
                                            <div className="extra-small text-secondary font-heading tracking-widest fw-bold mt-1 uppercase">Coming Soon</div>
                                        </div>
                                        <CreditCard size={32} className="text-muted opacity-40" />
                                    </div>
                                </div>
                                <div className="d-flex flex-column flex-md-row gap-3">
                                    <button className="cart-back-link font-heading fw-bold tracking-widest border-0 bg-transparent" onClick={() => setStep(1)}><ArrowLeft size={16} /> PREVIOUS</button>
                                    <button 
                                        className="btn-add-luxury flex-grow-1" 
                                        disabled={loading}
                                        onClick={handlePlaceOrder}
                                    >
                                        {loading ? 'PLACING ORDER...' : (paymentMethod === 'COD' ? 'PLACE ORDER' : 'PROCEED TO PAY')}
                                    </button>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Premium Order Summary */}
                    <div className="col-lg-4">
                        <div className="summary-card-luxury position-sticky" style={{ top: '120px' }}>
                            <h4 className="font-headline text-primary mb-4 border-bottom pb-3 border-gold-subtle">Order Summary</h4>

                            <div className="check-items-scroll custom-scrollbar mb-4" style={{ maxHeight: '350px' }}>
                                {cart.map((item, idx) => (
                                    <div key={idx} className="summary-item-row">
                                        <div className="position-relative flex-shrink-0" style={{ width: '65px', height: '65px' }}>
                                            <img src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} className="w-100 h-100 object-fit-cover rounded-2" alt="" />
                                            <span className="summary-qty-bubble">{item.qty}</span>
                                        </div>
                                        <div className="flex-grow-1 min-w-0">
                                            <p className="small fw-bold text-primary m-0 text-truncate font-headline">{item.name}</p>
                                            <p className="extra-small text-secondary m-0 font-heading tracking-widest fw-bold uppercase">{item.weight || 'Standard'}</p>
                                        </div>
                                        <span className="summary-item-price">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-details-stack d-flex flex-column gap-3 pt-2">
                                <div className="d-flex justify-content-between font-body text-primary">
                                    <span>Subtotal</span>
                                    <span className="fw-bold">₹{subtotal.toLocaleString()}</span>
                                </div>

                                {/* Coupon Section */}
                                <div className="coupon-section mt-2 pb-3 border-bottom border-gold-subtle">
                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase tracking-widest font-heading">Apply Coupon</label>
                                    {!couponApplied ? (
                                        <div className="d-flex gap-2">
                                            <div className="position-relative flex-grow-1">
                                                <Ticket className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-50" size={16} />
                                                <input 
                                                    type="text" 
                                                    className="form-control rounded-pill ps-5 py-2 extra-small font-label border-gold-subtle shadow-none" 
                                                    placeholder="Enter code..." 
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                />
                                            </div>
                                            <button 
                                                id="apply-coupon-btn"
                                                className="btn btn-primary rounded-pill px-4 py-2 extra-small fw-bold border-0 shadow-sm transition-all"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode}
                                            >
                                                {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'APPLY'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="applied-coupon-pill d-flex align-items-center justify-content-between bg-success bg-opacity-10 border border-success border-opacity-20 rounded-pill px-3 py-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <CheckCircle2 size={16} className="text-success" />
                                                <span className="extra-small fw-bold text-success font-headline">{couponApplied.code} Applied!</span>
                                            </div>
                                            <button className="btn btn-link text-danger p-0 border-0 shadow-none d-flex align-items-center" onClick={handleRemoveCoupon}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    {couponError && <p className="text-danger extra-small fw-bold mt-2 mb-0 font-label">{couponError}</p>}
                                    {couponApplied?.message && <p className="text-success extra-small fw-bold mt-2 mb-0 font-label">{couponApplied.message}</p>}

                                    {/* Available CMS Promos */}
                                    {cmsPromos.length > 0 && !couponApplied && (
                                        <div className="mt-3">
                                            <p className="extra-small text-muted fw-bold mb-2 uppercase font-heading opacity-75">Available Offers:</p>
                                            <div className="d-flex flex-wrap gap-2">
                                                {cmsPromos.map((p, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="available-promo-tag"
                                                        onClick={() => {
                                                            setCouponCode(p.code);
                                                            // Auto apply
                                                            setTimeout(() => {
                                                                const btn = document.getElementById('apply-coupon-btn');
                                                                if (btn) btn.click();
                                                            }, 100);
                                                        }}
                                                    >
                                                        <Ticket size={12} />
                                                        <span>{p.code}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between font-body text-primary">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>Shipping & Handling</span>
                                        <Truck size={14} className="text-secondary" />
                                    </div>
                                    <span className={subtotal > freeShippingThreshold ? "fw-bold text-success" : "fw-bold text-secondary"}>
                                        {subtotal > freeShippingThreshold ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="d-flex justify-content-between font-body text-success fw-bold animate-fade-in">
                                        <span>Coupon Discount</span>
                                        <span>- ₹{discount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center pt-4 border-top border-gold-subtle mt-2">
                                    <span className="font-headline fs-5 text-primary">Grand Total</span>
                                    <span className="font-headline fs-2 text-secondary fw-bold">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-5 text-center">
                                <div className="d-flex align-items-center justify-content-center gap-2 text-muted extra-small font-heading tracking-widest uppercase mb-3">
                                    <ShieldCheck size={16} className="text-secondary" /> SECURE TRANSACTION
                                </div>
                                <div className="payment-support-icons d-flex justify-content-center gap-3 opacity-40">
                                    <img src="/images/reference/payment-visa.png" alt="Visa" height="15" />
                                    <img src="/images/reference/payment-mastercard.png" alt="Mastercard" height="15" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
