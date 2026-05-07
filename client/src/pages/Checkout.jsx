import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, CreditCard, Package, ShieldCheck, Truck, ChevronRight, Phone, Home, Briefcase, Plus, CheckCircle2, ArrowLeft, Ticket, X, Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import './Checkout.css';
import { API_BASE_URL } from '../config/api';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useContext(CartContext);
    const { location: currentLoc, serviceable: currentServiceable } = useLocation();

    const [step, setStep] = useState(1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addrServiceable, setAddrServiceable] = useState(true);
    const [addrDeliveryCharge, setAddrDeliveryCharge] = useState(50);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASHFREE');
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

    // Pincode validation state for new address form
    const [pincodeCheck, setPincodeCheck] = useState({ status: 'idle', serviceable: false, message: '', deliveryCharge: 0 });
    const [pincodeFocus, setPincodeFocus] = useState(false);
    const pincodeTimerRef = useRef(null);

    const [editingAddressId, setEditingAddressId] = useState(null);

    const [newAddress, setNewAddress] = useState({
        label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
    });

    const emptyAddress = {
        label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
    };

    const isValidAddress = (addr) => !!(
        addr &&
        typeof addr === 'object' &&
        addr._id &&
        addr.name &&
        addr.line1 &&
        addr.city &&
        addr.state &&
        addr.pincode &&
        addr.phone
    );

    const subtotal = getCartTotal();
    const effectiveDeliveryCharge = selectedAddress ? addrDeliveryCharge : deliveryChargeAmount;
    const isFreeShipping = couponApplied?.freeShipping || subtotal > freeShippingThreshold;
    const shippingDiscount = couponApplied?.shippingDiscount || 0;
    
    const deliveryCharge = isFreeShipping ? 0 : Math.max(0, effectiveDeliveryCharge - shippingDiscount);
    const discount = couponApplied ? couponApplied.discount : 0;
    const total = subtotal + deliveryCharge - discount;

    const userInfo = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo'));
        } catch (e) {
            return null;
        }
    }, []);

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/users/profile`);
            const validAddresses = (data.addresses || []).filter(isValidAddress);
            setAddresses(validAddresses);

            // Only set default if nothing is selected yet
            setSelectedAddress(prev => {
                if (prev) {
                    // Try to find the same address in the new list to keep it synced
                    const stillExists = validAddresses.find(a => a._id === prev._id);
                    return stillExists || validAddresses[0] || null;
                }
                const defaultAddr = validAddresses.find(a => a.isDefault);
                return defaultAddr || validAddresses[0] || null;
            });
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        }
    };

    useEffect(() => {
        const validateAddr = async () => {
            if (!selectedAddress) return;
            try {
                const { data } = await axios.post(`${API_BASE_URL}/api/delivery/validate`, {
                    pincode: selectedAddress.pincode,
                    city: selectedAddress.city,
                    state: selectedAddress.state
                });
                setAddrServiceable(data.serviceable);
                setAddrDeliveryCharge(data.deliveryCharge);
            } catch (error) {
                setAddrServiceable(false);
                setAddrDeliveryCharge(deliveryChargeAmount);
            }
        };
        validateAddr();
    }, [selectedAddress?._id, deliveryChargeAmount]);

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

    // Fetch CMS settings and active coupons
    useEffect(() => {
        const fetchSettingsAndCoupons = async () => {
            try {
                const [cmsRes, couponsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/cms/homepage`),
                    axios.get(`${API_BASE_URL}/api/coupons/active`)
                ]);

                if (cmsRes.data.freeShippingThreshold !== undefined) setFreeShippingThreshold(cmsRes.data.freeShippingThreshold);
                if (cmsRes.data.deliveryCharge !== undefined) setDeliveryChargeAmount(cmsRes.data.deliveryCharge);
                
                const dbCoupons = (couponsRes.data || []).map(c => ({ code: c.code.toUpperCase() }));
                
                // Use database coupons as the source of truth for "Available Offers"
                setCmsPromos(dbCoupons);
            } catch (e) { console.error('Failed to fetch checkout settings', e); }
        };
        fetchSettingsAndCoupons();
    }, []);

    // Real-time pincode validation for new address form
    const checkPincodeServiceability = useCallback((pin) => {
        if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            setPincodeCheck({ status: 'idle', serviceable: false, message: '', deliveryCharge: 0 });
            return;
        }
        setPincodeCheck({ status: 'checking', serviceable: false, message: 'Checking serviceability...', deliveryCharge: 0 });
        pincodeTimerRef.current = setTimeout(async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/delivery/check-pincode/${pin}`);
                if (data.serviceable) {
                    setPincodeCheck({ status: 'success', serviceable: true, message: `Serviceable — Delivery: ₹${data.deliveryCharge}`, deliveryCharge: data.deliveryCharge });
                } else {
                    setPincodeCheck({ status: 'error', serviceable: false, message: data.message || 'Not serviceable at this pincode', deliveryCharge: 0 });
                }
            } catch {
                setPincodeCheck({ status: 'error', serviceable: false, message: 'Unable to verify pincode. Try again.', deliveryCharge: 0 });
            }
        }, 500);
    }, []);

    const handlePincodeChange = (value) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 6);
        setNewAddress(prev => ({ ...prev, pincode: cleaned }));
        checkPincodeServiceability(cleaned);
    };

    const handleEditAddress = (addr) => {
        setEditingAddressId(addr._id);
        setNewAddress({
            label: addr.label,
            name: addr.name,
            phone: addr.phone,
            line1: addr.line1,
            line2: addr.line2 || '',
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            isDefault: addr.isDefault
        });
        checkPincodeServiceability(addr.pincode);
        setShowNewAddressForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            setLoading(true);
            await axios.delete(`${API_BASE_URL}/api/users/address/${addressId}`);
            await fetchAddresses();
        } catch (error) {
            console.error(error);
            alert('Failed to delete address');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (pincodeCheck.status === 'error' || (newAddress.pincode.length === 6 && !pincodeCheck.serviceable)) {
            alert('This pincode is not serviceable. Please use a different pincode.');
            return;
        }
        try {
            setLoading(true);
            if (editingAddressId) {
                await axios.put(`${API_BASE_URL}/api/users/address/${editingAddressId}`, newAddress);
            } else {
                await axios.post(`${API_BASE_URL}/api/users/address`, newAddress);
            }

            await fetchAddresses();

            setNewAddress(emptyAddress);
            setEditingAddressId(null);
            setPincodeCheck({ status: 'idle', serviceable: false, message: '', deliveryCharge: 0 });
            setShowNewAddressForm(false);
        } catch (error) {
            console.error(error);
            alert(editingAddressId ? 'Failed to update address' : 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        setCouponApplied(null);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/coupons/validate`, {
                code: couponCode.trim(),
                cartTotal: subtotal
            });
            setCouponApplied({
                code: data.code,
                discount: data.discount,
                freeShipping: !!data.freeShipping,
                message: data.freeShipping ? `${data.message || 'Coupon applied!'} Free delivery added.` : data.message
            });
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

    const loadCashfreeSdk = () => {
        return new Promise((resolve, reject) => {
            if (window.Cashfree) {
                resolve(window.Cashfree);
                return;
            }

            const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.Cashfree), { once: true });
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')), { once: true });
                // If script already loaded but Cashfree not yet on window, wait a bit
                setTimeout(() => {
                    if (window.Cashfree) resolve(window.Cashfree);
                    else reject(new Error('Cashfree SDK timed out'));
                }, 5000);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.async = true;
            
            const timeout = setTimeout(() => {
                reject(new Error('Cashfree SDK load timed out'));
            }, 10000);

            script.onload = () => {
                clearTimeout(timeout);
                // Small delay to ensure Cashfree is initialized on window
                setTimeout(() => {
                    if (window.Cashfree) {
                        resolve(window.Cashfree);
                    } else {
                        reject(new Error('Cashfree SDK loaded but not initialized'));
                    }
                }, 200);
            };
            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Failed to load Cashfree SDK script'));
            };
            document.body.appendChild(script);
        });
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

            console.log('[CHECKOUT] Creating order with method:', paymentMethod);
            const { data } = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
            console.log('[CHECKOUT] Order created:', data._id, 'Payment Session:', data.paymentSessionId ? 'YES' : 'NO');
            orderPlacedRef.current = true;

            if (paymentMethod === 'CASHFREE') {
                if (!data.paymentSessionId) {
                    console.error('[CHECKOUT] No paymentSessionId in response');
                    navigate('/order-failure');
                    return;
                }

                try {
                    console.log('[CHECKOUT] Loading Cashfree SDK...');
                    const Cashfree = await loadCashfreeSdk();
                    console.log('[CHECKOUT] Cashfree SDK loaded, mode:', data.cashfreeMode || 'sandbox');
                    
                    const cashfree = Cashfree({ mode: data.cashfreeMode || 'sandbox' });
                    console.log('[CHECKOUT] Initiating checkout redirect...');
                    
                    const result = await cashfree.checkout({
                        paymentSessionId: data.paymentSessionId,
                        redirectTarget: '_self'
                    });
                    
                    // If checkout returns (redirect didn't happen), handle the result
                    if (result?.error) {
                        console.error('[CHECKOUT] Cashfree checkout error:', result.error);
                        navigate('/order-failure');
                    }
                } catch (sdkError) {
                    console.error('[CHECKOUT] Cashfree SDK Error:', sdkError);
                    navigate('/order-failure');
                }
                setLoading(false);
                return;
            }

            clearCart();
            navigate(`/order-success/${data._id}`);
        } catch (error) {
            console.error('Order Error:', error?.response?.data || error);
            navigate('/order-failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-app min-vh-100">
            <div className="container-lg py-5">
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
                                        onClick={() => {
                                            setShowNewAddressForm(!showNewAddressForm);
                                            if (showNewAddressForm) {
                                                setEditingAddressId(null);
                                                setNewAddress(emptyAddress);
                                            }
                                        }}
                                        className="btn-add-address-luxury"
                                    >
                                        {showNewAddressForm ? 'Cancel' : '+ Add Address'}
                                    </button>
                                </div>

                                {showNewAddressForm ? (
                                    <div className="luxury-form-wrapper p-4 bg-white rounded-4 border border-gold-subtle mb-4 animate-slide-up">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="font-headline text-primary fw-bold mb-0">{editingAddressId ? 'EDIT ADDRESS' : 'ADD NEW DELIVERY ADDRESS'}</h5>
                                            <button onClick={() => { setShowNewAddressForm(false); setEditingAddressId(null); setNewAddress(emptyAddress); }} className="btn-close-luxury"><X size={20} /></button>
                                        </div>
                                        <form onSubmit={handleSaveAddress} className="row g-3">
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
                                                <div className="pincode-check-wrapper position-relative">
                                                    <input 
                                                        type="text" 
                                                        className="form-control luxury-input" 
                                                        value={newAddress.pincode} 
                                                        onChange={e => handlePincodeChange(e.target.value)} 
                                                        onFocus={() => setPincodeFocus(true)}
                                                        onBlur={() => setTimeout(() => setPincodeFocus(false), 200)}
                                                        required 
                                                        maxLength="6" 
                                                        placeholder="6-digit pincode" 
                                                    />
                                                    
                                                    {/* Luxury Pincode Popover */}
                                                    {(pincodeFocus || (pincodeCheck.status !== 'idle' && pincodeCheck.status !== 'success')) && (
                                                        <div className={`luxury-pincode-popover animate-scale-in ${pincodeCheck.status}`}>
                                                            {pincodeCheck.status === 'idle' && (
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <MapPin size={16} className="text-secondary" />
                                                                    <span>Enter 6-digit pincode to check delivery</span>
                                                                </div>
                                                            )}
                                                            {pincodeCheck.status === 'checking' && (
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Loader2 size={16} className="animate-spin text-primary" />
                                                                    <span>Verifying your location...</span>
                                                                </div>
                                                            )}
                                                            {pincodeCheck.status === 'success' && (
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <CheckCircle2 size={16} className="text-success" />
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-bold text-success">Serviceable!</div>
                                                                        <div className="extra-small opacity-75">{pincodeCheck.message}</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {pincodeCheck.status === 'error' && (
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <AlertCircle size={16} className="text-danger" />
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-bold text-danger">Not Serviceable</div>
                                                                        <div className="extra-small opacity-75">{pincodeCheck.message}</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="popover-arrow"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label font-heading small fw-bold tracking-widest text-secondary">PHONE NUMBER</label>
                                                <input type="tel" className="form-control luxury-input" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required placeholder="For delivery contact" />
                                            </div>
                                            <div className="col-12 mt-4 pt-3 border-top border-gold-subtle">
                                                <button type="submit" disabled={loading || pincodeCheck.status === 'checking' || (newAddress.pincode.length === 6 && pincodeCheck.status === 'error')} className="btn-add-luxury px-5 py-3 w-100">
                                                    {loading ? 'SAVING...' : pincodeCheck.status === 'checking' ? 'VERIFYING PINCODE...' : editingAddressId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
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
                                            addresses.map((addr) => {
                                                const isSelected = selectedAddress?._id === addr._id;
                                                return (
                                                    <div key={addr._id} className="col-md-6">
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            style={{ cursor: 'pointer', position: 'relative', zIndex: 1, userSelect: 'none' }}
                                                            className={`check-addr-card luxury-card h-100 p-4 ${isSelected ? 'selected' : ''} ${isSelected && !addrServiceable ? 'border-danger' : ''}`}
                                                            onClick={() => setSelectedAddress(addr)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAddress(addr); } }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {addr.label === 'Home' ? <Home size={14} className="text-secondary" /> : <Briefcase size={14} className="text-secondary" />}
                                                                    <span className="font-heading extra-small fw-bold tracking-widest text-secondary">{addr.label}</span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn-icon-luxury edit"
                                                                        onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                                                        title="Edit Address"
                                                                    >
                                                                        <Pencil size={12} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-icon-luxury delete"
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                                                                        title="Delete Address"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                    {isSelected && (
                                                                        <div className="addr-check-ring ms-2">
                                                                            {addrServiceable ? <CheckCircle2 size={20} className="text-primary" /> : <X size={20} className="text-danger" />}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <h6 className="font-headline text-primary mb-2 fw-bold">{addr.name}</h6>
                                                            <p className="font-body small text-muted mb-1">{addr.line1}</p>
                                                            <p className="font-body small text-muted mb-3">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                            <div className="d-flex align-items-center gap-2 text-primary font-heading small fw-bold">
                                                                <Phone size={12} className="text-secondary" /> {addr.phone}
                                                            </div>
                                                            {isSelected && !addrServiceable && (
                                                                <p className="text-danger extra-small mt-2 fw-bold mb-0">NOT SERVICEABLE AT THIS PINCODE</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}

                                        <div className="col-12 mt-5 d-none d-lg-block">
                                            {selectedAddress && !addrServiceable && (
                                                <div className="alert alert-danger extra-small py-2 mb-3 rounded-3 d-flex align-items-center gap-2">
                                                    <X size={14} /> Sorry, we cannot deliver to the selected address.
                                                </div>
                                            )}
                                            <button
                                                className="btn-add-luxury w-100"
                                                disabled={!selectedAddress || !addrServiceable}
                                                onClick={() => setStep(2)}
                                            >
                                                {addrServiceable ? 'CONTINUE TO PAYMENT' : 'UNSERVICEABLE LOCATION'} <ChevronRight size={18} />
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
                                        className={`check-pay-card luxury-card p-4 d-flex align-items-center gap-4 pointer transition-all ${paymentMethod === 'CASHFREE' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('CASHFREE')}
                                    >
                                        <div className={`premium-radio-input ${paymentMethod === 'CASHFREE' ? 'active' : ''}`}>
                                            <div className="pay-check-inner"></div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold font-headline text-primary fs-5">Online Payment</div>
                                            <div className="small text-muted font-body">Pay securely with UPI, cards, net banking, or wallets.</div>
                                        </div>
                                        <CreditCard size={32} className="text-secondary opacity-25" />
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
                                            <img src={item.image?.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`} className="w-100 h-100 object-fit-cover rounded-2" alt="" />
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
                                    <span className={deliveryCharge === 0 ? "fw-bold text-success" : "fw-bold text-secondary"}>
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>

                                {couponApplied && discount > 0 && (
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
                                {/* <div className="payment-support-icons d-flex justify-content-center gap-3 opacity-40">
                                    <img src="/images/reference/payment-visa.png" alt="Visa" height="15" />
                                    <img src="/images/reference/payment-mastercard.png" alt="Mastercard" height="15" />
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Footer for Step 1 */}
            {step === 1 && !showNewAddressForm && selectedAddress && (
                <div className="mobile-checkout-footer d-lg-none animate-slide-up">
                    <div className="container-fluid px-3 h-100 d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex flex-column">
                            <span className="font-heading uppercase tracking-widest opacity-75">Order Total</span>
                            <span className="font-headline fs-4">₹{total.toLocaleString()}</span>
                        </div>
                        <button
                            className="btn-add-luxury px-3"
                            disabled={!addrServiceable}
                            onClick={() => {
                                window.scrollTo(0, 0);
                                setStep(2);
                            }}
                        >
                            {addrServiceable ? 'CONTINUE' : 'UNSERVICEABLE'} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Sticky Mobile Footer for Step 2 */}
            {step === 2 && (
                <div className="mobile-checkout-footer d-lg-none animate-slide-up">
                    <div className="container-fluid px-3 h-100 d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex flex-column">
                            <span className="font-heading uppercase tracking-widest opacity-75">Payable</span>
                            <span className="font-headline fs-4">₹{total.toLocaleString()}</span>
                        </div>
                        <button
                            className="btn-add-luxury px-4"
                            disabled={loading}
                            onClick={handlePlaceOrder}
                        >
                            {loading ? '...' : (paymentMethod === 'COD' ? 'PLACE ORDER' : 'PAY NOW')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
