import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Package,
    User,
    MapPin,
    LogOut,
    ShoppingBag,
    Settings,
    Plus,
    CreditCard,
    ArrowRight,
    Camera,
    Bell,
    ChevronRight,
    Search,
    Clock,
    ShieldCheck,
    Truck,
    X,
    Phone,
    Home,
    Briefcase
} from 'lucide-react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); // 'info', 'addresses', 'orders'
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', currentPassword: '', newPassword: '' });

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({ _id: '', label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tab = queryParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, []);

    const fetchProfileData = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login?redirect=/profile');
            return;
        }

        try {
            setLoading(true);

            const [profileRes, ordersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`)
            ]);

            setUser(profileRes.data);
            setProfileForm({ name: profileRes.data.name, email: profileRes.data.email, phone: profileRes.data.phone || '', currentPassword: '', newPassword: '' });
            setOrders(ordersRes.data);
        } catch (error) {
            console.error('Failed to load profile', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const updateData = { name: profileForm.name, email: profileForm.email, phone: profileForm.phone };
            if (profileForm.newPassword) updateData.password = profileForm.newPassword;

            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, updateData);

            localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, name: data.name, email: data.email, phone: data.phone }));

            alert('Profile updated successfully');
            setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            fetchProfileData();
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (addressForm._id) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/address/${addressForm._id}`, addressForm);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/users/address`, addressForm);
            }

            setShowAddressModal(false);
            fetchProfileData();
        } catch (error) {
            alert('Failed to save address');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/address/${id}`);
            fetchProfileData();
        } catch (error) {
            alert('Failed to delete address');
        }
    };

    if (loading) return (
        <div className="profile-loading bg-surface vh-100 d-flex flex-column align-items-center justify-content-center">
            <div className="spinner-art mb-3"></div>
            <p className="font-label text-muted small tracking-widest uppercase">Loading...</p>
        </div>
    );

    return (
        <div className="profile-page-app bg-surface min-vh-100">
            <div className="container-lg py-5 mt-5">
                <header className="profile-header-premium mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 border-bottom pb-4">
                    <div>
                        <span className="font-label text-secondary small uppercase tracking-widest fw-bold mb-2 d-inline-block">Your Account</span>
                        <h1 className="font-headline text-primary m-0 display-4">Profile Details</h1>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill px-4 py-2 font-label fw-bold small d-none d-md-flex align-items-center gap-2 art-logout-btn">
                        <LogOut size={16} /> LOGOUT
                    </button>
                </header>

                <div className="row g-5">
                    {/* Lateral Navigation */}
                    <aside className="col-lg-3">
                        <div className="prof-side-anchor bg-white border rounded-5 overflow-hidden shadow-sm position-sticky" style={{ top: '120px' }}>
                            <div className="prof-card-hero p-5 text-center border-bottom bg-light bg-opacity-50">
                                <div className="avatar-monogram mx-auto mb-4 position-relative">
                                    <div className="monogram-circle bg-primary text-white font-headline fs-2 d-flex align-items-center justify-content-center shadow-lg">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <button className="monogram-camera shadow-sm border-0"><Camera size={14} /></button>
                                </div>
                                <h5 className="font-headline text-primary mb-1">{user?.name}</h5>
                                <p className="font-body text-muted small m-0">{user?.email}</p>
                            </div>

                            <nav className="prof-sidebar-nav p-2">
                                <button className={`prof-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="nav-icon-box"><Package size={18} /></div>
                                        <span className="font-label fw-bold text-uppercase small tracking-wide">Orders</span>
                                    </div>
                                    <ChevronRight size={14} className="nav-chevron" />
                                </button>
                                <button className={`prof-nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className=" nav-icon-box"><MapPin size={18} /></div>
                                        <span className="font-label fw-bold text-uppercase small tracking-wide">Addresses</span>
                                    </div>
                                    <ChevronRight size={14} className="nav-chevron" />
                                </button>
                                <button className={`prof-nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className=" nav-icon-box"><User size={18} /></div>
                                        <span className="font-label fw-bold text-uppercase small tracking-wide">My Info</span>
                                    </div>
                                    <ChevronRight size={14} className="nav-chevron" />
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Manifold */}
                    <main className="col-lg-9">
                        {activeTab === 'orders' && (
                            <div className="animated fadeIn">
                                <h2 className="font-headline text-primary mb-5 d-flex align-items-center gap-3">
                                    <span className="title-slash">/</span> My Orders
                                </h2>
                                {orders.length === 0 ? (
                                    <div className="empty-catalog-state text-center py-7 bg-white rounded-5 border border-dashed">
                                        <ShoppingBag size={64} className="text-secondary opacity-25 mb-4" />
                                        <h4 className="font-headline text-primary mb-3">No Orders Yet</h4>
                                        <p className="font-body text-muted mb-5 mx-auto max-w-sm">Start your premium collection today and track your shipments here.</p>
                                        <Link to="/categories" className="btn btn-primary rounded-pill px-5 py-3 font-label fw-bold tracking-widest">DISCOVER NOW</Link>
                                    </div>
                                ) : (
                                    <div className="orders-timeline-stack d-flex flex-column gap-4">
                                        {orders.map(order => (
                                            <div key={order._id} className="premium-order-row bg-white rounded-5 border p-4 shadow-sm hover-reveal overflow-hidden position-relative">
                                                <div className="row align-items-center g-4">
                                                    <div className="col-md-3">
                                                        <span className="font-label extra-small text-muted uppercase tracking-widest fw-bold mb-1 d-block">ORDER ID</span>
                                                        <p className="font-headline small text-primary m-0 fw-bold">#{order._id.substring(order._id.length - 8)}</p>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <span className="font-label extra-small text-muted uppercase tracking-widest fw-bold mb-1 d-block">DATE</span>
                                                        <p className="font-body small text-dark m-0">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <span className="font-label extra-small text-muted uppercase tracking-widest fw-bold mb-1 d-block">TOTAL</span>
                                                        <p className="font-headline fs-5 text-secondary m-0 fw-bold">₹{order.totalPrice}</p>
                                                    </div>
                                                    <div className="col-md-2 text-md-center">
                                                        <span className={`order-status-pill ${order.status?.toLowerCase() || 'pending'}`}>
                                                            {order.status || 'Received'}
                                                        </span>
                                                    </div>
                                                    <div className="col-md-2 text-md-end mt-2 mt-md-0">
                                                        <button className="btn btn-primary btn-sm rounded-pill w-100 w-md-auto py-2 px-4 font-label fw-bold extra-small text-decoration-none d-flex align-items-center justify-content-center gap-1 shadow-sm" onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                                                            View Order <ArrowRight size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Preview Items Strip */}
                                                <div className="order-strip-preview mt-4 pt-3 border-top d-flex gap-2">
                                                    {order.orderItems.map((item, i) => (
                                                        <img key={i} src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} className="rounded-3 border shadow-xs object-fit-cover" style={{ width: '45px', height: '45px' }} alt="" />
                                                    ))}
                                                    {order.orderItems.length > 5 && <span className="more-count">+{order.orderItems.length - 5}</span>}
                                                </div>
                                            </div>
                                        )).reverse()}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="animated fadeIn">
                                <h2 className="font-headline text-primary mb-5 d-flex align-items-center gap-3">
                                    <span className="title-slash">/</span> Personal Information
                                </h2>
                                <div className="profile-form-container bg-white p-5 rounded-5 border shadow-sm">
                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label font-label extra-small fw-bold text-muted uppercase tracking-widest">Full Name</label>
                                                <div className="art-input-wrap">
                                                    <User size={18} className="input-icon" />
                                                    <input type="text" className="form-control" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label font-label extra-small fw-bold text-muted uppercase tracking-widest">Email Address</label>
                                                <div className="art-input-wrap disabled">
                                                    <Bell size={18} className="input-icon" />
                                                    <input type="email" className="form-control" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label font-label extra-small fw-bold text-muted uppercase tracking-widest">Mobile Number</label>
                                                <div className="art-input-wrap">
                                                    <Phone size={18} className="input-icon" />
                                                    <input type="tel" className="form-control" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="col-12 mt-5">
                                                <div className="password-settings-section p-4 rounded-4 bg-light bg-opacity-75 border-dashed border-2">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <ShieldCheck size={20} className="text-secondary" />
                                                        <h6 className="m-0 fw-bold font-headline text-primary">Password Settings</h6>
                                                    </div>
                                                    <p className="text-muted extra-small mb-4 font-body">Update your password to keep your account safe.</p>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <label className="form-label font-label small fw-bold">New Password</label>
                                                            <input type="password" placeholder="Leave blank to keep same" className="form-control bg-white rounded-3 shadow-none p-3" value={profileForm.newPassword} onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12 mt-4 d-flex flex-column gap-3">
                                                <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-bold font-label tracking-wide shadow-lg art-save-btn">
                                                    SAVE PROFILE
                                                </button>
                                                <button onClick={handleLogout} type="button" className="btn btn-outline-danger rounded-pill py-3 fw-bold font-label small d-flex d-md-none align-items-center justify-content-center gap-2 art-logout-btn-mobile">
                                                    <LogOut size={18} /> LOGOUT FROM ACCOUNT
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="animated fadeIn">
                                <div className="d-flex align-items-center justify-content-between mb-5">
                                    <h2 className="font-headline text-primary m-0 d-flex align-items-center gap-3">
                                        <span className="title-slash">/</span> My Addresses
                                    </h2>
                                    <button className="btn btn-secondary rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-bold font-label small art-add-btn" onClick={() => { setAddressForm({ _id: '', label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false }); setShowAddressModal(true); }}>
                                        <Plus size={18} /> ADD NEW ADDRESS
                                    </button>
                                </div>

                                <div className="row g-4">
                                    {user?.addresses?.length === 0 ? (
                                        <div className="col-12">
                                            <div className="text-center py-7 bg-white rounded-5 border border-dashed text-muted">
                                                <MapPin size={48} className="opacity-25 mb-4" />
                                                <p className="font-body">No addresses saved yet.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        user?.addresses?.map((addr, idx) => (
                                            <div key={idx} className="col-md-6">
                                                <div className="prof-addr-card bg-white p-5 rounded-5 border shadow-sm h-100 transition-all hover-shadow-md position-relative">
                                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                                        <div className={`addr-pill-premium ${addr.label.toLowerCase()}`}>
                                                            {addr.label === 'Home' ? <Home size={12} className="me-1" /> : <Briefcase size={12} className="me-1" />}
                                                            {addr.label}
                                                        </div>
                                                        {addr.isDefault && <span className="default-flag font-label fw-bold">PRIMARY</span>}
                                                    </div>
                                                    <h6 className="font-headline text-primary fw-bold mb-3">{addr.name}</h6>
                                                    <div className="addr-details font-body text-muted small mb-4">
                                                        <p className="m-0 mb-1">{addr.line1}</p>
                                                        <p className="m-0">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 text-secondary font-label extra-small fw-bold">
                                                        <Phone size={14} /> {addr.phone}
                                                    </div>

                                                    <div className="addr-card-actions mt-4 pt-4 border-top d-flex gap-4">
                                                        <button className="btn btn-link p-0 text-decoration-none font-label extra-small fw-bold text-primary tracking-widest uppercase" onClick={() => { setAddressForm(addr); setShowAddressModal(true); }}>Edit</button>
                                                        <button className="btn btn-link p-0 text-decoration-none font-label extra-small fw-bold text-danger tracking-widest uppercase opacity-75" onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Address Form Modal */}
                {showAddressModal && (
                    <div className="art-modal-overlay d-flex align-items-center justify-content-center">
                        <div className="art-modal-content bg-white p-5 rounded-5 shadow-premium animated zoomIn position-relative overflow-hidden" style={{ maxWidth: '650px', width: '95%' }}>
                            <button className="art-modal-close border-0 bg-transparent text-secondary position-absolute top-0 end-0 m-4" onClick={() => setShowAddressModal(false)}>
                                <X size={24} />
                            </button>

                            <div className="modal-header-refined mb-5">
                                <span className="font-label text-secondary small uppercase tracking-widest fw-bold mb-1 d-block">MANAGEMENT</span>
                                <h3 className="font-headline text-primary m-0">{addressForm._id ? 'Edit Address' : 'Add New Address'}</h3>
                            </div>

                            <form onSubmit={handleSaveAddress} className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label font-label extra-small fw-bold text-muted uppercase">Address Label</label>
                                    <select className="form-select rounded-3 p-3 bg-light border-0 shadow-none" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} required>
                                        <option value="Home">Home</option>
                                        <option value="Office">Office</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label font-label extra-small fw-bold text-muted uppercase">Recipient Name</label>
                                    <input type="text" className="form-control rounded-3 p-3 bg-light border-0 shadow-none" placeholder="Full Name" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label font-label extra-small fw-bold text-muted uppercase">Street Address (Line 1)</label>
                                    <input type="text" className="form-control rounded-3 p-3 bg-light border-0 shadow-none" placeholder="Door No, Street, Landmark" value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} required />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label font-label extra-small fw-bold text-muted uppercase">City</label>
                                    <input type="text" className="form-control rounded-3 p-3 bg-light border-0 shadow-none" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label font-label extra-small fw-bold text-muted uppercase">State</label>
                                    <input type="text" className="form-control rounded-3 p-3 bg-light border-0 shadow-none" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label font-label extra-small fw-bold text-muted uppercase">Pincode</label>
                                    <input type="text" className="form-control rounded-3 p-3 bg-light border-0 shadow-none" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} required />
                                </div>
                                <div className="col-12 mt-5">
                                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold font-label tracking-widest shadow-lg art-save-btn">
                                        {addressForm._id ? 'SAVE ADDRESS' : 'ADD ADDRESS'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Premium Manifest Modal */}
                {showOrderModal && selectedOrder && (
                    <div className="art-modal-overlay d-flex align-items-center justify-content-center">
                        <div className="art-modal-content bg-white p-0 rounded-5 shadow-premium animated fadeInUp overflow-hidden" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh' }}>
                            {/* Custom Modal Header */}
                            <div className="manifest-modal-head bg-primary p-4 p-md-5 text-white position-relative">
                                <button className="art-modal-close border-0 bg-transparent text-white opacity-75 position-absolute top-0 end-0 m-3 m-md-4" onClick={() => setShowOrderModal(false)}>
                                    <X size={24} />
                                </button>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3 mt-4 mt-md-0">
                                    <div>
                                        <span className="font-label extra-small fw-bold uppercase tracking-widest opacity-75 mb-1 mb-md-2 d-inline-block">ORDER SUMMARY</span>
                                        <h3 className="font-headline m-0 fw-bold display-6 fs-3">Order #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</h3>
                                    </div>
                                    <div className="text-start text-md-end">
                                        <span className="font-label extra-small fw-bold uppercase tracking-widest opacity-75 mb-1 mb-md-2 d-inline-block">TOTAL VALUE</span>
                                        <p className="font-headline fs-2 m-0 fw-bold">₹{selectedOrder.totalPrice}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="manifest-modal-body p-4 p-md-5 overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                                <div className="row g-5 mb-5">
                                    <div className="col-md-4">
                                        <div className="manifest-info-card border-start-thick ps-3">
                                            <label className="font-label extra-small text-muted fw-bold uppercase tracking-widest mb-1 d-block">DATE & TIME</label>
                                            <p className="font-body small text-primary m-0 fw-bold">{new Date(selectedOrder.createdAt).toLocaleString(undefined, { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="manifest-info-card border-start-thick ps-3">
                                            <label className="font-label extra-small text-muted fw-bold uppercase tracking-widest mb-1 d-block">SETTLEMENT</label>
                                            <p className="font-body small text-primary m-0 fw-bold">
                                                {selectedOrder.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'ONLINE'}
                                                <span className={`ms-2 small-dot ${selectedOrder.isPaid ? 'bg-success' : 'bg-warning'}`}></span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="manifest-info-card border-start-thick ps-3">
                                            <label className="font-label extra-small text-muted fw-bold uppercase tracking-widest mb-1 d-block">LOGISTICS</label>
                                            <p className="font-body small text-primary m-0 fw-bold">{selectedOrder.status || 'Received'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="manifest-address-strip bg-light p-3 p-md-4 rounded-4 mb-4 mb-md-5 d-flex flex-column flex-md-row gap-3 gap-md-4">
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="strip-icon text-primary mt-1"><Truck size={20} /></div>
                                        <div className="strip-content flex-grow-1">
                                            <label className="font-label extra-small text-muted fw-bold uppercase tracking-widest mb-1 mb-md-2 d-block">DESTINATION</label>
                                            <p className="font-headline small text-primary mb-1 fw-bold">{selectedOrder.shippingAddress?.name}</p>
                                            <p className="font-body extra-small text-muted mb-0">{selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                        </div>
                                    </div>
                                    <div className="strip-phone text-start text-md-end mt-2 mt-md-0 ms-0 ms-md-auto ps-4 ps-md-0 ms-3 ms-md-0">
                                        <label className="font-label extra-small text-muted fw-bold uppercase tracking-widest mb-1 mb-md-2 d-block">CONTACT</label>
                                        <p className="font-body small text-primary fw-bold mb-0">{selectedOrder.shippingAddress?.phone}</p>
                                    </div>
                                </div>

                                <div className="manifest-items-catalog">
                                    <h6 className="font-label text-secondary fw-bold uppercase tracking-widest mb-4 border-bottom pb-2">PRODUCT CATALOGUE</h6>
                                    <div className="d-flex flex-column gap-3">
                                        {selectedOrder.orderItems.map((item, i) => (
                                            <div key={i} className="manifest-item-row d-flex align-items-center gap-4 py-3 border-bottom border-light hover-bg-light transition-all rounded-3 px-2">
                                                <img
                                                    src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`}
                                                    alt=""
                                                    className="img-art shadow-sm border object-fit-cover rounded-3"
                                                    style={{ width: '60px', height: '60px' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <p className="font-headline small text-primary m-0 fw-bold d-flex align-items-center gap-2">
                                                        {item.name}
                                                        {item.variant && <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill px-2 py-1 fw-bold" style={{ fontSize: '11px' }}>📦 {item.variant}</span>}
                                                    </p>
                                                    <p className="font-label extra-small text-muted m-0 uppercase tracking-wide">QUANTITY: {item.qty}</p>
                                                </div>
                                                <div className="text-end">
                                                    <p className="font-headline small text-secondary m-0 fw-bold">₹{item.qty * item.price}</p>
                                                    <p className="font-label extra-small text-muted m-0">₹{item.price} / unit</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="manifest-financial-summary mt-5 pt-4 border-top">
                                    <div className="row justify-content-end">
                                        <div className="col-md-5">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="font-label small text-muted">Sub-Total Value</span>
                                                <span className="font-body small fw-bold text-primary">₹{selectedOrder.itemsPrice || selectedOrder.totalPrice - (selectedOrder.shippingPrice || 0)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-4">
                                                <span className="font-label small text-muted">Logistics Fee</span>
                                                <span className="font-body small fw-bold text-success">{selectedOrder.shippingPrice > 0 ? `₹${selectedOrder.shippingPrice}` : 'FREE'}</span>
                                            </div>
                                            <div className="d-flex justify-content-between pt-3 border-top">
                                                <h5 className="font-headline text-primary fw-bold m-0 fs-4">GRAND TOTAL</h5>
                                                <h5 className="font-headline text-secondary fw-bold m-0 fs-3">₹{selectedOrder.totalPrice}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="manifest-footer-action mt-4 mt-md-5 pt-3 pt-md-4 border-top d-flex flex-column flex-md-row gap-2 gap-md-3">
                                    <button className="btn btn-primary rounded-pill flex-grow-1 py-3 fw-bold font-label tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2" onClick={() => window.print()}>
                                        GENERATE DOCUMENT
                                    </button>
                                    <button className="btn btn-outline-secondary rounded-pill px-4 px-md-5 py-3 fw-bold font-label small" onClick={() => setShowOrderModal(false)}>
                                        CLOSE VIEW
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
