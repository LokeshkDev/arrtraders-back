import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, CreditCard, Package, ShieldCheck, Truck, ChevronRight, Phone, Home, Briefcase, Plus, CheckCircle2, ArrowLeft } from 'lucide-react';
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

    const [newAddress, setNewAddress] = useState({
        label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
    });

    const deliveryCharge = 50;
    const subtotal = getCartTotal();
    const total = subtotal + (subtotal > 1999 ? 0 : deliveryCharge);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/checkout');
        } else {
            fetchAddresses();
        }
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [navigate, userInfo, cart.length]);

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
                deliveryPrice: subtotal > 1999 ? 0 : deliveryCharge,
                discountAmount: 0,
                totalPrice: total
            };

            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData);
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
                        <div className={`stepper-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="node-circle">{step > 2 ? <CheckCircle2 size={18} /> : <CreditCard size={18} />}</div>
                            <span className="node-label">Payment</span>
                        </div>
                        <div className={`stepper-connector ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`stepper-node ${step >= 3 ? 'active' : ''}`}>
                            <div className="node-circle"><Package size={18} /></div>
                            <span className="node-label">Confirm</span>
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
                                    <button className="btn-add-luxury flex-grow-1" onClick={() => setStep(3)}>REVIEW ORDER</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animated fadeIn">
                                <h2 className="font-headline text-primary mb-4 border-bottom pb-4 border-gold-subtle">Review Order</h2>
                                <div className="luxury-card p-5 mb-4 mb-lg-5">
                                    <div className="row g-4">
                                        <div className="col-md-6 border-end-gold">
                                            <label className="font-heading extra-small fw-bold text-secondary uppercase tracking-widest mb-3 d-block">DELIVERY ADDRESS</label>
                                            <p className="fw-bold font-headline text-primary mb-1 fs-5">{selectedAddress.name}</p>
                                            <p className="small text-muted font-body m-0">{selectedAddress.line1}</p>
                                            <p className="small text-muted font-body m-0">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                                        </div>
                                        <div className="col-md-6 ps-md-4">
                                            <label className="font-heading extra-small fw-bold text-secondary uppercase tracking-widest mb-3 d-block">PAYMENT METHOD</label>
                                            <p className="fw-bold font-headline text-primary m-0 fs-5">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                            <p className="small text-muted font-body mt-1">Secure and fast checkout</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn-add-luxury w-100 py-3 fs-5"
                                    disabled={loading}
                                    onClick={handlePlaceOrder}
                                >
                                    {loading ? 'PLACING ORDER...' : 'CONFIRM ORDER'}
                                </button>
                                <button className="btn btn-link text-muted w-100 mt-4 text-decoration-none font-heading extra-small tracking-widest fw-bold" onClick={() => setStep(2)}>CHANGE PAYMENT</button>
                            </div>
                        )}
                    </div>

                    {/* Premium Order Summary */}
                    <div className="col-lg-4">
                        <div className="summary-card-luxury position-sticky" style={{top: '120px'}}>
                            <h4 className="font-headline text-primary mb-4 border-bottom pb-3 border-gold-subtle">Order Summary</h4>
                            
                            <div className="check-items-scroll custom-scrollbar mb-4" style={{maxHeight: '350px'}}>
                                {cart.map((item, idx) => (
                                    <div key={idx} className="summary-item-row">
                                        <div className="position-relative flex-shrink-0" style={{width: '65px', height: '65px'}}>
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
                                    <span className="fw-bold">₹{subtotal}</span>
                                </div>
                                <div className="d-flex justify-content-between font-body text-primary">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>Shipping & Handling</span>
                                        <Truck size={14} className="text-secondary" />
                                    </div>
                                    <span className={subtotal > 1999 ? "fw-bold text-success" : "fw-bold text-secondary"}>
                                        {subtotal > 1999 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center pt-4 border-top border-gold-subtle mt-2">
                                    <span className="font-headline fs-5 text-primary">Grand Total</span>
                                    <span className="font-headline fs-2 text-secondary fw-bold">₹{total}</span>
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
