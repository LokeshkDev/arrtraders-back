import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    Search,
    LogOut,
    CreditCard,
    ShoppingCart,
    UserPlus,
    AlertTriangle,
    Save,
    Edit,
    Trash,
    ChevronDown,
    Eye,
    Download,
    Lock,
    Plus,
    ArrowLeft,
    Calendar,
    Layers,
    Bell,
    BellOff,
    FileEdit,
    MoreVertical,
    Briefcase,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    Star,
    Info,
    ArrowUpCircle,
    Truck,
    Image as ImageIcon,
    Smartphone,
    MousePointer2,
    Box,
    ShieldCheck,
    Clock,
    Timer,
    MessageSquare,
    Quote,
    User,
    MousePointerClick,
    Ticket,
    ChevronLeft,
    FileText,
    MapPin,
    HelpCircle
} from 'lucide-react';
import './AdminDashboard.css';
import PagesCMS from '../components/PagesCMS.jsx';
import DeliveryZoneTab from '../components/DeliveryZoneTab.jsx';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [pageLoading, setPageLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('adminSidebarCollapsed') !== null ? localStorage.getItem('adminSidebarCollapsed') === 'true' : true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // User Edit States
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', isAdmin: false, password: '' });
    const [isSavingUser, setIsSavingUser] = useState(false);

    // Coupon States
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isSavingCoupon, setIsSavingCoupon] = useState(false);
    const [couponForm, setCouponForm] = useState({
        code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '',
        maxDiscount: '', usageLimit: '', expiresAt: '', freeShipping: false, isActive: true
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 4000);
    };

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('adminSidebarCollapsed', newState);
    };

    // New Order Notification State
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const audioRef = useRef(null);
    const prevOrderIdsRef = useRef(new Set());
    const isInitialMount = useRef(true);

    const playAlert = () => {
        if (!soundEnabled) return;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error('Audio play blocked:', e));

        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }, 10000);
    };

    const fetchOrders = async (silent = false) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`);
            const currentIds = new Set(data.map(o => o._id));

            if (!isInitialMount.current) {
                const foundNewOrders = data.filter(o => !prevOrderIdsRef.current.has(o._id));
                if (foundNewOrders.length > 0) {
                    setNewOrder(foundNewOrders[0]); // Show the most recent one
                    playAlert();
                }
            }

            prevOrderIdsRef.current = currentIds;
            isInitialMount.current = false;
            setOrders(data);
        } catch (error) {
            console.error('Global orders fetch error:', error);
        }
    };

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            window.location.href = '/login?redirect=/admin';
            return;
        }

        fetchOrders();
        const pollInterval = setInterval(() => fetchOrders(true), 30000);

        return () => {
            clearInterval(pollInterval);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [userInfo]);

    useEffect(() => {
        const timer = setTimeout(() => setPageLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/login';
    };

    const navItems = [
        { id: 'Overview', icon: LayoutDashboard },
        { id: 'Orders', icon: ShoppingBag },
        { id: 'Products', icon: Package },
        { id: 'Customers', icon: Users },
        { id: 'Coupons', icon: Ticket },
        { id: 'Delivery', icon: Truck },
        { id: 'Website', icon: FileEdit },
        { id: 'Pages', icon: FileText },
        { id: 'Highlights', icon: Star }
    ];

    if (!userInfo || !userInfo.isAdmin) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="font-label small text-muted fw-bold uppercase">Redirecting to secure login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            {/* Page Loader Splash */}
            <div className={`admin-loader-overlay ${!pageLoading ? 'fade-out' : ''}`}>
                <img src="/loader-giff.gif" alt="Loading" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '15px' }} />
                <div className="loader-brand">AR RAHMAN</div>
                <div className="loader-progress mt-3"></div>
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-brand">
                    <h1 className="font-headline d-flex align-items-center gap-2">
                        <Package size={24} className="text-secondary flex-shrink-0" />
                        <span className="brand-text">AR <span>RAHMAN</span></span>
                    </h1>
                    <p className="extra-small opacity-50 uppercase tracking-widest font-label mt-1 brand-subtext">Global Marketplace Control</p>

                    <button className="sidebar-toggle-btn d-none d-lg-flex" onClick={toggleCollapse}>
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
                <nav className="admin-nav">
                    <ul className="admin-nav-list">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                        className={`admin-nav-btn ${isActive ? 'active' : ''}`}
                                        title={isCollapsed ? item.id : ''}
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                                        <span className="nav-label">{item.id}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="admin-sidebar-footer">
                    <div className="admin-user-profile bg-white bg-opacity-5 p-3 rounded-4 mx-3 mb-4 border border-white border-opacity-10 shadow-sm transition-all hover-bg-opacity-10">
                        <div className="d-flex align-items-center gap-3 profile-inner">
                            <div className="admin-user-avatar shadow-premium bg-secondary text-primary d-flex align-items-center justify-content-center fw-bold font-headline flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '50%', fontSize: '18px' }}>
                                {userInfo?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-grow-1 overflow-hidden profile-info">
                                <p className="admin-label text-white fw-bold mb-0 text-truncate font-headline small text-primary">{userInfo?.name || 'Administrator'}</p>
                                <div className="d-flex align-items-center gap-1 opacity-75 extra-small font-label mt-1 fw-bold uppercase text-primary" style={{ letterSpacing: '0.5px' }}>
                                    <div className="rounded-circle bg-success shadow-sm text-primary" style={{ width: 6, height: 6 }}></div> Online
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Top Header */}
                <header className="admin-header shadow-sm mt-0 border-0">
                    <div className="d-flex align-items-center gap-2 gap-md-4">
                        <button className="btn btn-light border d-lg-none rounded-circle p-2 d-flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <button className="btn btn-light border d-none d-lg-flex rounded-circle p-2 shadow-sm hover-shadow-md transition-all" onClick={toggleCollapse} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
                            <Menu size={20} />
                        </button>
                        <div className="d-none d-md-block">
                            <h2 className="font-headline fs-5 m-0 text-primary fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>{activeTab}</h2>
                            <p className="m-0 text-muted extra-small fw-bold opacity-75">DASHBOARD CONTROL</p>
                        </div>
                        <div className="admin-search-bar d-none d-lg-flex border border-opacity-10 border-primary ms-md-4">
                            <Search size={16} className="text-muted" />
                            <input type="text" placeholder="Quick find product or order..." />
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="text-end d-none d-sm-block border-end pe-3 me-2 border-opacity-10">
                            <p className="m-0 fw-bold small text-primary">{userInfo?.name || 'Admin User'}</p>
                            <p className="m-0 text-muted extra-small uppercase fw-bold" style={{ letterSpacing: '0.05em' }}>Admin Control</p>
                        </div>
                        <button
                            className="btn btn-primary btn-sm rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm border-0 transition-all hover-scale"
                            onClick={handleLogout}
                        >
                            <LogOut size={14} />
                            <span className="fw-bold small">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="admin-content bg-light bg-opacity-20">
                    {activeTab === 'Overview' && <OverviewTab setActiveTab={setActiveTab} orders={orders} />}
                    {activeTab === 'Orders' && (
                        <OrdersTab
                            orders={orders}
                            fetchOrders={fetchOrders}
                            soundEnabled={soundEnabled}
                            setSoundEnabled={setSoundEnabled}
                            showToast={showToast}
                            setConfirmModal={setConfirmModal}
                            selectedOrder={selectedOrder}
                            setSelectedOrder={setSelectedOrder}
                            showModal={showModal}
                            setShowModal={setShowModal}
                        />
                    )}
                    {activeTab === 'Products' && <ProductsTab showToast={showToast} setConfirmModal={setConfirmModal} />}
                    {activeTab === 'Customers' && (
                        <CustomersTab
                            showToast={showToast}
                            setConfirmModal={setConfirmModal}
                            editUser={editUser}
                            setEditUser={setEditUser}
                            editForm={editForm}
                            setEditForm={setEditForm}
                        />
                    )}
                    {activeTab === 'Coupons' && (
                        <CouponsTab
                            showToast={showToast}
                            setConfirmModal={setConfirmModal}
                            showCouponModal={showCouponModal}
                            setShowCouponModal={setShowCouponModal}
                            selectedCoupon={selectedCoupon}
                            setSelectedCoupon={setSelectedCoupon}
                            couponForm={couponForm}
                            setCouponForm={setCouponForm}
                        />
                    )}
                    {activeTab === 'Delivery' && <DeliveryZoneTab showToast={showToast} setConfirmModal={setConfirmModal} />}
                    {activeTab === 'Website' && <CMSContentTab showToast={showToast} setConfirmModal={setConfirmModal} />}
                    {activeTab === 'Pages' && <PagesCMS showToast={showToast} setConfirmModal={setConfirmModal} />}
                    {activeTab === 'Highlights' && <HighlightsTab showToast={showToast} setConfirmModal={setConfirmModal} />}
                </div>

                {/* Global Notification Popup */}
                {newOrder && (
                    /* ... existing newOrder logic ... */
                    <div className="position-fixed bottom-0 end-0 p-4 animate-slide-up" style={{ zIndex: 10000, maxWidth: '400px' }}>
                        {/* existing newOrder content */}
                    </div>
                )}
            </main>

            {/* Custom Toast */}
            {toast.show && (
                <div className="position-fixed toast-container" style={{ bottom: '30px', right: '30px', zIndex: 11000 }}>
                    <div className={`admin-toast ${toast.type}`}>
                        {toast.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                        <X size={16} className="ms-auto cursor-pointer" onClick={() => setToast({ ...toast, show: false })} />
                    </div>
                </div>
            )}

            {/* Confirmation Sheet (Global) */}
            {confirmModal.show && (
                <div className="admin-sheet-overlay">
                    <div className="admin-sheet-container" style={{ maxWidth: '450px' }}>
                        <div className="admin-sheet-header">
                            <div className="header-left">
                                <span className="sheet-label text-danger">SYSTEM CONFIRMATION</span>
                                <h2 className="sheet-title">{confirmModal.title}</h2>
                            </div>
                            <button className="btn-close-sheet" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-sheet-body">
                            <p className="fw-bold text-muted m-0 lh-base">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="admin-sheet-footer">
                            <button
                                className="btn-sheet-primary bg-danger shadow-danger"
                                style={{ boxShadow: '0 10px 20px rgba(220, 53, 69, 0.2)' }}
                                onClick={() => {
                                    confirmModal.onConfirm();
                                    setConfirmModal({ ...confirmModal, show: false });
                                }}
                            >
                                PROCEED & CONFIRM
                            </button>
                            <button className="btn-sheet-secondary" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                CANCEL ACTION
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global HIGH-POLY MODAL: Order Details (Moved to Root to avoid stacking context issues) */}
            {showModal && selectedOrder && (
                <div className="order-detail-overlay animate-fade-in">
                    <div className="order-mobile-sheet">
                        <div className="sheet-header">
                            <div className="header-left">
                                <span className="label-top">ORDER MANAGEMENT</span>
                                <h2 className="order-id-title">#ORD-{selectedOrder._id.substring(selectedOrder._id.length - 4).toUpperCase()}</h2>
                                <div className="meta-info">
                                    <div className="placed-on">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    <div className="via-label">VIA MOBILE APP</div>
                                </div>
                            </div>
                            <div className="header-right">
                                <button className="btn-close-sheet" onClick={() => { setShowModal(false); setSelectedOrder(null); }}>
                                    <X size={20} />
                                </button>
                                <div className={`status-pill-sheet ${selectedOrder.status?.toLowerCase() || 'processing'}`}>
                                    {selectedOrder.status?.toUpperCase() || 'PROCESSING'}
                                </div>
                            </div>
                        </div>

                        <div className="customer-sheet-card">
                            <div className="customer-info-row">
                                <div className="avatar-sheet">
                                    {selectedOrder.shippingAddress?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <div className="customer-details">
                                    <div className="name">{selectedOrder.shippingAddress?.name || 'Customer'}</div>
                                    <div className="phone">{selectedOrder.shippingAddress?.phone || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="address-row">
                                <MapPin size={16} className="pin-icon" />
                                <div className="address-text">
                                    {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.line2}<br />
                                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
                                </div>
                            </div>
                        </div>

                        <div className="items-section-sheet">
                            <h3 className="section-title">ORDER ITEMS ({selectedOrder.orderItems.length})</h3>
                            <div className="items-list-sheet">
                                {selectedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} className="item-card-sheet">
                                        <div className="item-img-box">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-info-sheet">
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-sub">Premium Quality • {item.variant || 'Standard'}</div>
                                            <div className="item-bottom-row">
                                                <div className="qty-label">Qty: {item.qty}</div>
                                                <div className="price-label">₹{(item.price * item.qty).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-sheet-footer">
                            <button className="btn-sheet-primary" onClick={() => { /* Handle Shipped */ }}>
                                MARK AS SHIPPED
                            </button>
                            <button className="btn-sheet-secondary" onClick={() => generateInvoice(selectedOrder)}>
                                PRINT INVOICE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global HIGH-POLY MODAL: Customer Edit Profile */}
            {editUser && (
                <div className="admin-sheet-overlay">
                    <div className="admin-sheet-container">
                        <div className="admin-sheet-header">
                            <div className="header-left">
                                <span className="sheet-label">IDENTITY MANAGEMENT</span>
                                <h2 className="sheet-title">Edit User Profile</h2>
                                <p className="sheet-subtitle">SYSTEM ID: {editUser._id}</p>
                            </div>
                            <button className="btn-close-sheet" onClick={() => setEditUser(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSavingUser(true);
                            try {
                                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUser._id}`, {
                                    name: editForm.name, email: editForm.email, isAdmin: editForm.isAdmin
                                });
                                if (editForm.password) {
                                    await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUser._id}/reset-password`, { password: editForm.password });
                                }
                                showToast('Identity profile synchronized');
                                setEditUser(null);
                                // Trigger refresh in CustomersTab - we might need a refresh function passed up
                                window.dispatchEvent(new CustomEvent('refresh-customers'));
                            } catch (error) {
                                showToast('Synchronization error', 'error');
                            } finally {
                                setIsSavingUser(false);
                            }
                        }}>
                            <div className="admin-sheet-body">
                                <div className="sheet-field-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Enter legal name..."
                                    />
                                </div>

                                <div className="sheet-field-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="sheet-toggle-card">
                                    <div className="form-check form-switch m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="userRole"
                                            checked={editForm.isAdmin}
                                            onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                                        />
                                    </div>
                                    <div>
                                        <label className="fw-bold text-primary d-block small mb-0" htmlFor="userRole">Administrator Access</label>
                                        <span className="text-muted extra-small">Grant full system control privileges</span>
                                    </div>
                                </div>

                                <div className="sheet-field-group">
                                    <label className="text-danger d-flex align-items-center gap-2">
                                        <AlertTriangle size={12} /> Security Key Reset
                                    </label>
                                    <input
                                        type="text"
                                        className="border-danger border-opacity-20"
                                        placeholder="Leave blank to keep current password..."
                                        value={editForm.password}
                                        onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="admin-sheet-footer">
                                <button type="submit" className="btn-sheet-primary" disabled={isSavingUser}>
                                    {isSavingUser ? 'SYNCHRONIZING...' : 'SAVE & UPDATE PROFILE'}
                                </button>
                                <button type="button" className="btn-sheet-secondary" onClick={() => setEditUser(null)}>
                                    DISCARD CHANGES
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global HIGH-POLY MODAL: Coupon Management */}
            {showCouponModal && (
                <div className="admin-sheet-overlay">
                    <div className="admin-sheet-container">
                        <div className="admin-sheet-header">
                            <div className="header-left">
                                <span className="sheet-label">REWARDS & PROMOTIONS</span>
                                <h2 className="sheet-title">{selectedCoupon ? 'Edit Campaign Coupon' : 'Create New Reward'}</h2>
                                {selectedCoupon && <p className="sheet-subtitle">UID: {selectedCoupon._id}</p>}
                            </div>
                            <button className="btn-close-sheet" onClick={() => setShowCouponModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSavingCoupon(true);
                            try {
                                const payload = {
                                    code: couponForm.code,
                                    discountType: couponForm.discountType,
                                    discountValue: couponForm.discountValue ? Number(couponForm.discountValue) : 0,
                                    minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : 0,
                                    maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
                                    usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : 0,
                                    expiresAt: couponForm.expiresAt || null,
                                    freeShipping: couponForm.freeShipping,
                                    isActive: couponForm.isActive
                                };
                                if (selectedCoupon) {
                                    await axios.put(`${import.meta.env.VITE_API_URL}/api/coupons/${selectedCoupon._id}`, payload);
                                    showToast('Campaign coupon updated');
                                } else {
                                    await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons`, payload);
                                    showToast('New reward campaign initiated');
                                }
                                setShowCouponModal(false);
                                window.dispatchEvent(new CustomEvent('refresh-coupons'));
                            } catch (error) {
                                showToast(error.response?.data?.message || 'Campaign update failed', 'error');
                            } finally {
                                setIsSavingCoupon(false);
                            }
                        }}>
                            <div className="admin-sheet-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="sheet-field-group">
                                            <label>Campaign Code</label>
                                            <input
                                                type="text"
                                                required
                                                className="text-uppercase"
                                                value={couponForm.code}
                                                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                                placeholder="e.g. FESTIVE50"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="sheet-field-group">
                                            <label>Reward Type</label>
                                            <select
                                                value={couponForm.discountType}
                                                onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="sheet-field-group">
                                            <label>Reward Value</label>
                                            <input
                                                type="number"
                                                required
                                                value={couponForm.discountValue}
                                                onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                                placeholder="e.g. 10"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="sheet-field-group">
                                            <label>Min. Basket Size (₹)</label>
                                            <input
                                                type="number"
                                                value={couponForm.minOrderAmount}
                                                onChange={e => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                                                placeholder="0 for no limit"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="sheet-field-group">
                                            <label>Max. Cap (₹)</label>
                                            <input
                                                type="number"
                                                value={couponForm.maxDiscount}
                                                onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                                                placeholder="Leave empty for unlimited"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="sheet-field-group">
                                            <label>Expiration Date</label>
                                            <input
                                                type="date"
                                                value={couponForm.expiresAt}
                                                onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="sheet-field-group">
                                            <label>Global Usage Limit</label>
                                            <input
                                                type="number"
                                                value={couponForm.usageLimit}
                                                onChange={e => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                                                placeholder="0 for infinite"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="sheet-toggle-card py-2 px-3">
                                            <div className="form-check form-switch m-0">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="freeShip"
                                                    checked={couponForm.freeShipping}
                                                    onChange={e => setCouponForm({ ...couponForm, freeShipping: e.target.checked })}
                                                />
                                            </div>
                                            <label className="fw-bold text-primary small mb-0 ms-2" htmlFor="freeShip">Include Complimentary Shipping</label>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="sheet-toggle-card py-2 px-3 bg-opacity-50">
                                            <div className="form-check form-switch m-0">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="couponActive"
                                                    checked={couponForm.isActive}
                                                    onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                                                />
                                            </div>
                                            <label className="fw-bold text-primary small mb-0 ms-2" htmlFor="couponActive">Campaign Status: {couponForm.isActive ? 'Active' : 'Paused'}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-sheet-footer">
                                <button type="submit" className="btn-sheet-primary" disabled={isSavingCoupon}>
                                    {isSavingCoupon ? 'PROCESSING CAMPAIGN...' : (selectedCoupon ? 'UPDATE REWARD RULES' : 'INITIATE NEW CAMPAIGN')}
                                </button>
                                <button type="button" className="btn-sheet-secondary" onClick={() => setShowCouponModal(false)}>
                                    DISCARD CONFIGURATION
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Confirmation Modal */}
            {confirmModal.show && (
                <div className="admin-sheet-overlay">
                    <div className="admin-sheet-container admin-sheet-confirm">
                        <div className="admin-sheet-header">
                            <div className="header-left">
                                <span className="sheet-label text-danger">CONFIRM ACTION</span>
                                <h2 className="sheet-title">{confirmModal.title}</h2>
                            </div>
                            <button className="btn-close-sheet" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-sheet-body p-4 text-center">
                            <div className="confirm-icon-wrapper mb-4">
                                <AlertTriangle size={48} className="text-danger" />
                            </div>
                            <p className="font-body text-muted lh-base">{confirmModal.message}</p>
                        </div>
                        <div className="admin-sheet-footer">
                            <button
                                className="btn-sheet-danger"
                                onClick={() => {
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                    setConfirmModal({ ...confirmModal, show: false });
                                }}
                            >
                                CONFIRM & EXECUTE
                            </button>
                            <button className="btn-sheet-secondary" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                ABORT ACTION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


/* --- SUB-COMPONENTS --- */

const OverviewTab = ({ setActiveTab, orders = [] }) => {
    const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, lowStock: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [userRes, orderRes, prodRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/users/stats`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/orders/stats`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
                ]);
                const lowStockCount = prodRes.data.filter(p => p.stock < 10).length;
                setStats({
                    users: userRes.data.totalUsers,
                    orders: orderRes.data.totalOrders,
                    revenue: orderRes.data.totalRevenue,
                    lowStock: lowStockCount
                });
            } catch (error) {
                console.error('Stats fetch error:', error);
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                }
            }
        };
        fetchStats();
    }, []);

    const avgOrderValue = orders.length > 0
        ? Math.round(orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) / orders.length)
        : 0;

    const kpis = [
        { label: 'Total Revenue', value: stats.revenue ? `₹${stats.revenue.toLocaleString()}` : '₹0', icon: CreditCard, color: '#6BB252', bg: '#f1f8ee' },
        { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: '#364127', bg: '#eff3ef' },
        { label: 'Avg. Order Value', value: `₹${avgOrderValue.toLocaleString()}`, icon: TrendingUp, color: '#8B5CF6', bg: '#f3f0ff' },
        { label: 'Customers', value: stats.users, icon: UserPlus, color: '#a3be4c', bg: '#f1f6ef' },
        { label: 'Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: '#F95F09', bg: '#fff5f0' }
    ];

    const trendingProducts = [
        { name: 'Al-Madina Ajwa', category: 'Premium Dates', sold: '248 Sold', price: '₹1,250', img: '/Reference/images/product-thumb-1.png', tag: 'BEST SELLER' },
        { name: 'Medjool Jumbo', category: 'Specialty Dates', sold: '192 Sold', price: '₹1,800', img: '/Reference/images/product-thumb-3.png', tag: 'TRENDING' },
        { name: 'Sukkari Gold', category: 'Organic Dates', sold: '156 Sold', price: '₹950', img: '/Reference/images/product-thumb-10.png', tag: 'NEW' },
        { name: 'Premium Walnuts', category: 'Dry Fruits', sold: '112 Sold', price: '₹750', img: '/Reference/images/product-thumb-14.png', tag: 'POPULAR' }
    ];

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 extra-small fw-bold border border-success border-opacity-20 d-flex align-items-center gap-1">
                            <div className="rounded-circle bg-success" style={{ width: 6, height: 6 }}></div> LIVE SYSTEM STATUS
                        </div>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Management Overview</h2>
                    <p className="font-body text-muted small mt-1">Real-time performance analytics for AR Rahman Dates and Nuts.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-white border fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm"> <Download size={16} /> Download Report</button>
                    <button className="btn btn-primary text-white fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm border-0" onClick={() => setActiveTab('Products')}> <Plus size={16} /> Add Product</button>
                </div>
            </div>

            <div className="row g-4 mb-5">
                {kpis.map((kpi, idx) => (
                    <div className="col-6 col-lg" key={idx}>
                        <div className="kpi-card-border shadow-sm bg-white p-4 rounded-4 h-100 border-opacity-50 border">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="kpi-icon-square" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                                    <kpi.icon size={26} />
                                </div>
                                <div className="text-success extra-small fw-bold d-flex align-items-center gap-1">
                                    <TrendingUp size={12} /> +12.5%
                                </div>
                            </div>
                            <p className="admin-label-sm text-muted text-uppercase mb-1 fw-bold extra-small font-label" style={{ letterSpacing: '1px' }}>{kpi.label}</p>
                            <h3 className="font-headline fw-bold text-primary mb-0 fs-3">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="bg-white p-4 rounded-4 shadow-sm border border-opacity-50 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-5 px-2">
                            <div>
                                <h4 className="font-headline fs-5 text-primary fw-bold mb-0">Sales Momentum</h4>
                                <p className="text-muted extra-small fw-bold mb-0 uppercase opacity-75">ORDER VOLUME OVER 12 MONTHS</p>
                            </div>
                            <div className="d-flex gap-2 bg-light p-1 rounded-pill border">
                                <button className="btn btn-sm text-muted rounded-pill px-3 extra-small fw-bold border-0 font-label">WEEKLY</button>
                                <button className="btn btn-sm btn-primary rounded-pill px-3 extra-small fw-bold shadow-sm border-0 font-label">MONTHLY</button>
                            </div>
                        </div>
                        <div className="d-flex align-items-end gap-3 p-3 sales-chart-container" style={{ height: '320px' }}>
                            {[40, 55, 45, 70, 85, 65, 95, 60, 75, 50, 80, 90].map((h, i) => (
                                <div key={i} className={`flex-grow-1 rounded-top sales-bar ${i === 6 ? 'highlight' : ''}`} style={{ height: `${h}%`, transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-between extra-small text-muted fw-bold mt-3 px-2 font-label" style={{ letterSpacing: '1px' }}>
                            <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                            <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="bg-white p-4 rounded-4 shadow-sm border border-opacity-50 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-opacity-10">
                            <h4 className="font-headline fs-5 text-primary fw-bold mb-0">Executive Selection</h4>
                            <Star size={18} className="text-secondary" />
                        </div>
                        <div className="d-flex flex-column gap-4 mt-4">
                            {trendingProducts.map((prod, i) => (
                                <div className="d-flex align-items-center gap-3 p-2 rounded-4 hover-bg-light transition-all cursor-pointer border border-transparent hover-border-light" key={i}>
                                    <div className="cat-thumb-mini shadow-sm border border-opacity-50 overflow-hidden rounded-4 flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                        <img src={prod.img} alt={prod.name} className="w-100 h-100 object-fit-cover" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="font-body fw-bold text-primary mb-0 small">{prod.name}</h6>
                                            <span className="font-headline fw-bold text-secondary small">{prod.price}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <small className="text-muted extra-small fw-bold uppercase opacity-75">{prod.category}</small>
                                            <span className="badge bg-success bg-opacity-10 text-success extra-small fw-bold px-2 py-1 rounded-pill">{prod.tag}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-outline-primary border-2 fw-bold extra-small mt-5 w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 transition-all hover-invert font-label" onClick={() => setActiveTab('Products')}>
                            <Plus size={14} /> VIEW ALL INVENTORY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductsTab = ({ showToast, setConfirmModal }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [openCategory, setOpenCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStock, setFilterStock] = useState('All');
    const [prodForm, setProdForm] = useState({
        name: '', description: '', category: '', price: '', originalPrice: '',
        flashSale: false, discount: '', stock: '', isBestSeller: false,
        isTopRated: false, isFeatured: false, color: '', weight: '',
        unit: 'gram', availableWeights: [], nutrition: {}, isActive: true
    });
    const [customVar, setCustomVar] = useState('');
    const [varPrice, setVarPrice] = useState('');
    const [varOriginalPrice, setVarOriginalPrice] = useState('');
    const [editId, setEditId] = useState(null);
    const [files, setFiles] = useState([]);
    const [catFile, setCatFile] = useState(null);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [inventoryStats, setInventoryStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, bestSellers: 0 });

    const [catForm, setCatForm] = useState({ name: '', description: '', image: '', parent: '', isActive: true });
    const [editCatId, setEditCatId] = useState(null);

    const firstInputRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/products?admin=true`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/cms/categories?admin=true`)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (products.length > 0) {
            setInventoryStats({
                total: products.length,
                lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
                outOfStock: products.filter(p => p.stock === 0).length,
                bestSellers: products.filter(p => p.isBestSeller).length
            });
        }
    }, [products]);

    useEffect(() => {
        if ((view !== 'list') && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [view]);

    const validateProductForm = () => {
        const errors = {};
        if (!prodForm.name) errors.name = 'Product name is required';
        if (!prodForm.category) errors.category = 'Department is required';
        if (!prodForm.description) errors.description = 'Description is required';
        if (!prodForm.price) errors.price = 'Base price is required';
        if (!prodForm.weight) errors.weight = 'Weight is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateCategoryForm = () => {
        const errors = {};
        if (!catForm.name) errors.name = 'Category name is required';
        if (view === 'addCategory' && !catFile) errors.image = 'Thumbnail image is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete Product',
            message: 'Are you sure you want to permanently delete this product from the inventory?',
            onConfirm: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
                    showToast('Product deleted successfully');
                    fetchData();
                } catch (error) { showToast('Delete failed: ' + error.message, 'error'); }
            }
        });
    };

    const handleDeleteCategory = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete Category',
            message: 'Deleting this category might affect associated products. Continue?',
            onConfirm: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/cms/categories/${id}`);
                    showToast('Category deleted successfully');
                    fetchData();
                } catch (error) { showToast('Delete failed: ' + error.message, 'error'); }
            }
        });
    };

    const handleEditCategory = (cat) => {
        setCatForm({
            name: cat.name,
            description: cat.description || '',
            parent: cat.parent || '',
            isActive: cat.isActive !== false
        });
        setEditCatId(cat._id);
        setView('editCategory');
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!validateCategoryForm()) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', catForm.name);
            formData.append('description', catForm.description);
            formData.append('parent', catForm.parent);
            formData.append('isActive', catForm.isActive);
            if (catFile) formData.append('image', catFile);
            await axios.post(`${import.meta.env.VITE_API_URL}/api/cms/categories`, formData);
            showToast('Category created successfully!');
            setView('list');
            fetchData();
        } catch (error) { showToast('Category failed: ' + error.message, 'error'); } finally { setIsSaving(false); }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!validateCategoryForm()) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', catForm.name);
            formData.append('description', catForm.description);
            formData.append('parent', catForm.parent);
            formData.append('isActive', catForm.isActive);
            if (catFile) formData.append('image', catFile);
            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/categories/${editCatId}`, formData);
            showToast('Category updated!');
            setView('list');
            fetchData();
        } catch (error) { showToast('Update failed: ' + error.message, 'error'); } finally { setIsSaving(false); }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!validateProductForm()) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(prodForm).forEach(key => {
                if (key === 'availableWeights' || key === 'nutrition') {
                    formData.append(key, JSON.stringify(prodForm[key]));
                } else {
                    formData.append(key, prodForm[key]);
                }
            });
            files.forEach(f => formData.append('images', f));
            if (view === 'editProduct') {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editId}`, formData);
                showToast('Product updated!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData);
                showToast('Product created!');
            }
            setView('list');
            fetchData();
        } catch (error) { showToast('Save failed: ' + error.message, 'error'); } finally { setIsSaving(false); }
    };

    const handleCustomVarChange = (val) => {
        setCustomVar(val);
        if (!prodForm.weight || !prodForm.price) return;
        const ratio = (parseFloat(val) || 0) / (parseFloat(prodForm.weight) || 1);
        setVarOriginalPrice(Math.round((prodForm.originalPrice || prodForm.price) * ratio));
    };

    const addVariation = () => {
        if (!customVar) return;
        const newVar = { value: customVar, price: Number(varPrice || prodForm.price) };
        if (varOriginalPrice) newVar.originalPrice = Number(varOriginalPrice);
        setProdForm({ ...prodForm, availableWeights: [...(prodForm.availableWeights || []), newVar] });
        setCustomVar(''); setVarPrice(''); setVarOriginalPrice('');
    };

    const promoteToPrimary = (idx) => {
        const v = prodForm.availableWeights[idx];
        const newList = [...prodForm.availableWeights];
        newList[idx] = { value: `${prodForm.weight}${prodForm.unit}`, price: prodForm.price, originalPrice: prodForm.originalPrice };
        setProdForm({ ...prodForm, weight: parseFloat(v.value), price: v.price, originalPrice: v.originalPrice || '', availableWeights: newList });
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    const globalSearchResults = products.filter(p => 
        searchQuery !== '' && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        (filterStock === 'All' || (filterStock === 'Low' && p.stock > 0 && p.stock < 10) || (filterStock === 'Out' && p.stock === 0))
    );

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                <div>
                    <div className="bg-secondary bg-opacity-10 text-primary rounded-pill px-3 py-1 extra-small fw-bold border mb-2 d-inline-block font-label">
                        <Package size={12} className="me-1" /> INVENTORY HUB
                    </div>
                    <h2 className="fw-bold text-primary m-0">Products & Categories</h2>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => setShowBulkImport(!showBulkImport)} className="btn btn-white border rounded-pill px-4 fw-bold extra-small">Bulk Import</button>
                    <button onClick={() => { setCatForm({ name: '', description: '', image: '', parent: '', isActive: true }); setView('addCategory'); }} className="btn btn-white border rounded-pill px-4 fw-bold extra-small">Add Category</button>
                    <button onClick={() => { setProdForm({ name: '', description: '', category: '', price: '', stock: '', isActive: true }); setView('addProduct'); }} className="btn btn-primary rounded-pill px-4 fw-bold extra-small shadow-md">Add New Product</button>
                </div>
            </div>

            {(view === 'addProduct' || view === 'editProduct') ? (
                <div className="bg-white rounded-5 shadow-sm border p-4 p-md-5 animate-fade-in">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <h4 className="fw-bold text-primary m-0 font-headline">{view === 'editProduct' ? 'Edit Product' : 'Add New Product'}</h4>
                        <button className="btn btn-light rounded-pill px-4 fw-bold d-flex align-items-center gap-2" onClick={() => { setView('list'); setEditId(null); setFiles([]); setFormErrors({}); }}>
                            <ArrowLeft size={16} /> Back to List
                        </button>
                    </div>
                    <form onSubmit={handleCreateProduct}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">Product Name *</label>
                                <input ref={firstInputRef} type="text" className={`form-control rounded-4 py-3 ${formErrors.name ? 'is-invalid' : ''}`} placeholder="e.g. Premium Ajwa Dates" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} />
                                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">Category *</label>
                                <select className={`form-select rounded-4 py-3 ${formErrors.category ? 'is-invalid' : ''}`} value={prodForm.category} onChange={e => setProdForm({ ...prodForm, category: e.target.value })}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                                {formErrors.category && <div className="invalid-feedback">{formErrors.category}</div>}
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted">Description *</label>
                                <textarea className={`form-control rounded-4 py-3 ${formErrors.description ? 'is-invalid' : ''}`} rows="3" placeholder="Product description..." value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} />
                                {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-muted">Price (₹) *</label>
                                <input type="number" className={`form-control rounded-4 py-3 ${formErrors.price ? 'is-invalid' : ''}`} placeholder="e.g. 1250" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} />
                                {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-muted">Original Price (₹)</label>
                                <input type="number" className="form-control rounded-4 py-3" placeholder="e.g. 1500 (MRP)" value={prodForm.originalPrice} onChange={e => setProdForm({ ...prodForm, originalPrice: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-muted">Weight *</label>
                                <input type="number" className={`form-control rounded-4 py-3 ${formErrors.weight ? 'is-invalid' : ''}`} placeholder="e.g. 500" value={prodForm.weight} onChange={e => setProdForm({ ...prodForm, weight: e.target.value })} />
                                {formErrors.weight && <div className="invalid-feedback">{formErrors.weight}</div>}
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-muted">Unit</label>
                                <select className="form-select rounded-4 py-3" value={prodForm.unit} onChange={e => setProdForm({ ...prodForm, unit: e.target.value })}>
                                    <option value="gram">Gram (g)</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="ml">Millilitre (ml)</option>
                                    <option value="litre">Litre (L)</option>
                                    <option value="piece">Piece</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">Stock Quantity</label>
                                <input type="number" className="form-control rounded-4 py-3" placeholder="e.g. 100" value={prodForm.stock} onChange={e => setProdForm({ ...prodForm, stock: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">Discount (%)</label>
                                <input type="number" className="form-control rounded-4 py-3" placeholder="e.g. 10" value={prodForm.discount} onChange={e => setProdForm({ ...prodForm, discount: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">Color Tag</label>
                                <input type="text" className="form-control rounded-4 py-3" placeholder="e.g. Dark Brown" value={prodForm.color} onChange={e => setProdForm({ ...prodForm, color: e.target.value })} />
                            </div>

                            {/* Weight Variations */}
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted">Weight Variations</label>
                                <div className="bg-light rounded-4 p-3 border">
                                    <div className="d-flex gap-2 flex-wrap mb-3">
                                        {(prodForm.availableWeights || []).map((v, idx) => (
                                            <div key={idx} className="badge bg-white border text-primary fw-bold px-3 py-2 d-flex align-items-center gap-2 rounded-pill">
                                                {typeof v === 'object' ? `${v.value} — ₹${v.price}` : v}
                                                <button type="button" className="btn-close" style={{ fontSize: '8px' }} onClick={() => {
                                                    const newWeights = [...prodForm.availableWeights];
                                                    newWeights.splice(idx, 1);
                                                    setProdForm({ ...prodForm, availableWeights: newWeights });
                                                }}></button>
                                                <button type="button" className="btn btn-sm btn-link text-primary p-0 ms-1" title="Promote to Primary" onClick={() => promoteToPrimary(idx)}>
                                                    <ArrowUpCircle size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="d-flex gap-2 align-items-end flex-wrap">
                                        <input type="text" className="form-control form-control-sm rounded-pill" style={{ maxWidth: '120px' }} placeholder="Weight (e.g. 1000)" value={customVar} onChange={e => handleCustomVarChange(e.target.value)} />
                                        <input type="number" className="form-control form-control-sm rounded-pill" style={{ maxWidth: '120px' }} placeholder="Price" value={varPrice} onChange={e => setVarPrice(e.target.value)} />
                                        <input type="number" className="form-control form-control-sm rounded-pill" style={{ maxWidth: '120px' }} placeholder="Original Price" value={varOriginalPrice} onChange={e => setVarOriginalPrice(e.target.value)} />
                                        <button type="button" className="btn btn-sm btn-primary rounded-pill px-3" onClick={addVariation}><Plus size={14} /> Add</button>
                                    </div>
                                </div>
                            </div>

                            {/* Flags */}
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted">Product Flags</label>
                                <div className="d-flex gap-4 flex-wrap bg-light rounded-4 p-3 border">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={prodForm.isBestSeller} onChange={e => setProdForm({ ...prodForm, isBestSeller: e.target.checked })} />
                                        <label className="form-check-label small fw-bold">Best Seller</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={prodForm.isFeatured} onChange={e => setProdForm({ ...prodForm, isFeatured: e.target.checked })} />
                                        <label className="form-check-label small fw-bold">Featured</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={prodForm.isTopRated} onChange={e => setProdForm({ ...prodForm, isTopRated: e.target.checked })} />
                                        <label className="form-check-label small fw-bold">Top Rated</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={prodForm.flashSale} onChange={e => setProdForm({ ...prodForm, flashSale: e.target.checked })} />
                                        <label className="form-check-label small fw-bold">Flash Sale</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={prodForm.isActive} onChange={e => setProdForm({ ...prodForm, isActive: e.target.checked })} />
                                        <label className="form-check-label small fw-bold">Active</label>
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted">Product Images</label>
                                <div className="bg-light rounded-4 p-4 border text-center">
                                    <input type="file" multiple accept="image/*" className="form-control rounded-4" onChange={e => setFiles(Array.from(e.target.files))} />
                                    {files.length > 0 && (
                                        <div className="d-flex gap-2 mt-3 flex-wrap">
                                            {files.map((f, idx) => (
                                                <div key={idx} className="position-relative">
                                                    <img src={URL.createObjectURL(f)} className="rounded-3 border shadow-sm" style={{ width: 60, height: 60, objectFit: 'cover' }} alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-3 justify-content-end mt-5 pt-4 border-top">
                            <button type="button" className="btn btn-light rounded-pill px-5 py-3 fw-bold" onClick={() => { setView('list'); setEditId(null); setFiles([]); setFormErrors({}); }}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-md" disabled={isSaving}>
                                {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : (view === 'editProduct' ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </form>
                </div>

            ) : (view === 'addCategory' || view === 'editCategory') ? (
                <div className="bg-white rounded-5 shadow-sm border p-4 p-md-5 animate-fade-in">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <h4 className="fw-bold text-primary m-0 font-headline">{view === 'editCategory' ? 'Edit Category' : 'Add New Category'}</h4>
                        <button className="btn btn-light rounded-pill px-4 fw-bold d-flex align-items-center gap-2" onClick={() => { setView('list'); setEditCatId(null); setCatFile(null); setFormErrors({}); }}>
                            <ArrowLeft size={16} /> Back to List
                        </button>
                    </div>
                    <form onSubmit={view === 'editCategory' ? handleUpdateCategory : handleCreateCategory}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">Category Name *</label>
                                <input ref={firstInputRef} type="text" className={`form-control rounded-4 py-3 ${formErrors.name ? 'is-invalid' : ''}`} placeholder="e.g. Premium Dates" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
                                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">Parent Category (Optional)</label>
                                <select className="form-select rounded-4 py-3" value={catForm.parent} onChange={e => setCatForm({ ...catForm, parent: e.target.value })}>
                                    <option value="">None (Top-Level)</option>
                                    {categories.filter(c => !c.parent).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted">Description</label>
                                <textarea className="form-control rounded-4 py-3" rows="3" placeholder="Category description..." value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">Thumbnail Image {view === 'addCategory' ? '*' : ''}</label>
                                <input type="file" accept="image/*" className={`form-control rounded-4 py-3 ${formErrors.image ? 'is-invalid' : ''}`} onChange={e => setCatFile(e.target.files[0])} />
                                {formErrors.image && <div className="invalid-feedback">{formErrors.image}</div>}
                                {catFile && (
                                    <div className="mt-2">
                                        <img src={URL.createObjectURL(catFile)} className="rounded-3 border shadow-sm" style={{ width: 80, height: 80, objectFit: 'cover' }} alt="preview" />
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6 d-flex align-items-end">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" checked={catForm.isActive} onChange={e => setCatForm({ ...catForm, isActive: e.target.checked })} />
                                    <label className="form-check-label small fw-bold">Active & Visible</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-3 justify-content-end mt-5 pt-4 border-top">
                            <button type="button" className="btn btn-light rounded-pill px-5 py-3 fw-bold" onClick={() => { setView('list'); setEditCatId(null); setCatFile(null); setFormErrors({}); }}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-md" disabled={isSaving}>
                                {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : (view === 'editCategory' ? 'Update Category' : 'Create Category')}
                            </button>
                        </div>
                    </form>
                </div>

            ) : showBulkImport ? (
                <BulkUploadTab onComplete={() => { setShowBulkImport(false); fetchData(); }} showToast={showToast} setConfirmModal={setConfirmModal} />
            ) : (
                <React.Fragment>
                    <div className="row g-3 mb-5">
                        <div className="col-lg-3 col-6">
                            <div className="bg-white p-4 rounded-4 shadow-sm border">
                                <span className="extra-small fw-bold text-muted uppercase font-label">Total SKUs</span>
                                <h3 className="fw-bold text-primary m-0 mt-2">{inventoryStats.total}</h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="bg-white p-4 rounded-4 shadow-sm border">
                                <span className="extra-small fw-bold text-danger uppercase font-label">Low Stock</span>
                                <h3 className="fw-bold text-danger m-0 mt-2">{inventoryStats.lowStock}</h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="bg-white p-4 rounded-4 shadow-sm border">
                                <span className="extra-small fw-bold text-secondary uppercase font-label">Best Sellers</span>
                                <h3 className="fw-bold text-secondary m-0 mt-2">{inventoryStats.bestSellers}</h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="bg-white p-4 rounded-4 shadow-sm border">
                                <span className="extra-small fw-bold text-success uppercase font-label">Collections</span>
                                <h3 className="fw-bold text-success m-0 mt-2">{categories.length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 d-flex flex-wrap gap-4 align-items-center">
                        <div className="d-flex align-items-center bg-light rounded-pill px-4 py-2 flex-grow-1 border">
                            <Search size={18} className="text-muted" />
                            <input type="text" className="border-0 bg-transparent ms-2 w-100 outline-none fw-bold" placeholder="Search by name, SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="d-flex gap-3">
                            <select className="form-select border-0 bg-light rounded-pill px-4 py-2 fw-bold" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                            <select className="form-select border-0 bg-light rounded-pill px-4 py-2 fw-bold" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
                                <option value="All">All Stock</option>
                                <option value="Low">Low Stock</option>
                                <option value="Out">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    {searchQuery && globalSearchResults.length > 0 ? (
                        <div className="mb-5 animate-fade-in search-results-focus">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h6 className="fw-bold text-primary m-0">
                                    <Search size={16} className="me-2" />
                                    Global Search Results ({globalSearchResults.length})
                                </h6>
                                <button className="btn btn-sm btn-link text-muted extra-small fw-bold text-decoration-none" onClick={() => setSearchQuery('')}>CLEAR SEARCH</button>
                            </div>
                            <div className="table-responsive rounded-4 border bg-white shadow-sm">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr className="extra-small text-muted uppercase fw-bold font-label">
                                            <th className="ps-4">Product</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {globalSearchResults.map(prod => (
                                            <tr key={prod._id}>
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img src={prod.image?.startsWith('http') ? prod.image : `${import.meta.env.VITE_API_URL}${prod.image}`} className="rounded-3 border" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                                        <div>
                                                            <div className="fw-bold text-primary">{prod.name}</div>
                                                            <div className="extra-small text-muted">{prod.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-bold">₹{prod.price}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="progress rounded-pill bg-light w-50" style={{ height: 6 }}>
                                                            <div className={`progress-bar rounded-pill ${prod.stock < 10 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${Math.min((prod.stock / 50) * 100, 100)}%` }}></div>
                                                        </div>
                                                        <span className="extra-small fw-bold">{prod.stock}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => { setProdForm({ ...prod }); setEditId(prod._id); setView('editProduct'); }}>Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="accordion admin-accordion d-flex flex-column gap-4 mt-5" id="categoryInventory">
                        {categories
                            .filter(c => filterCategory === 'All' || c.name === filterCategory)
                            .map((cat, idx) => {
                                const catProducts = products.filter(p => p.category === cat.name && (filterStock === 'All' || (filterStock === 'Low' && p.stock > 0 && p.stock < 10) || (filterStock === 'Out' && p.stock === 0)));
                                const lowStockInCat = catProducts.filter(p => p.stock < 10).length;
                                const subCats = categories.filter(c => c.parent === cat._id);
                                const isOpen = openCategory === cat._id;

                                return (
                                    <div className={`accordion-item border-0 rounded-5 overflow-hidden shadow-sm transition-all ${isOpen ? 'active shadow-lg' : ''}`} key={cat._id}>
                                        <div className={`accordion-header d-flex align-items-center p-3 transition-all ${isOpen ? 'bg-primary text-white' : 'bg-white'}`}>
                                            <button 
                                                className={`btn border-0 text-start flex-grow-1 d-flex align-items-center gap-4 py-2 px-3 shadow-none ${isOpen ? 'text-white' : 'text-primary'}`} 
                                                type="button"
                                                onClick={() => setOpenCategory(isOpen ? null : cat._id)}
                                            >
                                                <div className="cat-thumb shadow-sm border border-opacity-10 rounded-4 overflow-hidden" style={{ width: '64px', height: '64px' }}>
                                                    <img src={(cat.image?.startsWith('http') || cat.image?.startsWith('/Reference') || cat.image?.startsWith('/images')) ? cat.image : `${import.meta.env.VITE_API_URL}${cat.image}`} alt="" className="w-100 h-100 object-fit-cover transition-all" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h4 className="fw-bold m-0 font-headline d-flex align-items-center gap-3">
                                                        {cat.name}
                                                        {!cat.isActive && <span className="badge bg-danger bg-opacity-10 text-danger border-danger border-opacity-20 extra-small fw-bold">HIDDEN</span>}
                                                    </h4>
                                                    <div className="d-flex gap-3 mt-2">
                                                        <span className={`badge fw-bold extra-small border d-flex align-items-center gap-2 font-label transition-all px-3 py-2 rounded-pill ${isOpen ? 'bg-white bg-opacity-10 text-white border-white border-opacity-20' : 'bg-secondary bg-opacity-10 text-primary border-primary border-opacity-10'}`}>
                                                            <Box size={12} /> {catProducts.length} PRODUCTS
                                                        </span>
                                                    {lowStockInCat > 0 && (
                                                        <span className={`badge fw-bold extra-small border d-flex align-items-center gap-2 font-label transition-all px-3 py-2 rounded-pill ${isOpen ? 'bg-danger text-white border-danger' : 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-20'}`}>
                                                            <AlertTriangle size={12} /> {lowStockInCat} ALERTS
                                                        </span>
                                                    )}
                                                    {subCats.length > 0 && (
                                                        <span className={`badge fw-bold extra-small border d-flex align-items-center gap-2 font-label transition-all px-3 py-2 rounded-pill ${isOpen ? 'bg-white bg-opacity-10 text-white border-white border-opacity-20' : 'bg-primary bg-opacity-5 text-primary border-primary border-opacity-10'}`}>
                                                            <Layers size={12} /> {subCats.length} SUB-GROUPS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown size={24} className={`transition-all me-2 ${isOpen ? 'rotate-180 text-white' : 'text-muted opacity-50'}`} />
                                        </button>
                                        <div className="d-flex gap-2 ms-4 border-start ps-4 border-opacity-10 align-items-center">
                                            <div className="form-check form-switch d-flex align-items-center me-2" title="Toggle Category Visibility">
                                                <input
                                                    className={`form-check-input cursor-pointer shadow-none ${isOpen ? 'border-white border-opacity-50 bg-white bg-opacity-20' : 'border-success'}`}
                                                    type="checkbox"
                                                    style={{ width: '2.5rem', height: '1.25rem' }}
                                                    checked={cat.isActive !== false}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.checked;
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append('name', cat.name);
                                                            formData.append('isActive', newStatus);
                                                            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/categories/${cat._id}`, formData);
                                                            fetchData();
                                                        } catch (err) { showToast('Status update failed', 'error'); }
                                                    }}
                                                />
                                            </div>
                                            <button className={`btn btn-sm rounded-circle p-3 shadow-sm transition-all border ${isOpen ? 'btn-outline-light border-white border-opacity-30' : 'btn-white border-opacity-10'}`} onClick={() => handleEditCategory(cat)} title="Edit Category"> <Edit size={16} /> </button>
                                            <button className={`btn btn-sm rounded-circle p-3 shadow-sm transition-all border ${isOpen ? 'btn-danger text-white border-danger' : 'btn-white border-opacity-10 text-danger'}`} onClick={() => handleDeleteCategory(cat._id)} title="Delete Category"> <Trash size={16} /> </button>
                                    </div>
                                </div>
                                {isOpen && (
                                    <div className="accordion-body p-0 border-top bg-light bg-opacity-10 p-4">
                                                {/* Nested Sub-categories List */}
                                                {subCats.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="extra-small text-muted fw-bold mb-3 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Nested Sub-collections</label>
                                                        <div className="row g-3">
                                                            {subCats.map(sc => (
                                                                <div className="col-md-4" key={sc._id}>
                                                                    <div className="bg-white p-3 rounded-4 border border-opacity-50 d-flex align-items-center justify-content-between shadow-sm hover-shadow-md transition-all">
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div className="cat-thumb-mini border rounded-3 overflow-hidden" style={{ width: '40px', height: '40px' }}>
                                                                                <img src={(sc.image?.startsWith('http') || sc.image?.startsWith('/Reference') || sc.image?.startsWith('/images')) ? sc.image : `${import.meta.env.VITE_API_URL}${sc.image}`} alt="" className="w-100 h-100 object-fit-cover" />
                                                                            </div>
                                                                            <span className="fw-bold small text-primary">{sc.name}</span>
                                                                        </div>
                                                                        <div className="d-flex gap-1">
                                                                            <button className="btn btn-sm p-1 text-primary" onClick={(e) => { e.stopPropagation(); handleEditCategory(sc); }} title="Edit Sub-category"><Edit size={14} /></button>
                                                                            <button className="btn btn-sm p-1 text-danger" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(sc._id); }} title="Delete Sub-category"><Trash size={14} /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <hr className="my-4 opacity-5" />
                                                    </div>
                                                )}

                                                <label className="extra-small text-muted fw-bold mb-3 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Products in {cat.name}</label>
                                                <div className="table-responsive rounded-5 border bg-white overflow-hidden shadow-sm border-opacity-50 products-table-wrap">
                                                    <table className="table table-hover align-middle mb-0 products-table">
                                                        <thead className="bg-light bg-opacity-50 border-bottom border-opacity-10">
                                                            <tr className="extra-small text-muted uppercase fw-bold font-label" style={{ letterSpacing: '2px' }}>
                                                                <th className="ps-4 py-3">Digital Asset / Name</th>
                                                                <th>Price / Val</th>
                                                                <th>Warehouse Inventory</th>
                                                                <th className="text-center">Status</th>
                                                                <th className="text-center">Control</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {catProducts.length === 0 ? (
                                                                <tr><td colSpan="5" className="text-center py-5 text-muted small italic opacity-50">No matching assets in this catalog department.</td></tr>
                                                            ) : catProducts.map(prod => (
                                                                <tr key={prod._id} className="transition-all hover-scale-xs">
                                                                    <td className="ps-4 py-4" data-label="Product">
                                                                        <div className="d-flex align-items-center gap-4">
                                                                            <div className="position-relative">
                                                                                <img 
                                                                                    src={(prod.image?.startsWith('http') || prod.image?.startsWith('/Reference') || prod.image?.startsWith('/images')) ? prod.image : `${import.meta.env.VITE_API_URL}${prod.image}`} 
                                                                                    className="cat-thumb-mini border border-opacity-50 rounded-4 shadow-sm transition-all hover-zoom" 
                                                                                    alt="" 
                                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                                                                />
                                                                                {prod.isFeatured && (
                                                                                    <div className="position-absolute top-0 start-0 translate-middle bg-warning rounded-circle p-1 shadow-sm border border-white" title="Featured Product">
                                                                                        <Star size={10} fill="white" className="text-white" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <div className="fw-bold fs-6 text-primary mb-1">{prod.name}</div>
                                                                                <div className="d-flex gap-2 align-items-center">
                                                                                    {prod.isBestSeller && <span className="badge bg-secondary text-primary extra-small fw-bold border-0" style={{ fontSize: '9px' }}>BEST SELLER</span>}
                                                                                    {prod.flashSale && <span className="badge bg-danger text-white extra-small fw-bold border-0" style={{ fontSize: '9px' }}>FLASH SALE</span>}
                                                                                    <span className="extra-small text-muted fw-bold opacity-50 uppercase font-label" style={{ fontSize: '10px' }}>ID: {prod._id.slice(-6)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td data-label="Price">
                                                                        <div className="d-flex flex-column">
                                                                            <span className="fw-bold fs-6 text-primary">₹{(prod.price || 0).toLocaleString()}</span>
                                                                            {prod.originalPrice > prod.price && (
                                                                                <span className="extra-small text-muted text-decoration-line-through fw-bold opacity-50">₹{prod.originalPrice.toLocaleString()}</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td data-label="Stock">
                                                                        <div className="d-flex flex-column gap-2" style={{ maxWidth: '180px' }}>
                                                                            <div className="d-flex justify-content-between align-items-center extra-small fw-bold font-label">
                                                                                <span className={prod.stock < 10 ? 'text-danger' : 'text-success'}>
                                                                                    {prod.stock === 0 ? 'OUT OF STOCK' : prod.stock < 10 ? 'CRITICAL STOCK' : 'IN STOCK'}
                                                                                </span>
                                                                                <span className="opacity-50">{prod.stock} UNITS</span>
                                                                            </div>
                                                                            <div className="progress rounded-pill bg-light border border-opacity-10" style={{ height: 6 }}>
                                                                                <div 
                                                                                    className={`progress-bar rounded-pill transition-all ${prod.stock === 0 ? 'bg-transparent' : prod.stock < 10 ? 'bg-danger shadow-sm' : 'bg-success shadow-sm'}`} 
                                                                                    role="progressbar" 
                                                                                    style={{ width: `${Math.min((prod.stock / 50) * 100, 100)}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-center" data-label="Status">
                                                                        <div className="d-flex flex-column align-items-center gap-2">
                                                                            <div className="form-check form-switch p-0 m-0" title="Toggle Product Visibility">
                                                                                <input
                                                                                    className="form-check-input cursor-pointer shadow-none border-success"
                                                                                    type="checkbox"
                                                                                    style={{ width: '2.4rem', height: '1.2rem', margin: 0 }}
                                                                                    checked={prod.isActive !== false}
                                                                                    onChange={async (e) => {
                                                                                        const newStatus = e.target.checked;
                                                                                        try {
                                                                                            const formData = new FormData();
                                                                                            formData.append('name', prod.name);
                                                                                            formData.append('isActive', newStatus);
                                                                                            await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${prod._id}`, formData);
                                                                                            fetchData();
                                                                                        } catch (err) { showToast('Status update failed', 'error'); }
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <span className={`extra-small fw-bold ${prod.isActive !== false ? 'text-success' : 'text-muted'}`}>
                                                                                {prod.isActive !== false ? 'VISIBLE' : 'HIDDEN'}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-center" data-label="Actions">
                                                                        <div className="d-flex justify-content-center gap-3">
                                                                            <button className="btn btn-sm btn-white border-opacity-10 shadow-sm p-3 rounded-4 hover-bg-primary hover-text-white transition-all group" onClick={() => {
                                                                                const nutritionObj = prod.nutrition ? (typeof prod.nutrition === 'object' && !(prod.nutrition instanceof Map) ? prod.nutrition : Object.fromEntries(prod.nutrition)) : {};
                                                                                setProdForm({
                                                                                    ...prod,
                                                                                    availableWeights: Array.isArray(prod.availableWeights) ? prod.availableWeights : (prod.availableWeights ? prod.availableWeights.split(',').map(w => w.trim()) : []),
                                                                                    nutrition: nutritionObj,
                                                                                    isActive: prod.isActive !== undefined ? prod.isActive : true
                                                                                });
                                                                                setEditId(prod._id);
                                                                                setView('editProduct');
                                                                            }} title="Edit Product Details">
                                                                                <Edit size={18} className="text-primary group-hover-white" />
                                                                            </button>
                                                                            <button className="btn btn-sm btn-white border-opacity-10 text-danger shadow-sm p-3 rounded-4 hover-bg-danger hover-text-white transition-all group" onClick={() => handleDelete(prod._id)} title="Permanently Delete Product">
                                                                                <Trash size={18} className="group-hover-white" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

const OrdersTab = ({ orders = [], fetchOrders, soundEnabled, setSoundEnabled, showToast, setConfirmModal, selectedOrder, setSelectedOrder, showModal, setShowModal }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, { status });
            fetchOrders();
            showToast('Order status updated');
        } catch (error) { showToast('Order status update failed', 'error'); }
    };

    const handleDeleteOrder = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete Order',
            message: 'Are you sure you want to delete this order? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/orders/${id}`);
                    fetchOrders();
                    showToast('Order deleted successfully');
                } catch (error) {
                    console.error('Delete order error:', error);
                    showToast('Failed to delete order: ' + (error.response?.data?.message || error.message), 'error');
                }
            }
        });
    };

    const generateInvoice = (order) => {
        const doc = new jsPDF();

        // Header Branding
        doc.setFillColor(54, 65, 39);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('AR RAHMAN', 20, 26);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('DATES AND NUTS - PREMIUM QUALITY', 20, 32);

        doc.setFontSize(14);
        doc.text('TAX INVOICE', 190, 28, { align: 'right' });

        // Invoice Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE TO:', 20, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(`${order.shippingAddress?.name || 'Valued Customer'}`, 20, 65);
        doc.text(`${order.shippingAddress?.line1 || ''}`, 20, 70);
        doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`, 20, 75);
        doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 20, 80);

        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE DETAILS:', 190, 60, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice ID: #INV-${order._id.substring(order._id.length - 8).toUpperCase()}`, 190, 65, { align: 'right' });
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 190, 70, { align: 'right' });
        doc.text(`Status: ${order.isPaid ? 'PAID' : 'PENDING'}`, 190, 75, { align: 'right' });

        // Table
        const tableColumn = ["Product Description", "Variant", "Price", "Qty", "Total"];
        const tableRows = order.orderItems.map(item => [
            item.name,
            item.variant || 'Standard',
            `Rs. ${item.price.toLocaleString()}`,
            item.qty,
            `Rs. ${(item.price * item.qty).toLocaleString()}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 95,
            theme: 'striped',
            headStyles: {
                fillColor: [54, 65, 39],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' },
                1: { halign: 'center' }
            }
        });

        // Financials
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const summaryX = 140;
        doc.text('Subtotal:', summaryX, finalY);
        doc.text(`Rs. ${order.itemsPrice.toLocaleString()}`, 190, finalY, { align: 'right' });

        doc.text('Shipping Fee:', summaryX, finalY + 7);
        doc.text(`Rs. ${order.deliveryPrice.toLocaleString()}`, 190, finalY + 7, { align: 'right' });

        if (order.discountAmount > 0) {
            doc.text('Discount:', summaryX, finalY + 14);
            doc.text(`- Rs. ${order.discountAmount.toLocaleString()}`, 190, finalY + 14, { align: 'right' });
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(54, 65, 39);
        doc.text('GRAND TOTAL:', summaryX, finalY + 27);
        doc.text(`Rs. ${order.totalPrice.toLocaleString()}`, 190, finalY + 27, { align: 'right' });

        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('This is a computer generated invoice. No signature required.', 105, pageHeight - 15, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for shopping with AR Rahman Dates and Nuts!', 105, pageHeight - 10, { align: 'center' });

        doc.save(`AR_Rahman_Invoice_${order._id.substring(order._id.length - 8).toUpperCase()}.pdf`);
    };

    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filtered = sortedOrders.filter(o => {
        const matchesSearch = o._id.toLowerCase().includes(searchQuery.toLowerCase()) || o.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' ? true : (o.status || 'Processing') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const paginatedOrders = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const orderStats = {
        total: orders.length,
        processing: orders.filter(o => (o.status || 'Processing') === 'Processing').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        cancelled: orders.filter(o => o.status === 'Cancelled').length,
        revenue: orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)
    };

    return (
        <div className="container-fluid p-0 animate-fade-in admin-orders-screen">
            <div className="admin-page-toolbar">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="admin-chip">
                            <ShoppingCart size={12} /> Order ERP
                        </div>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`admin-sound-toggle ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                            title={soundEnabled ? 'Disable Order Sound' : 'Enable Order Sound'}
                        >
                            {soundEnabled ? <Bell size={12} /> : <BellOff size={12} />}
                            {soundEnabled ? 'SOUND ON' : 'SOUND MUTED'}
                        </button>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Orders Management</h2>
                    {/* <p className="font-body text-muted small mt-1 mb-0">ERP-style fulfillment table for customer orders, payment status and shipment updates.</p> */}
                </div>
                <div className="admin-order-search">
                    <Search size={16} className="text-muted" />
                    <input
                        type="text"
                        className="border-0 bg-transparent ms-2 w-100 font-body outline-none fs-7 fw-bold"
                        placeholder="Quick find by Order ID or Recipient identity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-order-stats">
                <div className={`admin-order-stat-card cursor-pointer ${statusFilter === 'All' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('All')}>
                    <span>Total Orders</span><strong>{orderStats.total}</strong>
                </div>
                <div className={`admin-order-stat-card cursor-pointer ${statusFilter === 'Processing' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('Processing')}>
                    <span>Processing</span><strong>{orderStats.processing}</strong>
                </div>
                <div className={`admin-order-stat-card cursor-pointer ${statusFilter === 'Shipped' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('Shipped')}>
                    <span>Shipped</span><strong>{orderStats.shipped}</strong>
                </div>
                <div className={`admin-order-stat-card cursor-pointer ${statusFilter === 'Delivered' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('Delivered')}>
                    <span>Delivered</span><strong>{orderStats.delivered}</strong>
                </div>
                <div className={`admin-order-stat-card cursor-pointer ${statusFilter === 'Cancelled' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('Cancelled')}>
                    <span>Cancelled</span><strong>{orderStats.cancelled}</strong>
                </div>
                <div className="admin-order-stat-card"><span>Revenue</span><strong>₹{orderStats.revenue.toLocaleString()}</strong></div>
            </div>

            <div className="admin-erp-panel">
                <div className="admin-erp-table-wrap">
                    <table className="admin-erp-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="8" className="admin-empty-cell">No order records found.</td></tr>
                            ) : paginatedOrders.map(order => (
                                <tr key={order._id}>
                                    <td>
                                        <div className="admin-order-id">#{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                                        <div className="admin-muted-line">ID: {order._id.substring(0, 10)}</div>
                                    </td>
                                    <td>
                                        <div className="admin-customer-name">{order.shippingAddress?.name || 'Customer'}</div>
                                        <div className="admin-muted-line">{order.shippingAddress?.phone || 'No phone'} / {order.shippingAddress?.city || 'No city'}</div>
                                    </td>
                                    <td>
                                        <div className="admin-cell-strong">{order.orderItems?.length || 0} SKU</div>
                                        <div className="admin-muted-line">{order.orderItems?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0} units</div>
                                    </td>
                                    <td>
                                        <span className={`admin-payment-pill ${order.isPaid ? 'paid' : 'pending'}`}>{order.paymentMethod === 'COD' ? 'COD' : (order.paymentMethod || 'ONLINE')}</span>
                                        <div className="admin-muted-line mt-1">{order.isPaid ? 'Paid' : 'Pending'}</div>
                                    </td>
                                    <td><div className="admin-total-value">Rs. {Number(order.totalPrice || 0).toLocaleString()}</div></td>
                                    <td>
                                        <select
                                            className="admin-status-select"
                                            value={order.status || 'Processing'}
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="admin-cell-strong">{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                                        <div className="admin-muted-line">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button className="admin-icon-btn view" onClick={() => { setSelectedOrder(order); setShowModal(true); }} title="View order">
                                                <Eye size={15} />
                                            </button>
                                            <button className="admin-icon-btn invoice" onClick={() => generateInvoice(order)} title="Download invoice">
                                                <Download size={15} />
                                            </button>
                                            <button className="admin-icon-btn danger" onClick={() => handleDeleteOrder(order._id)} title="Delete order">
                                                <Trash size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Orders Pagination Footer */}
                {filtered.length > 0 && (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-4 bg-light border-top border-opacity-10">
                        <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                            <span className="font-label extra-small text-muted fw-bold">Rows per page:</span>
                            <select className="form-select form-select-sm border-opacity-25 shadow-sm rounded-pill fw-bold font-body" style={{ width: '80px' }} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <span className="font-label extra-small text-muted fw-bold">
                                Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
                            </span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-primary hover-text-white transition-all" style={{ width: '32px', height: '32px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <button className="btn btn-sm btn-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-primary hover-text-white transition-all" style={{ width: '32px', height: '32px' }} disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="admin-order-mobile-list">
                {filtered.length === 0 ? (
                    <div className="admin-mobile-empty">No order records found.</div>
                ) : paginatedOrders.map(order => (
                    <article key={order._id} className="admin-order-card">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div>
                                <div className="admin-order-id">#{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                                <div className="admin-muted-line">{new Date(order.createdAt).toLocaleString('en-IN')}</div>
                            </div>
                            <div className="admin-total-value">Rs. {Number(order.totalPrice || 0).toLocaleString()}</div>
                        </div>
                        <div className="admin-mobile-grid">
                            <div><span>Customer</span><strong>{order.shippingAddress?.name || 'Customer'}</strong></div>
                            <div><span>Items</span><strong>{order.orderItems?.length || 0} SKU</strong></div>
                            <div><span>Payment</span><strong>{order.paymentMethod === 'COD' ? 'COD' : (order.paymentMethod || 'ONLINE')}</strong></div>
                            <div><span>City</span><strong>{order.shippingAddress?.city || 'N/A'}</strong></div>
                        </div>
                        <select className="admin-status-select w-100 mt-3" value={order.status || 'Processing'} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <div className="admin-row-actions justify-content-end mt-3">
                            <button className="admin-icon-btn view" onClick={() => { setSelectedOrder(order); setShowModal(true); }}><Eye size={15} /></button>
                            <button className="admin-icon-btn invoice" onClick={() => generateInvoice(order)}><Download size={15} /></button>
                            <button className="admin-icon-btn danger" onClick={() => handleDeleteOrder(order._id)}><Trash size={15} /></button>
                        </div>
                    </article>
                ))}
            </div>

            {/* Order Details Popup Moved to Root */}
        </div>
    );
};

const CustomersTab = ({ showToast, setConfirmModal, editUser, setEditUser, editForm, setEditForm }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Reset page when filter changes
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            setUsers(data);
        } catch (error) {
            console.error('User fetch error:', error);
            if (error.response?.status === 401) {
                showToast('Session expired. Please re-login.', 'error');
                window.location.href = '/login';
            }
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchUsers();
        window.addEventListener('refresh-customers', fetchUsers);
        return () => window.removeEventListener('refresh-customers', fetchUsers);
    }, []);

    const handleDeleteUser = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete User Registry',
            message: 'Are you sure you want to permanently erase this user record? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
                    setUsers(users.filter(u => u._id !== id));
                    showToast('Identity record removed');
                } catch (error) {
                    showToast('Failed to remove record', 'error');
                }
            }
        });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUser._id}`, {
                name: editForm.name, email: editForm.email, isAdmin: editForm.isAdmin
            });
            if (editForm.password) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUser._id}/reset-password`, { password: editForm.password });
            }
            showToast('Identity profile synchronized');
            setEditUser(null);
            fetchUsers();
        } catch (error) {
            showToast('Synchronization error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-5 text-center text-muted animate-pulse border bg-white rounded-4 shadow-sm"><Users className="mx-auto mb-3 opacity-15" size={64} /> Analyzing customer registry...</div>;

    const filtered = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const paginatedUsers = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2 font-label">
                        <div className="bg-success bg-opacity-10 text-success rounded-pill px-4 py-1 extra-small fw-bold border border-success border-opacity-20 d-flex align-items-center gap-1">
                            <Users size={12} /> CRM IDENTITY BASE
                        </div>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Customer Hub</h2>
                    <p className="font-body text-muted mb-0 small mt-1">Authorized access management and registered holder database.</p>
                </div>
                <div className="bg-white border rounded-pill px-4 py-2 flex-grow-1 d-flex align-items-center shadow-sm max-w-500 border border-opacity-10 border-primary transition-all focus-within-shadow-md">
                    <Search size={16} className="text-muted" />
                    <input
                        type="text"
                        className="border-0 bg-transparent ms-2 w-100 font-body outline-none fs-7 fw-bold"
                        placeholder="Search identities or registered email handles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-5 shadow-sm overflow-hidden border border-opacity-50">
                <div className="table-responsive customers-table-wrap">
                    <table className="table table-hover align-middle mb-0 customers-table admin-mobile-card-table">
                        <thead className="bg-light border-bottom border-opacity-10 font-label">
                            <tr className="extra-small text-muted uppercase fw-bold" style={{ letterSpacing: '2px' }}>
                                <th className="ps-5 py-4">Digital Identity Holder</th>
                                <th>Registry Handle</th>
                                <th>Access Privilege</th>
                                <th className="text-center">Security Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(user => (
                                <tr key={user._id} className="transition-all hover-scale-xs">
                                    <td className="ps-5 py-4" data-label="Customer">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="rounded-full bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-md border border-white border-2" style={{ width: '46px', height: '46px', fontSize: '20px', borderRadius: '50%' }}>
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-headline fw-bold text-primary" style={{ fontSize: '15px' }}>{user.name || 'ANONYMOUS'}</span>
                                        </div>
                                    </td>
                                    <td className="font-body small text-muted fw-bold opacity-75" data-label="Email">{user.email}</td>
                                    <td data-label="Role">
                                        <span className={`badge rounded-pill px-4 py-2 font-label text-uppercase fs-9 fw-bold shadow-sm ${user.isAdmin ? 'bg-secondary text-white' : 'bg-primary bg-opacity-10 text-secondary border border-primary border-opacity-10'}`}>
                                            {user.isAdmin ? 'SUPER ADMIN' : 'STORE CUSTOMER'}
                                        </span>
                                    </td>
                                    <td className="text-center" data-label="Actions">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-sm btn-white border shadow-sm p-3 rounded-pill hover-bg-primary hover-text-white transition-all" onClick={() => { setEditUser(user); setEditForm({ name: user.name, email: user.email, isAdmin: user.isAdmin, password: '' }); }}>
                                                <Edit size={16} className="text-primary" />
                                            </button>
                                            <button className="btn btn-sm btn-white border shadow-sm text-danger rounded-pill p-3 hover-bg-danger hover-text-white transition-all" onClick={() => handleDeleteUser(user._id)}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Customers Pagination Footer */}
                {filtered.length > 0 && (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-4 bg-light border-top border-opacity-10">
                        <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                            <span className="font-label extra-small text-muted fw-bold">Rows per page:</span>
                            <select className="form-select form-select-sm border-opacity-25 shadow-sm rounded-pill fw-bold font-body" style={{ width: '80px' }} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <span className="font-label extra-small text-muted fw-bold">
                                Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
                            </span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-primary hover-text-white transition-all" style={{ width: '32px', height: '32px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <button className="btn btn-sm btn-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-primary hover-text-white transition-all" style={{ width: '32px', height: '32px' }} disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Edit Modal Moved to Root */}
        </div>
    );
};


const AVAILABLE_ICONS = [
    'AlertTriangle', 'ArrowLeft', 'Bell', 'BellOff', 'Box', 'Briefcase', 'Calendar', 
    'ChevronDown', 'Clock', 'CreditCard', 'Download', 'Edit', 'ExternalLink', 'Eye', 
    'HelpCircle', 'Info', 'Layers', 'LayoutDashboard', 'Lock', 'MessageSquare', 
    'MousePointer2', 'MousePointerClick', 'Package', 'Plus', 'Quote', 'Save', 
    'Search', 'ShieldCheck', 'ShoppingBag', 'ShoppingCart', 'Smartphone', 'Star', 
    'Ticket', 'Timer', 'Trash', 'TrendingUp', 'Truck', 'User', 'Users'
];

const DynamicIcon = ({ name, size = 18, className = "" }) => {
    const icons = {
        Star, Truck, ShieldCheck, Clock, MessageSquare, Package, Box, Users, 
        Layers, Ticket, Smartphone, MousePointer2, LayoutDashboard, Search,
        Plus, Trash, Edit, Eye, Info, AlertTriangle, User, Quote, Timer,
        HelpCircle, Smartphone, MousePointerClick, TrendingUp, ExternalLink,
        Briefcase, Bell, BellOff, Calendar, ArrowLeft, Lock, Download,
        ChevronDown, Save, CreditCard, ShoppingCart, ShoppingBag, LayoutDashboard
    };
    
    if (!name) return <HelpCircle size={size} className={className} />;
    
    // Normalize name: "ShieldCheck" or "shield-check" -> "ShieldCheck"
    const normalizedName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('');
    const Icon = icons[normalizedName] || icons[name] || HelpCircle;
    
    return <Icon size={size} className={className} />;
};

const CustomIconSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="position-relative" ref={dropdownRef}>
            <div 
                className="form-control form-control-sm rounded-pill shadow-sm d-flex align-items-center gap-2 bg-white"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                <DynamicIcon name={value} size={16} className="text-primary" />
                <span className="flex-grow-1" style={{ fontSize: '13px' }}>{value || 'Select Icon'}</span>
                <ChevronDown size={14} className="text-muted" />
            </div>
            
            {isOpen && (
                <div 
                    className="position-absolute w-100 bg-white shadow-premium rounded-4 mt-2 overflow-auto py-2 animate-slide-up" 
                    style={{ maxHeight: '220px', zIndex: 1050, border: '1px solid rgba(212, 175, 55, 0.2)' }}
                >
                    {AVAILABLE_ICONS.map(icon => (
                        <div 
                            key={icon}
                            className="d-flex align-items-center gap-2 px-3 py-2 transition-all hover-bg-primary hover-bg-opacity-10"
                            onClick={() => {
                                onChange(icon);
                                setIsOpen(false);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <DynamicIcon name={icon} size={16} className={value === icon ? 'text-primary' : 'text-muted'} />
                            <span className={value === icon ? 'fw-bold text-primary' : 'text-secondary'} style={{ fontSize: '13px' }}>{icon}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CouponsTab = ({
    showToast, setConfirmModal, showCouponModal, setShowCouponModal,
    selectedCoupon, setSelectedCoupon, couponForm, setCouponForm
}) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons`);
            setCoupons(data);
        } catch (error) { console.error('Coupon fetch error:', error); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCoupons();
        window.addEventListener('refresh-coupons', fetchCoupons);
        return () => window.removeEventListener('refresh-coupons', fetchCoupons);
    }, []);

    const handleOpenCreate = () => {
        setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '', freeShipping: false, isActive: true });
        setSelectedCoupon(null);
        setShowCouponModal(true);
    };

    const handleOpenEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setCouponForm({
            code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount || '', maxDiscount: coupon.maxDiscount || '',
            usageLimit: coupon.usageLimit || '', expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
            freeShipping: !!coupon.freeShipping,
            isActive: coupon.isActive
        });
        setShowCouponModal(true);
    };

    const resetForm = () => {
        setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '', freeShipping: false, isActive: true });
        setSelectedCoupon(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (selectedCoupon) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/coupons/${selectedCoupon._id}`, couponForm);
                showToast('Coupon updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons`, couponForm);
                showToast('Coupon created successfully');
            }
            setShowCouponModal(false);
            resetForm();
            fetchCoupons();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save coupon', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete Coupon',
            message: 'Are you sure you want to permanently delete this coupon code?',
            onConfirm: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/coupons/${id}`);
                    showToast('Coupon deleted');
                    fetchCoupons();
                } catch (error) {
                    showToast('Failed to delete coupon', 'error');
                }
            }
        });
    };

    const toggleActive = async (coupon) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/coupons/${coupon._id}`, { isActive: !coupon.isActive });
            fetchCoupons();
        } catch (error) { showToast('Failed to update status', 'error'); }
    };

    if (loading) return <div className="p-5 text-center text-muted animate-pulse border bg-white rounded-4 shadow-sm"><Ticket className="mx-auto mb-3 opacity-15" size={64} /> Loading coupon registry...</div>;

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2 font-label">
                        <div className="bg-secondary bg-opacity-10 text-primary rounded-pill px-4 py-1 extra-small fw-bold border border-secondary border-opacity-20 d-flex align-items-center gap-1">
                            <Ticket size={12} /> PROMO ENGINE
                        </div>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Coupon Manager</h2>
                    <p className="font-body text-muted mb-0 small mt-1">Create and manage promotional discount coupons.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-5 py-3 shadow-md fw-bold d-flex align-items-center gap-3 border-0 transition-all hover-shadow-lg font-label" onClick={handleOpenCreate}>
                    <Plus size={20} /> Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="admin-order-stats mb-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <div className="admin-order-stat-card"><span>Total Coupons</span><strong>{coupons.length}</strong></div>
                <div className="admin-order-stat-card"><span>Active</span><strong>{coupons.filter(c => c.isActive).length}</strong></div>
                <div className="admin-order-stat-card"><span>Expired</span><strong>{coupons.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length}</strong></div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-5 shadow-sm overflow-hidden border border-opacity-50">
                <div className="table-responsive coupons-table-wrap">
                    <table className="table table-hover align-middle mb-0 coupons-table admin-mobile-card-table">
                        <thead className="bg-light border-bottom border-opacity-10 font-label">
                            <tr className="extra-small text-muted uppercase fw-bold" style={{ letterSpacing: '2px' }}>
                                <th className="ps-5 py-4">Code</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Min Order</th>
                                <th>Usage</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted fw-bold">No coupons created yet. Click "Create Coupon" to get started.</td></tr>
                            ) : coupons.map(coupon => {
                                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                                return (
                                    <tr key={coupon._id} className="transition-all hover-scale-xs">
                                        <td className="ps-5 py-4" data-label="Code">
                                            <span className="font-headline fw-bold text-secondary bg-primary bg-opacity-10 px-3 py-1 rounded-pill" style={{ fontSize: '14px', letterSpacing: '1px' }}>{coupon.code}</span>
                                        </td>
                                        <td data-label="Type"><span className="badge bg-light text-secondary border px-3 py-2 rounded-pill extra-small fw-bold font-label uppercase">{coupon.discountType}</span></td>
                                        <td className="fw-bold text-secondary font-headline" data-label="Value">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}{coupon.maxDiscount ? <span className="d-block extra-small text-muted fw-bold">Max ₹{coupon.maxDiscount}</span> : null}</td>
                                        <td className="fw-bold font-body" data-label="Min Order">{coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : '—'}</td>
                                        <td data-label="Usage"><span className="font-headline fw-bold">{coupon.usedCount}</span><span className="text-muted">/{coupon.usageLimit || '∞'}</span></td>
                                        <td data-label="Expires">{coupon.expiresAt ? <span className={`extra-small fw-bold ${isExpired ? 'text-danger' : 'text-primary'}`}>{new Date(coupon.expiresAt).toLocaleDateString()}{isExpired && <span className="d-block text-danger">EXPIRED</span>}</span> : <span className="text-muted extra-small fw-bold">Never</span>}</td>
                                        <td data-label="Status">
                                            <div className="form-check form-switch d-inline-block p-0">
                                                <input className="form-check-input custom-switch border-primary" type="checkbox" checked={coupon.isActive} onChange={() => toggleActive(coupon)} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </td>
                                        <td className="text-center" data-label="Actions">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-white border shadow-sm p-3 rounded-pill hover-bg-primary hover-text-white transition-all" onClick={() => handleOpenEdit(coupon)}><Edit size={16} className="text-primary" /></button>
                                                <button className="btn btn-sm btn-white border shadow-sm text-danger rounded-pill p-3 hover-bg-danger hover-text-white transition-all" onClick={() => handleDelete(coupon._id)}><Trash size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showCouponModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-80 d-flex justify-content-center align-items-center shadow-2xl animate-fade-in" style={{ zIndex: 9999, backdropFilter: 'blur(10px)' }}>
                    <div className="bg-white rounded-5 shadow-2xl p-5 w-100 border-0" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-opacity-10 pb-4">
                            <div>
                                <h4 className="font-headline text-primary m-0 fw-bold d-flex align-items-center gap-3"><Ticket size={22} /> {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h4>
                                <p className="extra-small text-muted fw-bold m-0 uppercase opacity-75 mt-2 font-label">{selectedCoupon ? `EDITING: ${selectedCoupon.code}` : 'GENERATE A PROMOTIONAL CODE'}</p>
                            </div>
                            <button className="btn btn-light btn-sm rounded-circle p-2 border shadow-sm hover-bg-danger hover-text-white transition-all" onClick={() => { setShowCouponModal(false); resetForm(); }}> <X size={24} /> </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Coupon Code</label>
                                    <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm font-headline fw-bold text-uppercase" required placeholder="e.g. SAVE20" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Discount Type</label>
                                    <select className="form-select rounded-4 py-3 border-opacity-25 shadow-sm fw-bold" value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Discount Value</label>
                                    <input type="number" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm fw-bold" required={!couponForm.freeShipping} placeholder={couponForm.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 100'} value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Min Order Amount (₹)</label>
                                    <input type="number" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" placeholder="e.g. 500 (0 = no minimum)" value={couponForm.minOrderAmount} onChange={e => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })} />
                                </div>
                                {couponForm.discountType === 'percentage' && (
                                    <div className="col-md-6">
                                        <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Max Discount Cap (₹)</label>
                                        <input type="number" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" placeholder="e.g. 200 (empty = no cap)" value={couponForm.maxDiscount} onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })} />
                                    </div>
                                )}
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Usage Limit</label>
                                    <input type="number" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" placeholder="0 = Unlimited" value={couponForm.usageLimit} onChange={e => setCouponForm({ ...couponForm, usageLimit: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Expiry Date</label>
                                    <input type="date" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" value={couponForm.expiresAt} onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Delivery Benefit</label>
                                    <div className="p-3 bg-light bg-opacity-40 rounded-4 border border-opacity-10 mt-1">
                                        <div className="form-check form-switch d-flex align-items-center gap-4">
                                            <input className="form-check-input border-primary shadow-none" style={{ transform: 'scale(1.3)' }} type="checkbox" checked={couponForm.freeShipping} onChange={e => setCouponForm({ ...couponForm, freeShipping: e.target.checked })} />
                                            <label className="form-check-label font-body fw-bold text-primary mb-0 small">Make delivery free with this coupon</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Status</label>
                                    <div className="p-3 bg-light bg-opacity-40 rounded-4 border border-opacity-10 mt-1">
                                        <div className="form-check form-switch d-flex align-items-center gap-4">
                                            <input className="form-check-input border-primary shadow-none" style={{ transform: 'scale(1.3)' }} type="checkbox" checked={couponForm.isActive} onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })} />
                                            <label className="form-check-label font-body fw-bold text-primary mb-0 small">{couponForm.isActive ? 'Active' : 'Inactive'}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 justify-content-end mt-5">
                                <button type="button" className="btn btn-light px-5 py-3 rounded-pill border fw-bold font-label extra-small" onClick={() => { setShowCouponModal(false); resetForm(); }}>CANCEL</button>
                                <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-md border-0 font-label extra-small d-flex align-items-center justify-content-center gap-2" disabled={isSaving}>
                                    {isSaving ? (
                                        <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> SAVING...</>
                                    ) : (selectedCoupon ? 'UPDATE COUPON' : 'CREATE COUPON')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CMSContentTab = ({ showToast, setConfirmModal }) => {
    const [cmsData, setCmsData] = useState(null);
    const [initialCmsData, setInitialCmsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timerValue, setTimerValue] = useState({ hours: 0, minutes: 0 });
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchCMS = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
            setCmsData(data);
            setInitialCmsData(JSON.parse(JSON.stringify(data)));
            setIsDirty(false);
        } catch (error) { console.error('CMS fetch error:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchCMS(); }, []);

    useEffect(() => {
        if (cmsData && initialCmsData) {
            setIsDirty(JSON.stringify(cmsData) !== JSON.stringify(initialCmsData));
        }
    }, [cmsData, initialCmsData]);

    const handleSaveCMS = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/homepage`, cmsData);
            showToast('Settings saved successfully!');
            fetchCMS();
        } catch (error) {
            console.error('CMS save error:', error);
            showToast('Failed to save settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelCMS = () => {
        setConfirmModal({
            show: true,
            title: 'Discard Changes',
            message: 'Are you sure you want to revert all unsaved changes to the storefront configuration?',
            onConfirm: () => {
                if (initialCmsData) {
                    setCmsData(JSON.parse(JSON.stringify(initialCmsData)));
                    setIsDirty(false);
                }
            }
        });
    };

    const startFlashSale = () => {
        const ms = (timerValue.hours * 3600 + timerValue.minutes * 60) * 1000;
        const endTime = new Date(Date.now() + ms);
        setCmsData({ ...cmsData, flashSaleEndTime: endTime, showFlashSale: true });
    };

    const handlePromoChange = (idx, field, val) => {
        const newPromos = [...cmsData.promos];
        newPromos[idx][field] = val;
        setCmsData({ ...cmsData, promos: newPromos });
    };

    if (loading) return <div className="p-5 text-center text-muted animate-pulse bg-white border rounded-4 shadow-sm"><FileEdit className="mx-auto mb-3 opacity-15" size={64} /> Analyzing storefront assets...</div>;

    return (
        <div className="container-fluid p-0 animate-fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-5 px-1">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="bg-secondary bg-opacity-10 text-secondary rounded-pill px-4 py-1 extra-small fw-bold border border-secondary border-opacity-20 d-flex align-items-center gap-1 font-label">
                            <FileEdit size={12} /> VISUAL DESIGNER
                        </div>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Edit Website Content</h2>
                    <p className="font-body text-muted small mt-1">Update your banners, promos, and homepage slides.</p>
                </div>
            </div>

            <div className="card shadow-premium border-0 rounded-4 overflow-hidden mb-5">
                <div className="card-header bg-white border-bottom p-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-secondary">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold">Master Visibility Control</h5>
                            <p className="text-muted small mb-0">Toggle which sections are visible on the homepage.</p>
                        </div>
                    </div>
                </div>
                <div className="card-body p-4">
                    <div className="row g-4">
                        {[
                            { id: 'showHero', label: 'Main Billboard', icon: ImageIcon },
                            { id: 'showFeatures', label: 'Trust Features', icon: ShieldCheck },
                            { id: 'showCategories', label: 'Category Grid', icon: LayoutDashboard },
                            { id: 'showFeatured', label: 'Featured Today', icon: Star },
                            { id: 'showFlashSale', label: 'Flash Sale (Limited)', icon: MousePointer2 },
                            { id: 'showBestSellers', label: 'Best Selling Products', icon: ArrowUpCircle },
                            { id: 'showExperience', label: 'Experience Banners', icon: Smartphone },
                            { id: 'showTestimonials', label: 'Customer Testimonials', icon: MessageSquare },
                        ].map(section => (
                            <div key={section.id} className="col-md-3">
                                <div className="p-3 border rounded-4 d-flex align-items-center justify-content-between hover-bg-light transition-all">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-1 rounded bg-light">
                                            <section.icon size={16} className="text-primary" />
                                        </div>
                                        <span className="fw-bold fs-8">{section.label}</span>
                                    </div>
                                    <div className="form-check form-switch m-0">
                                        <input
                                            className="form-check-input custom-switch border-0 shadow-none"
                                            type="checkbox"
                                            checked={cmsData && cmsData[section.id] !== false}
                                            onChange={(e) => setCmsData({ ...cmsData, [section.id]: e.target.checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {cmsData?.showFlashSale !== false && (
                <div className="card shadow-premium border-0 rounded-4 overflow-hidden mb-5">
                    <div className="card-header bg-white border-bottom p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h5 className="mb-0 fw-bold">Flash Sale Countdown Timer</h5>
                                <p className="text-muted small mb-0">Set an expiration time to automatically hide the Flash Sale section.</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <div className="row align-items-center g-4">
                            <div className="col-md-3">
                                <label className="extra-small fw-bold opacity-75 mb-2 d-block font-label">HOURS</label>
                                <input
                                    type="number"
                                    className="form-control rounded-4 py-3 border-0 bg-light shadow-sm"
                                    min="0"
                                    value={timerValue.hours}
                                    onChange={(e) => setTimerValue({ ...timerValue, hours: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="extra-small fw-bold opacity-75 mb-2 d-block font-label">MINUTES</label>
                                <input
                                    type="number"
                                    className="form-control rounded-4 py-3 border-0 bg-light shadow-sm"
                                    min="0"
                                    max="59"
                                    value={timerValue.minutes}
                                    onChange={(e) => setTimerValue({ ...timerValue, minutes: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="extra-small fw-bold opacity-75 mb-2 d-block font-label">ACTION</label>
                                <button className="btn btn-danger rounded-pill px-4 py-3 w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border-0" onClick={startFlashSale}>
                                    <Timer size={18} /> SET EXPIRY
                                </button>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 rounded-4 bg-light border border-dashed text-center">
                                    <label className="extra-small fw-bold opacity-50 mb-1 d-block uppercase font-label">STATUS</label>
                                    {cmsData?.flashSaleEndTime ? (
                                        <div className="text-danger fw-bold fs-7 d-flex align-items-center justify-content-center gap-2">
                                            <span className="animate-pulse">●</span> ACTIVE
                                        </div>
                                    ) : (
                                        <div className="text-muted fw-bold extra-small">NOT SCHEDULED</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {cmsData?.flashSaleEndTime && (
                            <div className="mt-4 p-3 rounded-4 bg-danger bg-opacity-5 border border-danger border-opacity-10 text-center">
                                <div className="text-danger extra-small fw-bold uppercase mb-1 font-label">SALE ENDS AT</div>
                                <div className="fw-bold font-headline">{new Date(cmsData.flashSaleEndTime).toLocaleString()}</div>
                                <button className="btn btn-link btn-sm text-danger text-decoration-none mt-2 extra-small fw-bold" onClick={() => setCmsData({ ...cmsData, flashSaleEndTime: null })}>CLEAR TIMER</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="row g-5 mx-0">
                {/* Hero Slides - Detailed Billboard */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <Layers size={24} /> Hero Billboard Slides</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>MAIN FRONT-PAGE SLIDER — SUPPORTS RICH HTML TITLES</p>
                            </div>
                            <button className="btn btn-outline-primary rounded-pill px-4 py-2 extra-small fw-bold border-2 d-flex align-items-center gap-2 font-label" onClick={() => setCmsData({ ...cmsData, heroSlides: [...(cmsData.heroSlides || []), { title: 'New <span>Slide</span> Title', subtitle: 'SUBTITLE', text: 'Slide description goes here...', bgImg: '', btnText: 'Shop Now' }] })}> <Plus size={16} /> ADD HERO SLIDE</button>
                        </div>
                        <div className="row g-4">
                            {(cmsData?.heroSlides || []).map((slide, idx) => (
                                <div className="col-12" key={idx}>
                                    <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 position-relative shadow-inner transition-all hover-bg-white shadow-hover">
                                        <button className="btn btn-sm btn-danger rounded-circle p-2 position-absolute top-0 end-0 m-3 shadow-md border-0 transition-all" onClick={() => {
                                            const nhs = [...cmsData.heroSlides]; nhs.splice(idx, 1); setCmsData({ ...cmsData, heroSlides: nhs });
                                        }}><X size={16} /></button>
                                        <div className="row g-4">
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Main Title (HTML Allowed)</label>
                                                    <input type="text" className="form-control form-control-sm rounded-4 shadow-sm" value={slide.title} onChange={(e) => {
                                                        const nhs = [...cmsData.heroSlides]; nhs[idx].title = e.target.value; setCmsData({ ...cmsData, heroSlides: nhs });
                                                    }} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Subtitle Badge</label>
                                                    <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={slide.subtitle} onChange={(e) => {
                                                        const nhs = [...cmsData.heroSlides]; nhs[idx].subtitle = e.target.value; setCmsData({ ...cmsData, heroSlides: nhs });
                                                    }} />
                                                </div>
                                                <div>
                                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Description Text</label>
                                                    <textarea className="form-control form-control-sm rounded-4 shadow-sm" rows="3" value={slide.text} onChange={(e) => {
                                                        const nhs = [...cmsData.heroSlides]; nhs[idx].text = e.target.value; setCmsData({ ...cmsData, heroSlides: nhs });
                                                    }} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Background Image</label>
                                                    <div className="cat-thumb-mini border border-opacity-10 rounded-4 overflow-hidden mb-2 shadow-sm bg-white" style={{ width: '100%', height: '120px' }}>
                                                        <img src={slide.bgImg || '/Reference/images/banner-1.jpg'} className="w-100 h-100 object-fit-cover" alt="" />
                                                    </div>
                                                    <label className="btn btn-outline-primary btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-2 fw-bold font-label extra-small py-2 shadow-sm transition-all" style={{ cursor: 'pointer' }}>
                                                        <ImageIcon size={14} /> Upload Background Image
                                                        <input type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            const formData = new FormData();
                                                            formData.append('image', file);
                                                            try {
                                                                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/cms/hero-bg`, formData, {
                                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                                });
                                                                const nhs = [...cmsData.heroSlides]; nhs[idx].bgImg = data.url; setCmsData({ ...cmsData, heroSlides: nhs });
                                                            } catch (err) {
                                                                console.error('Upload error:', err);
                                                                showToast('Image upload failed. Please try again.', 'error');
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Button Text</label>
                                                    <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={slide.btnText} onChange={(e) => {
                                                        const nhs = [...cmsData.heroSlides]; nhs[idx].btnText = e.target.value; setCmsData({ ...cmsData, heroSlides: nhs });
                                                    }} />
                                                </div>
                                                <div className="mb-3 position-relative">
                                                    <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Target Page (Link)</label>
                                                    <div className="input-group input-group-sm">
                                                        <input type="text" className="form-control rounded-start-pill shadow-sm" placeholder="/categories" value={slide.btnLink || ''} onChange={(e) => {
                                                            const nhs = [...cmsData.heroSlides]; nhs[idx].btnLink = e.target.value; setCmsData({ ...cmsData, heroSlides: nhs });
                                                        }} />
                                                        <button className="btn btn-outline-primary dropdown-toggle rounded-end-pill px-3 shadow-sm" type="button" data-bs-toggle="dropdown"></button>
                                                        <ul className="dropdown-menu dropdown-menu-end rounded-4 shadow-lg border-0 p-2">
                                                            <li><button className="dropdown-item rounded-3 extra-small fw-bold" onClick={() => { const nhs = [...cmsData.heroSlides]; nhs[idx].btnLink = '/'; setCmsData({ ...cmsData, heroSlides: nhs }); }}>Home (/)</button></li>
                                                            <li><button className="dropdown-item rounded-3 extra-small fw-bold" onClick={() => { const nhs = [...cmsData.heroSlides]; nhs[idx].btnLink = '/categories'; setCmsData({ ...cmsData, heroSlides: nhs }); }}>Shop (/categories)</button></li>
                                                            <li><button className="dropdown-item rounded-3 extra-small fw-bold" onClick={() => { const nhs = [...cmsData.heroSlides]; nhs[idx].btnLink = '/featured'; setCmsData({ ...cmsData, heroSlides: nhs }); }}>Featured (/featured)</button></li>
                                                            <li><button className="dropdown-item rounded-3 extra-small fw-bold" onClick={() => { const nhs = [...cmsData.heroSlides]; nhs[idx].btnLink = '/best-sellers'; setCmsData({ ...cmsData, heroSlides: nhs }); }}>Best Sellers (/best-sellers)</button></li>
                                                            <hr className="dropdown-divider opacity-10" />
                                                            <li><button className="dropdown-item rounded-3 extra-small fw-bold" onClick={() => { const nhs = [...cmsData.heroSlides]; nhs[idx].btnLink = '/about'; setCmsData({ ...cmsData, heroSlides: nhs }); }}>About (/about)</button></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white bg-opacity-50 rounded-4 border border-opacity-50 mt-4">
                                                    <p className="extra-small text-muted mb-0 lh-base italic">Pro Tip: Use <code>{"<span className='text-primary'>"}</code> in the title for colored accents.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trust Features Strip */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <ShieldCheck size={24} /> Trust Features Strip</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>4 CORE BENEFITS DISPLAYED UNDER HERO SECTION</p>
                            </div>
                        </div>
                        <div className="row g-4">
                            {[0, 1, 2, 3].map((idx) => {
                                const feature = (cmsData?.features || [])[idx] || { icon: 'Star', title: '', desc: '' };
                                return (
                                    <div className="col-md-3" key={idx}>
                                        <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 transition-all hover-bg-white shadow-hover">
                                            <div className="mb-3 d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary shadow-sm">
                                                    <DynamicIcon name={feature.icon} size={20} />
                                                </div>
                                                <span className="extra-small fw-bold text-muted uppercase font-label ls-sm">SLOT {idx + 1}</span>
                                            </div>
                                            <div className="mb-3">
                                                <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Icon Name (Lucide)</label>
                                                <CustomIconSelect 
                                                    value={feature.icon} 
                                                    onChange={(newIcon) => {
                                                        const nf = [...(cmsData.features || [{}, {}, {}, {}])]; 
                                                        nf[idx] = { ...feature, icon: newIcon }; 
                                                        setCmsData({ ...cmsData, features: nf });
                                                    }} 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Title</label>
                                                <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={feature.title} onChange={(e) => {
                                                    const nf = [...(cmsData.features || [{}, {}, {}, {}])]; nf[idx] = { ...feature, title: e.target.value }; setCmsData({ ...cmsData, features: nf });
                                                }} />
                                            </div>
                                            <div>
                                                <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Description</label>
                                                <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={feature.desc} onChange={(e) => {
                                                    const nf = [...(cmsData.features || [{}, {}, {}, {}])]; nf[idx] = { ...feature, desc: e.target.value }; setCmsData({ ...cmsData, features: nf });
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Section Button Controls */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <MousePointerClick size={24} /> Section Button Controls</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>MANAGE BUTTONS FOR FEATURED & BEST SELLER SECTIONS</p>
                            </div>
                        </div>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 shadow-inner">
                                    <h6 className="fw-bold text-secondary mb-3 uppercase extra-small font-label">FEATURED TODAY BUTTON</h6>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Text</label>
                                            <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={cmsData?.featuredBtnText || 'Visit Now'} onChange={(e) => setCmsData({ ...cmsData, featuredBtnText: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Target Page</label>
                                            <select className="form-select form-select-sm rounded-pill shadow-sm" value={cmsData?.featuredBtnLink || '/featured'} onChange={(e) => setCmsData({ ...cmsData, featuredBtnLink: e.target.value })}>
                                                <option value="/">Home (/)</option>
                                                <option value="/categories">Shop (/categories)</option>
                                                <option value="/featured">Featured (/featured)</option>
                                                <option value="/best-sellers">Best Sellers (/best-sellers)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 shadow-inner">
                                    <h6 className="fw-bold text-primary mb-3 uppercase extra-small font-label">BEST SELLERS BUTTON</h6>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Text</label>
                                            <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={cmsData?.bestSellersBtnText || 'Explore All Catalog'} onChange={(e) => setCmsData({ ...cmsData, bestSellersBtnText: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Target Page</label>
                                            <select className="form-select form-select-sm rounded-pill shadow-sm" value={cmsData?.bestSellersBtnLink || '/best-sellers'} onChange={(e) => setCmsData({ ...cmsData, bestSellersBtnLink: e.target.value })}>
                                                <option value="/">Home (/)</option>
                                                <option value="/categories">Shop (/categories)</option>
                                                <option value="/featured">Featured (/featured)</option>
                                                <option value="/best-sellers">Best Sellers (/best-sellers)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <Box size={24} /> Collection Grid</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>MANUALLY CURATED COLLECTIONS FOR THE HOME PAGE</p>
                            </div>
                            <button className="btn btn-outline-primary rounded-pill px-4 py-2 extra-small fw-bold border-2 d-flex align-items-center gap-2 font-label" onClick={() => setCmsData({ ...cmsData, categoryItems: [...(cmsData.categoryItems || []), { name: 'New Collection', img: '', count: '10 Items' }] })}> <Plus size={16} /> ADD ITEM</button>
                        </div>
                        <div className="row g-4">
                            {(cmsData?.categoryItems || []).map((cat, idx) => (
                                <div className="col-md-4" key={idx}>
                                    <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 position-relative group transition-all hover-bg-white shadow-hover">
                                        <button className="btn btn-sm btn-white border shadow-sm text-danger rounded-pill p-2 position-absolute top-0 end-0 m-3 transition-all hover-bg-danger hover-text-white z-2" onClick={() => {
                                            const nci = [...cmsData.categoryItems]; nci.splice(idx, 1); setCmsData({ ...cmsData, categoryItems: nci });
                                        }} title="Remove Item"> <Trash size={16} /> </button>
                                        <div className="mb-3">
                                            <div className="cat-thumb-mini border border-opacity-10 rounded-4 overflow-hidden mb-3 shadow-sm bg-white" style={{ width: '100%', height: '100px' }}>
                                                <img src={cat.img || '/Reference/images/category-thumb-1.jpg'} className="w-100 h-100 object-fit-cover" alt="" />
                                            </div>
                                            <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Image URL</label>
                                            <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={cat.img} onChange={(e) => {
                                                const nci = [...cmsData.categoryItems]; nci[idx].img = e.target.value; setCmsData({ ...cmsData, categoryItems: nci });
                                            }} />
                                        </div>
                                        <div className="mb-2">
                                            <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Name</label>
                                            <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={cat.name} onChange={(e) => {
                                                const nci = [...cmsData.categoryItems]; nci[idx].name = e.target.value; setCmsData({ ...cmsData, categoryItems: nci });
                                            }} />
                                        </div>
                                        <div>
                                            <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Item Count Tag</label>
                                            <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={cat.count} onChange={(e) => {
                                                const nci = [...cmsData.categoryItems]; nci[idx].count = e.target.value; setCmsData({ ...cmsData, categoryItems: nci });
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Experience Banners (2 Large Cards) */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <ImageIcon size={24} /> Experience Banners</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>LARGE PROMOTIONAL CARDS BEFORE THE NEWS SECTION</p>
                            </div>
                            <button className="btn btn-outline-primary rounded-pill px-4 py-2 extra-small fw-bold border-2 d-flex align-items-center gap-2 font-label" onClick={() => setCmsData({ ...cmsData, experienceBanners: [...(cmsData.experienceBanners || []), { title: 'New Banner', text: 'Banner description', img: '', btnText: 'Explore', btnStyle: 'primary' }] })}> <Plus size={16} /> ADD BANNER</button>
                        </div>
                        <div className="row g-4">
                            {(cmsData?.experienceBanners || []).map((banner, idx) => {
                                return (
                                    <div className="col-md-6" key={idx}>
                                        <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 position-relative group hover-bg-white transition-all shadow-hover">
                                            <button className="btn btn-sm btn-white border shadow-sm text-danger rounded-pill p-2 position-absolute top-0 end-0 m-3 transition-all hover-bg-danger hover-text-white z-2" onClick={() => {
                                                const neb = [...cmsData.experienceBanners]; neb.splice(idx, 1); setCmsData({ ...cmsData, experienceBanners: neb });
                                            }} title="Remove Banner"> <Trash size={16} /> </button>
                                            <div className="mb-3">
                                                <div className="cat-thumb-mini border border-opacity-10 rounded-5 overflow-hidden mb-3 shadow-md bg-white" style={{ width: '100%', height: '140px' }}>
                                                    <img src={banner.img || `/Reference/images/banner-ad-${idx + 1}.jpg`} className="w-100 h-100 object-fit-cover" alt="" />
                                                </div>
                                                <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Image URL</label>
                                                <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={banner.img} onChange={(e) => {
                                                    const neb = [...(cmsData.experienceBanners || [{}, {}])]; neb[idx] = { ...banner, img: e.target.value }; setCmsData({ ...cmsData, experienceBanners: neb });
                                                }} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Title (HTML Allowed)</label>
                                                <input type="text" className="form-control form-control-sm rounded-4 shadow-sm" value={banner.title} onChange={(e) => {
                                                    const neb = [...(cmsData.experienceBanners || [{}, {}])]; neb[idx] = { ...banner, title: e.target.value }; setCmsData({ ...cmsData, experienceBanners: neb });
                                                }} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Description text</label>
                                                <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={banner.text} onChange={(e) => {
                                                    const neb = [...(cmsData.experienceBanners || [{}, {}])]; neb[idx] = { ...banner, text: e.target.value }; setCmsData({ ...cmsData, experienceBanners: neb });
                                                }} />
                                            </div>
                                            <div className="row g-3">
                                                <div className="col-6">
                                                    <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Button Text</label>
                                                    <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={banner.btnText} onChange={(e) => {
                                                        const neb = [...(cmsData.experienceBanners || [{}, {}])]; neb[idx] = { ...banner, btnText: e.target.value }; setCmsData({ ...cmsData, experienceBanners: neb });
                                                    }} />
                                                </div>
                                                <div className="col-6">
                                                    <label className="extra-small text-muted fw-bold mb-1 d-block font-label">Style</label>
                                                    <select className="form-select form-select-sm rounded-pill shadow-sm" value={banner.btnStyle} onChange={(e) => {
                                                        const neb = [...(cmsData.experienceBanners || [{}, {}])]; neb[idx] = { ...banner, btnStyle: e.target.value }; setCmsData({ ...cmsData, experienceBanners: neb });
                                                    }}>
                                                        <option value="primary">Primary (Green)</option>
                                                        <option value="light">Light (White)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Promo Segments */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <Ticket size={24} /> Website Banners & Promo Bar</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Edit Homepage Banners and Promo Bar Content</p>
                            </div>
                            {(cmsData?.promos || []).length < 3 && (
                                <button className="btn btn-outline-primary rounded-pill px-4 py-2 extra-small fw-bold border-2 d-flex align-items-center gap-2 font-label" onClick={() => setCmsData({ ...cmsData, promos: [...(cmsData.promos || []), { title: 'Limited Time Offer', code: 'SAVE20' }] })}> <Plus size={16} /> ADD BANNER</button>
                            )}
                        </div>
                        <div className="row g-4">
                            {(cmsData?.promos || []).map((promo, idx) => (
                                <div className="col-md-4" key={idx}>
                                    <div className="p-4 rounded-5 border border-opacity-20 transition-all hover-shadow-lg shadow-sm group hover-bg-white bg-light bg-opacity-30">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div className="badge rounded-pill bg-primary px-4 py-2 small fw-bold shadow-sm font-label text-white">ACTIVE PROMO</div>
                                            <button className="btn btn-sm btn-white border shadow-sm text-danger rounded-pill p-2 transition-all hover-bg-danger hover-text-white" onClick={() => {
                                                const np = [...cmsData.promos]; np.splice(idx, 1); setCmsData({ ...cmsData, promos: np });
                                            }} title="Remove Promo"> <Trash size={18} /> </button>
                                        </div>
                                        <div className="mb-3">
                                            <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Headline Title</label>
                                            <input type="text" className="form-control rounded-4 py-2 border-opacity-30 shadow-sm font-body fw-bold" placeholder="e.g. Free shipping on all orders" value={promo.title} onChange={(e) => handlePromoChange(idx, 'title', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Promo Code (Optional)</label>
                                            <input type="text" className="form-control rounded-4 py-2 border-opacity-30 shadow-sm font-body fw-bold text-primary" placeholder="e.g. WELCOME10" value={promo.code || ''} onChange={(e) => handlePromoChange(idx, 'code', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Customer Testimonials Management */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <Quote size={24} /> Customer Testimonials</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>MANAGE CLIENT FEEDBACK — SUPPORTS RATINGS & PHOTOS</p>
                            </div>
                            <button className="btn btn-outline-primary rounded-pill px-4 py-2 extra-small fw-bold border-2 d-flex align-items-center gap-2 font-label" onClick={() => setCmsData({ ...cmsData, testimonials: [...(cmsData.testimonials || []), { name: 'New Customer', role: 'Premium Buyer', text: 'Amazing quality products!', img: '', rating: 5 }] })}> <Plus size={16} /> ADD TESTIMONIAL</button>
                        </div>
                        <div className="row g-4">
                            {(cmsData?.testimonials || []).map((tm, idx) => (
                                <div className="col-md-6" key={idx}>
                                    <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20 position-relative group transition-all hover-bg-white shadow-hover">
                                        <button className="btn btn-sm btn-danger rounded-circle p-2 position-absolute top-0 end-0 m-3 shadow-md border-0 transition-all" onClick={() => {
                                            const ntm = [...cmsData.testimonials]; ntm.splice(idx, 1); setCmsData({ ...cmsData, testimonials: ntm });
                                        }}><X size={16} /></button>
                                        <div className="row g-4">
                                            <div className="col-md-4">
                                                <div className="cat-thumb-mini border border-opacity-10 rounded-circle overflow-hidden mb-3 shadow-sm bg-white mx-auto" style={{ width: '80px', height: '80px' }}>
                                                    {tm.img ? <img src={tm.img} className="w-100 h-100 object-fit-cover" alt="" /> : <User size={40} className="text-muted opacity-30 mt-3" />}
                                                </div>
                                                <label className="btn btn-outline-primary btn-sm rounded-pill w-100 py-1 extra-small fw-bold font-label transition-all" style={{ cursor: 'pointer' }}>
                                                    Upload Photo
                                                    <input type="file" accept="image/*" className="d-none" onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        const formData = new FormData();
                                                        formData.append('image', file);
                                                        try {
                                                            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/cms/hero-bg`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                            const ntm = [...cmsData.testimonials]; ntm[idx].img = data.url; setCmsData({ ...cmsData, testimonials: ntm });
                                                        } catch (err) { showToast('Upload failed', 'error'); }
                                                    }} />
                                                </label>
                                            </div>
                                            <div className="col-md-8">
                                                <div className="row g-2 mb-2">
                                                    <div className="col-7">
                                                        <input type="text" className="form-control form-control-sm rounded-pill font-headline fw-bold" placeholder="Customer Name" value={tm.name} onChange={(e) => {
                                                            const ntm = [...cmsData.testimonials]; ntm[idx].name = e.target.value; setCmsData({ ...cmsData, testimonials: ntm });
                                                        }} />
                                                    </div>
                                                    <div className="col-5">
                                                        <select className="form-select form-select-sm rounded-pill extra-small fw-bold text-secondary" value={tm.rating} onChange={(e) => {
                                                            const ntm = [...cmsData.testimonials]; ntm[idx].rating = parseInt(e.target.value); setCmsData({ ...cmsData, testimonials: ntm });
                                                        }}>
                                                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <input type="text" className="form-control form-control-sm rounded-pill mb-2 extra-small fw-bold text-muted" placeholder="Role/Location" value={tm.role} onChange={(e) => {
                                                    const ntm = [...cmsData.testimonials]; ntm[idx].role = e.target.value; setCmsData({ ...cmsData, testimonials: ntm });
                                                }} />
                                                <textarea className="form-control form-control-sm rounded-4 extra-small font-body" rows="3" placeholder="Testimonial text..." value={tm.text} onChange={(e) => {
                                                    const ntm = [...cmsData.testimonials]; ntm[idx].text = e.target.value; setCmsData({ ...cmsData, testimonials: ntm });
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shipping Info - Global Settings */}
                <div className="col-12">
                    <div className="bg-white p-5 rounded-5 shadow-sm border border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-opacity-10">
                            <div>
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <Truck size={24} /> Shipping & Delivery Settings</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>GLOBAL SHIPPING INFO — APPLIES TO ALL PRODUCTS</p>
                            </div>
                        </div>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Section Title</label>
                                <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm fw-bold" value={cmsData?.shippingInfo?.title || 'Shipping & Delivery'} onChange={(e) => setCmsData({ ...cmsData, shippingInfo: { ...(cmsData.shippingInfo || {}), title: e.target.value } })} />
                            </div>
                            <div className="col-md-3">
                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Delivery Time</label>
                                <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" value={cmsData?.shippingInfo?.deliveryTime || '3-5 Business Days'} onChange={(e) => setCmsData({ ...cmsData, shippingInfo: { ...(cmsData.shippingInfo || {}), deliveryTime: e.target.value } })} />
                            </div>
                            <div className="col-md-3">
                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Free Shipping Min</label>
                                <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" value={cmsData?.shippingInfo?.freeShippingMin || '₹500'} onChange={(e) => setCmsData({ ...cmsData, shippingInfo: { ...(cmsData.shippingInfo || {}), freeShippingMin: e.target.value } })} />
                            </div>
                            <div className="col-12">
                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Shipping Description</label>
                                <textarea className="form-control rounded-4 border-opacity-25 shadow-sm" rows="4" value={cmsData?.shippingInfo?.content || ''} onChange={(e) => setCmsData({ ...cmsData, shippingInfo: { ...(cmsData.shippingInfo || {}), content: e.target.value } })} />
                            </div>
                            <div className="col-12">
                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Return Policy</label>
                                <textarea className="form-control rounded-4 border-opacity-25 shadow-sm" rows="3" value={cmsData?.shippingInfo?.returnPolicy || ''} onChange={(e) => setCmsData({ ...cmsData, shippingInfo: { ...(cmsData.shippingInfo || {}), returnPolicy: e.target.value } })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Save/Cancel Floating Popup */}
            {isDirty && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 shadow-lg bg-white rounded-pill px-4 py-3 d-flex align-items-center gap-4 animate-slide-up" style={{ zIndex: 9999, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-warning rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                        <span className="font-label fw-bold text-dark fs-7">Unsaved Changes</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-light rounded-pill px-4 py-2 font-label extra-small fw-bold border hover-bg-danger hover-text-white transition-all" onClick={handleCancelCMS} disabled={isSaving}>Discard</button>
                        <button className="btn btn-primary rounded-pill px-4 py-2 font-label extra-small fw-bold d-flex align-items-center gap-2 shadow-sm border-0 transition-all hover-shadow-md" onClick={handleSaveCMS} disabled={isSaving}>
                            {isSaving ? (
                                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...</>
                            ) : (
                                <><Save size={14} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HighlightsTab = ({ showToast, setConfirmModal }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
            setProducts(data);
        } catch (error) { console.error('Fetch error:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const toggleStatus = async (productId, field, currentVal) => {
        try {
            const formData = new FormData();
            formData.append(field, !currentVal);

            await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, formData);

            showToast(`${field} status updated`);
            setProducts(products.map(p => p._id === productId ? { ...p, [field]: !currentVal } : p));
        } catch (error) {
            console.error('Toggle error:', error);
            showToast('Update failed', 'error');
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-4 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="font-headline fs-2 text-primary fw-bold mb-1">Store Highlights</h2>
                    <p className="text-muted small m-0 uppercase font-label fw-bold opacity-75" style={{ letterSpacing: '1px' }}>Manage Best Sellers, Featured, and Flash Sale Items</p>
                </div>
                <div className="search-box position-relative" style={{ minWidth: '350px' }}>
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <input
                        type="text"
                        className="form-control rounded-pill py-3 ps-5 border-0 shadow-premium"
                        placeholder="Search products to promote..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card border-0 rounded-5 shadow-premium overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 admin-mobile-card-table">
                        <thead className="bg-light bg-opacity-50">
                            <tr>
                                <th className="ps-4 py-4 border-0 font-label extra-small fw-bold opacity-75">PRODUCT INFO</th>
                                <th className="py-4 border-0 font-label extra-small fw-bold opacity-75">CATEGORY</th>
                                <th className="text-center py-4 border-0 font-label extra-small fw-bold opacity-75">MARKET BEST SELLER</th>
                                <th className="text-center py-4 border-0 font-label extra-small fw-bold opacity-75">FRONT PAGE FEATURED</th>
                                <th className="text-center py-4 border-0 font-label extra-small fw-bold opacity-75">FLASH SALE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.map(prod => (
                                <tr key={prod._id} className="transition-all hover-bg-light">
                                    <td className="ps-4 py-4" data-label="Product">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded-4 p-1" style={{ width: 48, height: 48 }}>
                                                <img src={prod.img || prod.image || "/images/reference/product-thumb-1.png"} className="w-100 h-100 object-fit-cover rounded-3" alt="" />
                                            </div>
                                            <div className="fw-bold font-headline">{prod.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-4" data-label="Category">
                                        <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill extra-small fw-bold font-label uppercase" style={{ letterSpacing: '0.5px' }}>{prod.category}</span>
                                    </td>
                                    <td className="text-center" data-label="Best Seller">
                                        <div className="form-check form-switch d-inline-block p-0">
                                            <input
                                                className="form-check-input custom-switch border-primary"
                                                type="checkbox"
                                                checked={prod.isBestSeller}
                                                onChange={() => toggleStatus(prod._id, 'isBestSeller', prod.isBestSeller)}
                                            />
                                        </div>
                                    </td>
                                    <td className="text-center" data-label="Featured">
                                        <div className="form-check form-switch d-inline-block p-0">
                                            <input
                                                className="form-check-input custom-switch border-secondary"
                                                type="checkbox"
                                                checked={prod.isFeatured}
                                                onChange={() => toggleStatus(prod._id, 'isFeatured', prod.isFeatured)}
                                            />
                                        </div>
                                    </td>
                                    <td className="text-center" data-label="Flash Sale">
                                        <div className="form-check form-switch d-inline-block p-0">
                                            <input
                                                className="form-check-input custom-switch border-danger"
                                                type="checkbox"
                                                checked={prod.flashSale}
                                                onChange={() => toggleStatus(prod._id, 'flashSale', prod.flashSale)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BulkUploadTab = ({ onComplete, showToast, setConfirmModal }) => {
    const [rows, setRows] = useState([
        { name: '', description: '', price: '', stock: '', category: 'DATES', image: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/categories`);
            setCategories(data);
        };
        fetchCats();
    }, []);

    const addRow = () => {
        setRows([...rows, { name: '', description: '', price: '', stock: '', category: 'DATES', image: '' }]);
    };

    const removeRow = (idx) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, i) => i !== idx));
    };

    const updateRow = (idx, field, val) => {
        const newRows = [...rows];
        newRows[idx][field] = val;
        setRows(newRows);
    };

    const handleBulkSave = async () => {
        const isValid = rows.every(r => r.name && r.price && r.category);
        if (!isValid) return showToast('Please fill in Name, Price, and Category for all rows.', 'error');

        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/api/products/bulk`, { products: rows }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}` }
            });
            showToast('Bulk products uploaded successfully!');
            setRows([{ name: '', description: '', price: '', stock: '', category: 'DATES', image: '' }]);
            if (onComplete) onComplete();
        } catch (err) {
            showToast('Upload failed: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="font-headline fs-2 text-primary fw-bold mb-1">Bulk Inventory Deployment</h2>
                    <p className="text-muted small m-0 uppercase font-label fw-bold opacity-75" style={{ letterSpacing: '1px' }}>RAPID MULTI-PRODUCT REGISTRY ENGINE</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold font-label extra-small" onClick={addRow}><Plus size={16} /> ADD ANOTHER ROW</button>
                    <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold font-label extra-small shadow-md border-0" onClick={handleBulkSave} disabled={loading}>
                        {loading ? 'DEPLOYING ASSETS...' : 'EXECUTE BATCH UPLOAD'}
                    </button>
                </div>
            </div>

            <div className="card border-0 rounded-5 shadow-premium overflow-hidden border border-opacity-10">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 admin-mobile-card-table bulk-mobile-card-table">
                        <thead className="bg-light bg-opacity-50">
                            <tr className="font-label extra-small fw-bold opacity-75 uppercase" style={{ letterSpacing: '1px' }}>
                                <th className="ps-4">Asset Name</th>
                                <th>Category</th>
                                <th>Price (₹)</th>
                                <th>Stock</th>
                                <th>Image URL</th>
                                <th className="text-center">Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="transition-all hover-bg-light">
                                    <td className="ps-4 py-3" style={{ minWidth: '250px' }} data-label="Asset Name">
                                        <input type="text" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 fw-bold" placeholder="Egyptian Medjool..." value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} />
                                    </td>
                                    <td style={{ minWidth: '180px' }} data-label="Category">
                                        <select className="form-select form-select-sm rounded-4 border-opacity-25 py-2 fw-bold" value={row.category} onChange={(e) => updateRow(idx, 'category', e.target.value)}>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ width: '120px' }} data-label="Price">
                                        <input type="number" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 fw-bold text-secondary" placeholder="999" value={row.price} onChange={(e) => updateRow(idx, 'price', e.target.value)} />
                                    </td>
                                    <td style={{ width: '120px' }} data-label="Stock">
                                        <input type="number" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 fw-bold" placeholder="50" value={row.stock} onChange={(e) => updateRow(idx, 'stock', e.target.value)} />
                                    </td>
                                    <td data-label="Image URL">
                                        <input type="text" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 extra-small text-muted" placeholder="https://..." value={row.image} onChange={(e) => updateRow(idx, 'image', e.target.value)} />
                                    </td>
                                    <td className="text-center" data-label="Control">
                                        <button className="btn btn-sm btn-white border text-danger rounded-circle p-2 shadow-sm transition-all hover-bg-danger hover-text-white" onClick={() => removeRow(idx)}>
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 p-4 rounded-5 bg-primary bg-opacity-5 border border-primary border-opacity-10">
                <p className="extra-small text-primary mb-0 fw-bold font-label uppercase flex align-items-center gap-2"> <Info size={14} /> System Directive: Using direct URLs for images ensures maximum deployment speed. For local files, please use the standard individual product creator.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
