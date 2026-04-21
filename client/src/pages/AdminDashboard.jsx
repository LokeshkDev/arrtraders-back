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
    MousePointerClick
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
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
            window.location.href = '/login';
            return;
        }

        fetchOrders();
        const pollInterval = setInterval(() => fetchOrders(true), 30000);

        return () => {
            clearInterval(pollInterval);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [userInfo]);

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
        { id: 'Website', icon: FileEdit },
        { id: 'Highlights', icon: Star }
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="admin-sidebar-brand">
                    <h1 className="font-headline d-flex align-items-center gap-2">
                        <Package size={24} className="text-secondary" />
                        AR <span>RAHMAN</span>
                    </h1>
                    <p className="extra-small opacity-50 uppercase tracking-widest font-label mt-1">Global Marketplace Control</p>
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
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="nav-label">{item.id}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="admin-sidebar-footer">
                    <div className="admin-user-profile bg-white bg-opacity-5 p-3 rounded-4 mx-3 mb-4 border border-white border-opacity-10 shadow-sm transition-all hover-bg-opacity-10">
                        <div className="d-flex align-items-center gap-3">
                            <div className="admin-user-avatar shadow-premium bg-secondary text-primary d-flex align-items-center justify-content-center fw-bold font-headline" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '20px' }}>
                                {userInfo?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                                <p className="admin-label text-white fw-bold mb-0 text-truncate font-headline small">{userInfo?.name || 'Administrator'}</p>
                                <div className="d-flex align-items-center gap-1 opacity-75 extra-small font-label mt-1 text-accent fw-bold uppercase" style={{ letterSpacing: '0.5px' }}>
                                    <div className="rounded-circle bg-success shadow-sm" style={{ width: 6, height: 6 }}></div> Status: Online
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
                    {activeTab === 'Orders' && <OrdersTab orders={orders} fetchOrders={fetchOrders} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />}
                    {activeTab === 'Products' && <ProductsTab />}
                    {activeTab === 'Customers' && <CustomersTab />}
                    {activeTab === 'Website' && <CMSContentTab />}
                    {activeTab === 'Highlights' && <HighlightsTab />}
                </div>

                {/* Global Notification Popup */}
                {newOrder && (
                    <div className="position-fixed bottom-0 end-0 p-4 animate-slide-up" style={{ zIndex: 10000, maxWidth: '400px' }}>
                        <div className="bg-white border-0 shadow-2xl rounded-5 overflow-hidden border border-primary border-opacity-10 d-flex flex-column shadow-lg">
                            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <ShoppingBag size={18} />
                                    <span className="fw-bold font-headline small letter-spacing-1">NEW ORDER RECEIVED</span>
                                </div>
                                <button className="btn btn-link text-white p-0" onClick={() => setNewOrder(null)}><X size={18} /></button>
                            </div>
                            <div className="p-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '50px', height: '50px', fontSize: '18px' }}>
                                        {newOrder.shippingAddress?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold font-headline text-dark">{newOrder.shippingAddress?.name || 'Authorized Customer'}</h6>
                                        <p className="mb-0 text-muted extra-small fw-bold opacity-75">{new Date(newOrder.createdAt).toLocaleTimeString()} • {newOrder.shippingAddress?.city}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center bg-light bg-opacity-50 p-3 rounded-4 border border-opacity-10 mb-4">
                                    <span className="extra-small fw-bold text-muted uppercase font-label">TOTAL AMOUNT</span>
                                    <span className="fs-5 fw-bold text-secondary">₹{newOrder.totalPrice.toLocaleString()}</span>
                                </div>
                                <button 
                                    className="btn btn-primary w-100 rounded-pill py-3 fw-bold font-label extra-small uppercase tracking-widest border-0 shadow-md transition-all hover-scale"
                                    onClick={() => {
                                        setActiveTab('Orders');
                                        setNewOrder(null);
                                        if (audioRef.current) {
                                            audioRef.current.pause();
                                            audioRef.current.currentTime = 0;
                                        }
                                    }}
                                >
                                    VIEW FULL DETAILS
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
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
                    alert('Session expired or unauthorized. Please log out and log back in.');
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
                        <button className="btn btn-outline-primary border-2 fw-bold extra-small mt-5 w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 transition-all hover-invert font-label">
                            ACCESS FULL CATALOG <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [openCategory, setOpenCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [prodForm, setProdForm] = useState({
        name: '', description: '', category: '', price: '', originalPrice: '',
        flashSale: false, discount: '', stock: '', isBestSeller: false,
        isTopRated: false, isFeatured: false, color: '', weight: '',
        unit: 'gram', availableWeights: [], nutrition: {}
    });
    const [nutritionKey, setNutritionKey] = useState('');
    const [nutritionVal, setNutritionVal] = useState('');
    const [customVar, setCustomVar] = useState('');
    const [varPrice, setVarPrice] = useState('');
    const [varOriginalPrice, setVarOriginalPrice] = useState('');
    const [editId, setEditId] = useState(null);
    const [files, setFiles] = useState([]); // Multiple Files Support
    const [showBulkImport, setShowBulkImport] = useState(false); // Integrated Bulk Import Toggle

    // Category Edit State
    const [catForm, setCatForm] = useState({ name: '', description: '', image: '', parent: '' });
    const [editCatId, setEditCatId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/products`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/cms/categories`)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Erase this product record permanently?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) { alert('Deletion failed.'); }
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Erase this category and all its metadata?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/cms/categories/${id}`);
                setCategories(categories.filter(c => c._id !== id));
            } catch (error) { alert('Category deletion failed.'); }
        }
    };

    const handleEditCategory = (cat) => {
        setCatForm({ name: cat.name, description: cat.description || '', image: cat.image, parent: cat.parent || '' });
        setEditCatId(cat._id);
        setView('editCategory');
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', catForm.name);
            formData.append('description', catForm.description);
            formData.append('parent', catForm.parent);
            if (file) formData.append('image', file);

            await axios.post(`${import.meta.env.VITE_API_URL}/api/cms/categories`, formData);
            setView('list');
            fetchData();
            setFile(null);
        } catch (error) { alert('Category creation failed.'); }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', catForm.name);
            formData.append('description', catForm.description);
            formData.append('parent', catForm.parent);
            if (file) formData.append('image', file);

            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/categories/${editCatId}`, formData);
            setView('list');
            fetchData();
            setFile(null);
        } catch (error) { alert('Category update failed.'); }
    };

    const normalizeWeight = (value, unit) => {
        const val = parseFloat(value) || 0;
        const u = String(unit).toLowerCase();
        if (u === 'kg' || u === 'l' || u === 'litre') return val * 1000;
        return val;
    };

    const handleCustomVarChange = (val) => {
        setCustomVar(val);

        if (!prodForm.weight || !prodForm.price) return;

        const numericPart = parseFloat(val);
        if (isNaN(numericPart)) return;

        let unitPart = val.replace(/[0-9.]/g, '').toLowerCase().trim();
        let normalizedInputUnit = unitPart;
        if (unitPart === 'g') normalizedInputUnit = 'gram';
        if (unitPart === 'l') normalizedInputUnit = 'litre';

        const baseGrams = normalizeWeight(prodForm.weight, prodForm.unit);
        const inputGrams = normalizeWeight(numericPart, normalizedInputUnit || prodForm.unit);

        if (baseGrams > 0 && inputGrams > 0) {
            const ratio = inputGrams / baseGrams;
            // Auto-calculate original price from base ORIGINAL price (Orig Val) proportionally
            const baseOrigPrice = prodForm.originalPrice ? Number(prodForm.originalPrice) : Number(prodForm.price);
            setVarOriginalPrice(Math.round(baseOrigPrice * ratio));
            // Leave discount price empty for manual entry
            setVarPrice('');
        }
    };

    const addVariation = (val, priceOverride, origPriceOverride) => {
        if (!val) return;

        let finalVal = '';
        const lowerVal = val.toLowerCase().trim();
        const hasUnit = ['g', 'gram', 'kg', 'ml', 'litre', 'l'].some(u => lowerVal.endsWith(u));

        if (hasUnit) {
            finalVal = String(val);
        } else {
            const unitLabel = prodForm.unit === 'gram' ? 'g' : prodForm.unit === 'kg' ? 'kg' : prodForm.unit === 'ml' ? 'ml' : 'L';
            finalVal = `${val}${unitLabel}`;
        }

        const finalPrice = priceOverride || varPrice || prodForm.price || 0;
        const finalOrigPrice = origPriceOverride || varOriginalPrice || '';
        const newVariation = { value: finalVal, price: Number(finalPrice) };
        if (finalOrigPrice) newVariation.originalPrice = Number(finalOrigPrice);

        setProdForm({ ...prodForm, availableWeights: [...(prodForm.availableWeights || []), newVariation] });
        setCustomVar('');
        setVarPrice('');
        setVarOriginalPrice('');
    };

    const promoteToPrimary = (idx) => {
        const v = prodForm.availableWeights[idx];
        const valString = typeof v === 'object' ? v.value : v;
        const vPrice = typeof v === 'object' ? v.price : prodForm.price;
        const vOrigPrice = typeof v === 'object' ? v.originalPrice : '';

        // Parse numeric part and unit part
        const numPart = parseFloat(valString);
        const unitPart = valString.replace(/[0-9.]/g, '').toLowerCase().trim();

        // Map unitPart back to form field values
        let mappedUnit = prodForm.unit;
        if (unitPart === 'g') mappedUnit = 'gram';
        else if (unitPart === 'kg') mappedUnit = 'kg';
        else if (unitPart === 'ml') mappedUnit = 'ml';
        else if (unitPart === 'l' || unitPart === 'litre') mappedUnit = 'litre';

        // Convert old primary to a variation so data isn't lost
        const primaryUnitLabel = prodForm.unit === 'gram' ? 'g' : prodForm.unit === 'kg' ? 'kg' : prodForm.unit === 'ml' ? 'ml' : 'L';
        const oldPrimaryAsVar = {
            value: `${prodForm.weight}${primaryUnitLabel}`,
            price: Number(prodForm.price)
        };
        if (prodForm.originalPrice) oldPrimaryAsVar.originalPrice = Number(prodForm.originalPrice);

        const newList = [...prodForm.availableWeights];
        newList[idx] = oldPrimaryAsVar;

        setProdForm({
            ...prodForm,
            weight: numPart,
            unit: mappedUnit,
            price: vPrice,
            originalPrice: vOrigPrice || '',
            availableWeights: newList
        });
    };


    const removeVariation = (idx) => {
        const newList = [...prodForm.availableWeights];
        newList.splice(idx, 1);
        setProdForm({ ...prodForm, availableWeights: newList });
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(prodForm).forEach(key => {
                if (key === 'availableWeights') {
                    formData.append('availableWeights', JSON.stringify(prodForm[key]));
                } else if (key === 'nutrition') {
                    formData.append('nutrition', JSON.stringify(prodForm[key] || {}));
                } else if (key === 'images') {
                    formData.append('images', JSON.stringify(prodForm[key] || []));
                } else {
                    formData.append(key, prodForm[key]);
                }
            });

            // Explicitly set primary image if an existing one is selected (at index 0)
            if (prodForm.images && prodForm.images.length > 0) {
                formData.append('primaryImage', prodForm.images[0]);
                formData.append('primaryIsNew', 'false');
            } else if (files.length > 0) {
                formData.append('primaryIsNew', 'true');
            }

            // Append new multi-files
            files.forEach(f => {
                formData.append('images', f);
            });

            if (view === 'editProduct') {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editId}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData);
            }
            setView('list');
            fetchData();
            setFiles([]); // Reset files after upload
        } catch (error) { 
            console.error(error);
            alert('Failed to save product: ' + (error.response?.data?.message || error.message)); 
        }
    };

    if (view === 'addProduct' || view === 'editProduct') {
        return (
            <div className="bg-white p-5 rounded-4 shadow-sm border admin-form-container mx-auto animate-fade-in shadow-lg border-opacity-50" style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                    <div>
                        <h4 className="font-headline text-primary mb-1 fw-bold">{view === 'editProduct' ? 'Edit Product' : 'Add New Product'}</h4>
                        <p className="text-muted extra-small fw-bold m-0 uppercase opacity-75">Category: {prodForm.category || 'Assign Category'}</p>
                    </div>
                    <button className="btn btn-light rounded-pill px-4 border d-flex align-items-center gap-2 shadow-sm font-label extra-small" onClick={() => setView('list')}> <X size={16} /> Cancel</button>
                </div>
                <form onSubmit={handleCreateProduct}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Identity / Product Name</label>
                            <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" required value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Category Department</label>
                            <select className="form-select rounded-4 py-3 border-opacity-25 shadow-sm" required value={prodForm.category} onChange={e => setProdForm({ ...prodForm, category: e.target.value })}>
                                <option value="">Select Department...</option>
                                {categories.filter(c => !c.parent).map(parentCat => (
                                    <React.Fragment key={parentCat._id}>
                                        <option value={parentCat.name} className="fw-bold">{parentCat.name}</option>
                                        {categories.filter(c => c.parent === parentCat._id).map(childCat => (
                                            <option key={childCat._id} value={childCat.name}>&nbsp;&nbsp;&nbsp;↳ {childCat.name}</option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Description</label>
                            <textarea className="form-control rounded-4 border-opacity-25 shadow-sm" rows="5" required value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })}></textarea>
                        </div>
                        <div className="col-md-2">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Unit Val (₹)</label>
                            <input type="number" className="form-control rounded-4 border-opacity-25 shadow-sm" required value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Orig Val (₹)</label>
                            <input type="number" className="form-control rounded-4 border-opacity-25 shadow-sm" value={prodForm.originalPrice} onChange={e => setProdForm({ ...prodForm, originalPrice: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Color / Variant</label>
                            <input type="text" className="form-control rounded-4 border-opacity-25 shadow-sm" placeholder="e.g. Dark Brown" value={prodForm.color} onChange={e => setProdForm({ ...prodForm, color: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Base Weight</label>
                            <input type="number" className="form-control rounded-4 border-opacity-25 shadow-sm" placeholder="Value" value={prodForm.weight} onChange={e => setProdForm({ ...prodForm, weight: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Unit</label>
                            <select className="form-select rounded-4 border-opacity-25 shadow-sm" value={prodForm.unit} onChange={e => setProdForm({ ...prodForm, unit: e.target.value })}>
                                <option value="gram">g</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="litre">L</option>
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Product Options</label>
                            <div className="bg-light p-4 rounded-4 border border-opacity-10 shadow-inner">
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {/* Primary Variation Display */}
                                    {prodForm.weight && prodForm.price && (
                                        <div className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20 px-3 py-2 rounded-pill d-flex align-items-center gap-2 font-label opacity-75 shadow-sm" title="Base Product Settings">
                                            <span className="fw-bold">{prodForm.weight}{prodForm.unit === 'gram' ? 'g' : prodForm.unit === 'kg' ? 'kg' : prodForm.unit === 'ml' ? 'ml' : 'L'}</span>
                                            <span className="opacity-50">|</span>
                                            <span className="text-secondary">₹{prodForm.price} (Primary)</span>
                                            <Info size={12} className="ms-1" />
                                        </div>
                                    )}

                                    {prodForm.availableWeights?.map((w, idx) => {
                                        const wVal = typeof w === 'object' ? w.value : w;
                                        const wOrigPrice = typeof w === 'object' ? w.originalPrice : null;
                                        const wPrice = typeof w === 'object' ? w.price : prodForm.price;
                                        const wDiscountPct = (wOrigPrice && wOrigPrice > wPrice) ? Math.round(((wOrigPrice - wPrice) / wOrigPrice) * 100) : 0;
                                        return (
                                            <div key={idx} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-2 rounded-pill d-flex align-items-center gap-2 font-label transition-all hover-shadow-sm">
                                                <span className="fw-bold">{wVal}</span>
                                                <span className="opacity-50">|</span>
                                                {wOrigPrice && wOrigPrice > wPrice && (
                                                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.75em' }}>₹{wOrigPrice}</span>
                                                )}
                                                <span className="text-secondary">₹{wPrice}</span>
                                                {wDiscountPct > 0 && (
                                                    <span className="bg-danger text-white px-2 py-0 rounded-pill" style={{ fontSize: '0.65em', fontWeight: 700 }}>{wDiscountPct}% OFF</span>
                                                )}
                                                <div className="d-flex align-items-center gap-2 ms-1 ps-2 border-start border-primary border-opacity-10">
                                                    <ArrowUpCircle
                                                        size={14}
                                                        className="cursor-pointer text-primary opacity-50 hover-opacity-100 transition-all"
                                                        title="Set as Primary"
                                                        onClick={() => promoteToPrimary(idx)}
                                                    />
                                                    <X
                                                        size={14}
                                                        className="cursor-pointer text-danger opacity-50 hover-opacity-100 transition-all"
                                                        title="Delete Variation"
                                                        onClick={() => removeVariation(idx)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!prodForm.availableWeights || prodForm.availableWeights.length === 0) && !prodForm.weight && <span className="text-muted extra-small italic opacity-50">No variations configured for this SKU.</span>}
                                </div>

                                <div className="row g-3 align-items-end">
                                    <div className="col-md-3">
                                        <label className="extra-small text-muted fw-bold mb-1 d-block font-label" style={{ fontSize: '0.65rem' }}>WEIGHT</label>
                                        <input type="text" className="form-control rounded-pill border-opacity-25 shadow-sm ps-3 extra-small" placeholder="e.g. 750g" value={customVar} onChange={(e) => handleCustomVarChange(e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="extra-small text-muted fw-bold mb-1 d-block font-label" style={{ fontSize: '0.65rem' }}>ORIGINAL (₹)</label>
                                        <input type="number" className="form-control rounded-pill border-opacity-25 shadow-sm ps-3 extra-small bg-light" placeholder="Auto from base" value={varOriginalPrice} onChange={(e) => setVarOriginalPrice(e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="extra-small text-muted fw-bold mb-1 d-block font-label" style={{ fontSize: '0.65rem' }}>DISCOUNT (₹)</label>
                                        <input type="number" className="form-control rounded-pill border-opacity-25 shadow-sm ps-3 extra-small border-success" placeholder="Sell price" value={varPrice} onChange={(e) => setVarPrice(e.target.value)} />
                                    </div>
                                    <div className="col-md-2 text-center">
                                        {varOriginalPrice && varPrice && Number(varOriginalPrice) > Number(varPrice) ? (
                                            <div className="bg-danger bg-opacity-10 text-danger rounded-pill py-2 fw-bold" style={{ fontSize: '0.75rem' }}>
                                                {Math.round(((Number(varOriginalPrice) - Number(varPrice)) / Number(varOriginalPrice)) * 100)}% OFF
                                            </div>
                                        ) : (
                                            <div className="text-muted opacity-50 py-2" style={{ fontSize: '0.65rem' }}>— % —</div>
                                        )}
                                    </div>
                                    <div className="col-md-3 d-flex gap-2">
                                        <button className="btn btn-secondary rounded-pill px-4 fw-bold extra-small font-label flex-grow-1" type="button" onClick={() => addVariation(customVar, varPrice, varOriginalPrice)}>ADD VARIANT</button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="extra-small text-muted fw-bold me-2 uppercase opacity-50 font-label">Quick Set (Mass):</span>
                                        <div className="d-flex flex-wrap gap-2">
                                            {[250, 500].map(v => (
                                                <button key={`${v}g`} type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3 extra-small fw-bold border-1 transition-all" onClick={() => handleCustomVarChange(`${v}g`)}>+ {v}g</button>
                                            ))}
                                            {[1, 2, 5].map(v => (
                                                <button key={`${v}kg`} type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3 extra-small fw-bold border-1 transition-all" onClick={() => handleCustomVarChange(`${v}kg`)}>+ {v}kg</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="extra-small text-muted fw-bold me-2 uppercase opacity-50 font-label">Quick Set (Volume):</span>
                                        <div className="d-flex flex-wrap gap-2">
                                            {[250, 500].map(v => (
                                                <button key={`${v}ml`} type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3 extra-small fw-bold border-1 transition-all" onClick={() => handleCustomVarChange(`${v}ml`)}>+ {v}ml</button>
                                            ))}
                                            {[1, 2, 5].map(v => (
                                                <button key={`${v}L`} type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3 extra-small fw-bold border-1 transition-all" onClick={() => handleCustomVarChange(`${v}L`)}>+ {v}L</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Warehouse Units</label>
                            <input type="number" className="form-control rounded-4 border-opacity-25 shadow-sm" required value={prodForm.stock} onChange={e => setProdForm({ ...prodForm, stock: e.target.value })} />
                        </div>

                        <div className="col-12">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Product Gallery (Min 1, Max 5)</label>
                            <div className="gallery-upload-container p-4 rounded-4 border border-dashed text-center bg-light bg-opacity-50">
                                <input 
                                    type="file" 
                                    className="form-control d-none" 
                                    id="gallery-input"
                                    multiple 
                                    onChange={e => {
                                        const selectedFiles = Array.from(e.target.files);
                                        setFiles(prev => [...prev, ...selectedFiles].slice(0, 5));
                                    }} 
                                    accept="image/*" 
                                />
                                <label htmlFor="gallery-input" className="cursor-pointer d-flex flex-column align-items-center gap-2">
                                    <div className="bg-white rounded-circle p-3 shadow-sm text-primary mb-2">
                                        <ArrowUpCircle size={32} />
                                    </div>
                                    <span className="fw-bold text-primary font-label extra-small">CLICK TO UPLOAD ASSETS</span>
                                    <span className="text-muted extra-small opacity-75">PNG, JPG or WebP (Up to 5 files)</span>
                                </label>

                                {(files.length > 0 || prodForm.images?.length > 0) && (
                                    <div className="d-flex flex-wrap gap-3 mt-4 pt-4 border-top">
                                        {/* Existing Images */}
                                        {prodForm.images?.map((img, idx) => (
                                            <div key={`existing-${idx}`} className="position-relative gallery-preview-item">
                                                <img src={img} className="rounded-3 border shadow-sm object-fit-cover" style={{ width: '80px', height: '80px' }} />
                                                <button 
                                                    type="button"
                                                    className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle p-1 shadow-sm z-3"
                                                    onClick={() => {
                                                        const newImages = prodForm.images.filter((_, i) => i !== idx);
                                                        setProdForm({ ...prodForm, images: newImages });
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                                {idx === 0 ? (
                                                    <span className="badge bg-primary position-absolute bottom-0 start-50 translate-middle-x mb-1 extra-small" style={{ fontSize: '10px' }}>MAIN</span>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        className="btn btn-white btn-sm rounded-circle position-absolute bottom-0 start-50 translate-middle-x mb-1 p-1 shadow-sm border border-primary text-primary"
                                                        style={{ width: '24px', height: '24px' }}
                                                        onClick={() => {
                                                            const item = prodForm.images[idx];
                                                            const filtered = prodForm.images.filter((_, i) => i !== idx);
                                                            setProdForm({ ...prodForm, images: [item, ...filtered] });
                                                        }}
                                                        title="Set as Main"
                                                    >
                                                        <Star size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {/* New Selection */}
                                        {files.map((f, idx) => (
                                            <div key={`new-${idx}`} className="position-relative gallery-preview-item">
                                                <div className="rounded-3 border shadow-sm bg-white d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '80px', height: '80px' }}>
                                                    <img src={URL.createObjectURL(f)} className="w-100 h-100 object-fit-cover" />
                                                </div>
                                                <button 
                                                    type="button"
                                                    className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle p-1 shadow-sm z-3"
                                                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                                >
                                                    <X size={12} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    className={`btn btn-sm rounded-circle position-absolute bottom-0 start-50 translate-middle-x mb-1 p-1 shadow-sm border ${idx === 0 && prodForm.images?.length === 0 ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}
                                                    style={{ width: '24px', height: '24px' }}
                                                    onClick={() => {
                                                        const item = files[idx];
                                                        const filtered = files.filter((_, i) => i !== idx);
                                                        setFiles([item, ...filtered]);
                                                        // If setting a NEW image as main, we should ideally move existing images after it.
                                                        // For now, we move it to front of files. User might need to remove existing to make it truly MAIN. 
                                                    }}
                                                    title="Set as Main"
                                                >
                                                    <Star size={12} fill={(idx === 0 && prodForm.images?.length === 0) ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nutrition Info Editor */}
                        <div className="col-12">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label" style={{ letterSpacing: '0.05em' }}>Nutrition Information</label>
                            <div className="bg-light p-4 rounded-4 border border-opacity-10 shadow-inner">
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {prodForm.nutrition && Object.keys(prodForm.nutrition).length > 0 ? (
                                        Object.entries(prodForm.nutrition).map(([k, v]) => (
                                            <div key={k} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-2 rounded-pill d-flex align-items-center gap-2 font-label">
                                                <span className="fw-bold">{k}:</span>
                                                <span className="text-secondary">{v}</span>
                                                <X size={14} className="cursor-pointer text-danger opacity-50 hover-opacity-100 transition-all" onClick={() => {
                                                    const newNutrition = { ...prodForm.nutrition };
                                                    delete newNutrition[k];
                                                    setProdForm({ ...prodForm, nutrition: newNutrition });
                                                }} />
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-muted extra-small italic opacity-50">No nutrition data added yet.</span>
                                    )}
                                </div>
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-4">
                                        <label className="extra-small text-muted fw-bold mb-1 d-block font-label" style={{ fontSize: '0.65rem' }}>NUTRIENT NAME</label>
                                        <input type="text" className="form-control rounded-pill border-opacity-25 shadow-sm ps-3 extra-small" placeholder="e.g. Calories, Protein" value={nutritionKey} onChange={(e) => setNutritionKey(e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="extra-small text-muted fw-bold mb-1 d-block font-label" style={{ fontSize: '0.65rem' }}>VALUE</label>
                                        <input type="text" className="form-control rounded-pill border-opacity-25 shadow-sm ps-3 extra-small" placeholder="e.g. 277 kcal, 1.8g" value={nutritionVal} onChange={(e) => setNutritionVal(e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-secondary rounded-pill px-4 fw-bold extra-small font-label w-100" type="button" onClick={() => {
                                            if (nutritionKey.trim() && nutritionVal.trim()) {
                                                setProdForm({ ...prodForm, nutrition: { ...(prodForm.nutrition || {}), [nutritionKey.trim()]: nutritionVal.trim() } });
                                                setNutritionKey('');
                                                setNutritionVal('');
                                            }
                                        }}>ADD NUTRIENT</button>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    <span className="extra-small text-muted fw-bold me-2 uppercase opacity-50 font-label">Quick Add:</span>
                                    {['Calories', 'Protein', 'Fat', 'Carbs', 'Fiber', 'Sugar', 'Sodium', 'Iron', 'Calcium', 'Vitamin C'].map(n => (
                                        <button key={n} type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3 extra-small fw-bold border-1 transition-all" onClick={() => setNutritionKey(n)}>+ {n}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="bg-light p-4 rounded-5 border border-opacity-10 d-flex flex-wrap gap-5 mt-2">
                                <div className="form-check form-switch d-flex align-items-center gap-3">
                                    <input className="form-check-input border-primary shadow-none" style={{ transform: 'scale(1.1)' }} type="checkbox" id="bestSeller" checked={prodForm.isBestSeller} onChange={e => setProdForm({ ...prodForm, isBestSeller: e.target.checked })} />
                                    <label className="form-check-label extra-small fw-bold text-primary" htmlFor="bestSeller">MARKET BEST SELLER</label>
                                </div>
                                <div className="form-check form-switch d-flex align-items-center gap-3">
                                    <input className="form-check-input border-primary shadow-none" style={{ transform: 'scale(1.1)' }} type="checkbox" id="featured" checked={prodForm.isFeatured} onChange={e => setProdForm({ ...prodForm, isFeatured: e.target.checked })} />
                                    <label className="form-check-label extra-small fw-bold text-primary" htmlFor="featured">FRONT PAGE FEATURED</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-5 opacity-10" />
                    <div className="d-flex justify-content-end gap-3">
                        <button type="button" className="btn btn-light px-5 py-3 rounded-pill border fw-bold font-label extra-small" onClick={() => setView('list')}>Discard</button>
                        <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-md border-0 d-flex align-items-center gap-2 font-label extra-small"> <Save size={18} /> Save Product</button>
                    </div>
                </form>
            </div>
        );
    }
    if (view === 'addCategory' || view === 'editCategory') {
        return (
            <div className="bg-white p-5 rounded-4 shadow-sm border admin-form-container mx-auto animate-fade-in shadow-lg border-opacity-50" style={{ maxWidth: '700px' }}>
                <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                    <div>
                        <h4 className="font-headline text-primary mb-1 fw-bold">{view === 'editCategory' ? 'Edit Category' : 'Add New Category'}</h4>
                        <p className="text-muted extra-small fw-bold m-0 uppercase opacity-75">{view === 'editCategory' ? `ID: ${editCatId}` : 'New Collection Registration'}</p>
                    </div>
                    <button className="btn btn-light rounded-pill px-4 border d-flex align-items-center gap-2 shadow-sm font-label extra-small" onClick={() => setView('list')}> <X size={16} /> Cancel</button>
                </div>
                <form onSubmit={view === 'editCategory' ? handleUpdateCategory : handleCreateCategory}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Category Name</label>
                            <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm" required value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Parent Category (Optional)</label>
                            <select className="form-select rounded-4 py-3 border-opacity-25 shadow-sm font-body" value={catForm.parent} onChange={e => setCatForm({ ...catForm, parent: e.target.value })}>
                                <option value="">None (Top-level Category)</option>
                                {categories
                                    .filter(c => c._id !== editCatId && !c.parent) // Only top-level can be parents, prevent self-parenting
                                    .map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                                }
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Description</label>
                            <textarea className="form-control rounded-4 border-opacity-25 shadow-sm" rows="4" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}></textarea>
                        </div>
                        <div className="col-12">
                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Thumbnail Image</label>
                            <input type="file" className="form-control rounded-4 border-opacity-25 shadow-sm" {...(view === 'addCategory' ? { required: true } : {})} onChange={e => setFile(e.target.files[0])} accept="image/*" />
                        </div>
                    </div>
                    <hr className="my-5 opacity-10" />
                    <div className="d-flex justify-content-end gap-3">
                        <button type="button" className="btn btn-light px-5 py-3 rounded-pill border fw-bold font-label extra-small" onClick={() => setView('list')}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-md border-0 d-flex align-items-center gap-2 font-label extra-small">
                            <Save size={18} /> {view === 'editCategory' ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-1 extra-small fw-bold border border-secondary border-opacity-20 d-flex align-items-center gap-1 font-label">
                            <Package size={12} /> INVENTORY HUB
                        </div>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Products & Categories</h2>
                    <p className="font-body text-muted small mt-1">Manage your storefront items and collections.</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        onClick={() => setShowBulkImport(!showBulkImport)}
                        className={`btn ${showBulkImport ? 'btn-secondary' : 'btn-white border'} rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 font-label extra-small py-2 px-4 shadow-sm`}
                    >
                        <ArrowUpCircle size={18} /> {showBulkImport ? 'Back to Catalog' : 'Bulk Import'}
                    </button>
                    <button
                        onClick={() => {
                            setCatForm({ name: '', description: '', image: '', parent: '' });
                            setView('addCategory');
                        }}
                        className="btn btn-white border rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 font-label extra-small py-2 px-4 shadow-sm"
                    >
                        <Plus size={18} /> Add Category
                    </button>
                    <button
                        onClick={() => setView('addProduct')}
                        className="btn btn-primary text-white rounded-pill px-4 fw-bold shadow-md border-0 d-flex align-items-center gap-2 font-label extra-small py-2 px-4"
                    >
                        <Plus size={18} /> Add New Product
                    </button>
                </div>
            </div>

            {showBulkImport ? (
                <div className="animate-fade-in">
                    <BulkUploadTab onComplete={() => { setShowBulkImport(false); fetchData(); }} />
                </div>
            ) : (
                <React.Fragment>
                <div className="bg-white p-3 rounded-4 shadow-sm border mb-4 d-flex flex-wrap gap-3 align-items-center border-opacity-50 border">

                <div className="d-flex align-items-center bg-light rounded-pill px-4 py-2 flex-grow-1 border border-opacity-10 border-primary transition-all focus-within-shadow-sm">
                    <Search size={16} className="text-muted" />
                    <input
                        type="text"
                        className="border-0 bg-transparent ms-2 w-100 font-body outline-none fs-7 fw-bold"
                        placeholder="Search system by product name or SKU identifiers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="form-select border-0 bg-light rounded-pill px-4 py-2 w-auto min-w-220 fs-7 fw-bold shadow-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">All Departmental Catalogs</option>
                    {categories.filter(c => !c.parent).map(parentCat => (
                        <React.Fragment key={parentCat._id}>
                            <option value={parentCat.name} className="fw-bold">{parentCat.name}</option>
                            {categories.filter(c => c.parent === parentCat._id).map(childCat => (
                                <option key={childCat._id} value={childCat.name}>&nbsp;&nbsp;&nbsp;↳ {childCat.name}</option>
                            ))}
                        </React.Fragment>
                    ))}
                </select>
            </div>

            <div className="accordion cat-accordion" id="category-list">
                {categories
                    .filter(cat => !cat.parent) // Only show top-level in the main list
                    .filter(cat => filterCategory === 'All' || cat.name === filterCategory)
                    .map(cat => {
                        const subCats = categories.filter(s => s.parent === cat._id);
                        const childCategoryNames = subCats.map(sc => sc.name);
                        const catProducts = products.filter(p =>
                            (p.category === cat.name || childCategoryNames.includes(p.category)) &&
                            (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        );
                        const isOpen = openCategory === cat._id;

                        return (
                            <div className="accordion-item shadow-none mb-4 border rounded-4 overflow-hidden border-opacity-50" key={cat._id}>
                                <div className={`accordion-header transition-all ${isOpen ? 'bg-primary shadow-md' : 'bg-white'}`}>
                                    <div className="d-flex align-items-center w-100 p-3">
                                        <button
                                            className={`btn w-100 text-start d-flex align-items-center gap-3 border-0 bg-transparent ${isOpen ? 'text-white' : ''}`}
                                            onClick={() => setOpenCategory(isOpen ? null : cat._id)}
                                        >
                                            <div className={`cat-thumb-mini shadow-sm border overflow-hidden rounded-4 transition-all ${isOpen ? 'border-secondary' : 'border-opacity-50'}`} style={{ width: '56px', height: '56px' }}>
                                                <img src={(cat.image?.startsWith('http') || cat.image?.startsWith('/Reference') || cat.image?.startsWith('/images')) ? cat.image : `${import.meta.env.VITE_API_URL}${cat.image}`} alt="" className="w-100 h-100 object-fit-cover" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className={`mb-0 fw-bold fs-6 font-headline text-uppercase transition-all ${isOpen ? 'text-secondary' : 'text-primary'}`} style={{ letterSpacing: '0.5px' }}>{cat.name}</h6>
                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                    <span className={`badge fw-bold extra-small border d-flex align-items-center gap-1 font-label transition-all ${isOpen ? 'bg-white bg-opacity-20 text-white border-white border-opacity-25' : 'bg-success bg-opacity-10 text-success border-success border-opacity-20'}`}>
                                                        <div className={`rounded-circle ${isOpen ? 'bg-white' : 'bg-success'}`} style={{ width: 4, height: 4 }}></div> {catProducts.length} PRODUCTS
                                                    </span>
                                                    {subCats.length > 0 && (
                                                        <span className={`badge fw-bold extra-small border d-flex align-items-center gap-1 font-label transition-all ${isOpen ? 'bg-white bg-opacity-20 text-white border-white border-opacity-25' : 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-10'}`}>
                                                            <Layers size={10} /> {subCats.length} SUB-COLLECTIONS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown size={22} className={`transition-all ${isOpen ? 'rotate-180 text-white' : 'text-muted'}`} />
                                        </button>
                                        <div className="d-flex gap-2 ms-3 border-start ps-4 border-opacity-10">
                                            <button className="btn btn-sm btn-white border rounded-pill p-3 shadow-sm hover-bg-primary hover-text-white transition-all" onClick={() => handleEditCategory(cat)}> <Edit size={16} /> </button>
                                            <button className="btn btn-sm btn-white border text-danger rounded-pill p-3 shadow-sm hover-bg-danger hover-text-white transition-all" onClick={() => handleDeleteCategory(cat._id)}> <Trash size={16} /> </button>
                                        </div>
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
                                                                    <button className="btn btn-sm p-1 text-primary" onClick={(e) => { e.stopPropagation(); handleEditCategory(sc); }}><Edit size={14} /></button>
                                                                    <button className="btn btn-sm p-1 text-danger" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(sc._id); }}><Trash size={14} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <hr className="my-4 opacity-5" />
                                            </div>
                                        )}

                                        <label className="extra-small text-muted fw-bold mb-3 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Products in {cat.name}</label>
                                        <div className="table-responsive rounded-5 border bg-white overflow-hidden shadow-sm border-opacity-50">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="bg-light bg-opacity-50 border-bottom border-opacity-10">
                                                    <tr className="extra-small text-muted uppercase fw-bold font-label" style={{ letterSpacing: '2px' }}>
                                                        <th className="ps-4 py-3">Digital Asset / Name</th>
                                                        <th>Price / Val</th>
                                                        <th>Warehouse Inventory</th>
                                                        <th className="text-center">Control</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {catProducts.length === 0 ? (
                                                        <tr><td colSpan="4" className="text-center py-5 text-muted small italic opacity-50">No matching assets in this catalog department.</td></tr>
                                                    ) : catProducts.map(prod => (
                                                        <tr key={prod._id} className="transition-all hover-scale-xs">
                                                            <td className="ps-4 py-3">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <img src={(prod.image?.startsWith('http') || prod.image?.startsWith('/Reference') || prod.image?.startsWith('/images')) ? prod.image : `${import.meta.env.VITE_API_URL}${prod.image}`} className="cat-thumb-mini border border-opacity-50 rounded-4 shadow-sm" alt="" style={{ width: '50px', height: '50px' }} />
                                                                    <div>
                                                                        <div className="fw-bold fs-7 text-primary">{prod.name}</div>
                                                                        <div className="extra-small text-muted mt-1 fw-bold opacity-75 uppercase font-label" style={{ letterSpacing: '1px' }}>{prod.isBestSeller ? '★ MARKET LEADER' : 'REGISTERED'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td><span className="fw-bold fs-7 text-secondary">₹{(prod.price || 0).toLocaleString()}</span></td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="flex-grow-1 bg-light rounded-pill border border-opacity-10" style={{ height: 8, maxWidth: 120, minWidth: 80 }}>
                                                                        <div className={`rounded-pill h-100 transition-all ${prod.stock < 10 ? 'bg-danger shadow-sm' : 'bg-success shadow-sm'}`} style={{ width: `${Math.min(prod.stock * 2, 100)}%` }}></div>
                                                                    </div>
                                                                    <span className={`fw-bold fs-9 font-label uppercase ${prod.stock < 10 ? 'text-danger' : 'text-success'}`}>{prod.stock} UNITS</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    <button className="btn btn-sm btn-white border shadow-sm p-3 rounded-pill hover-bg-primary hover-text-white transition-all" onClick={() => {
                                                                        const nutritionObj = prod.nutrition ? (typeof prod.nutrition === 'object' && !(prod.nutrition instanceof Map) ? prod.nutrition : Object.fromEntries(prod.nutrition)) : {};
                                                                        setProdForm({ ...prod, availableWeights: Array.isArray(prod.availableWeights) ? prod.availableWeights : (prod.availableWeights ? prod.availableWeights.split(',').map(w => w.trim()) : []), nutrition: nutritionObj });
                                                                        setEditId(prod._id);
                                                                        setView('editProduct');
                                                                    }}><Edit size={16} className="text-primary" /></button>
                                                                    <button className="btn btn-sm btn-white border text-danger shadow-sm p-3 rounded-pill hover-bg-danger hover-text-white transition-all" onClick={() => handleDelete(prod._id)}><Trash size={16} /></button>
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
            </React.Fragment>
        )}
    </div>
);
};

const OrdersTab = ({ orders = [], fetchOrders, soundEnabled, setSoundEnabled }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, { status });
            fetchOrders();
        } catch (error) { alert('Order status update failed.'); }
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

    if (orders.length === 0) return <div className="p-5 text-center text-muted animate-pulse bg-white border rounded-4 shadow-sm"><ShoppingCart className="mx-auto mb-3 opacity-15" size={64} /> No orders found in the registry.</div>;

    const filtered = orders.filter(o => o._id.toLowerCase().includes(searchQuery.toLowerCase()) || o.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 extra-small fw-bold border border-primary border-opacity-20 d-flex align-items-center gap-1 font-label">
                            <ShoppingCart size={12} /> FULFILLMENT CENTER
                        </div>
                        <button 
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`rounded-pill px-3 py-1 extra-small fw-bold border d-flex align-items-center gap-1 font-label transition-all ${soundEnabled ? 'bg-success bg-opacity-10 text-success border-success border-opacity-20' : 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-20'}`}
                            title={soundEnabled ? 'Disable Order Sound' : 'Enable Order Sound'}
                        >
                            {soundEnabled ? <Bell size={12} /> : <BellOff size={12} />}
                            {soundEnabled ? 'SOUND ON' : 'SOUND MUTED'}
                        </button>
                    </div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Active Logistics</h2>
                    <p className="font-body text-muted small mt-1">Real-time tracking of customer transitions and shipments.</p>
                </div>
                <div className="bg-white border rounded-pill px-4 py-2 flex-grow-1 d-flex align-items-center shadow-sm max-w-500 border border-opacity-10 border-primary transition-all focus-within-shadow-md">
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

            <div className="bg-white rounded-5 shadow-sm overflow-hidden border border-opacity-50">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light border-bottom border-opacity-10">
                            <tr className="extra-small text-muted uppercase fw-bold font-label" style={{ letterSpacing: '2px' }}>
                                <th className="ps-4 py-3">Tracking ID / Date</th>
                                <th>Recipient Contact</th>
                                <th>Aggregate Val</th>
                                <th>Logistics Phase</th>
                                <th className="text-center">Executive Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold opacity-50 italic">No shipment records found in current registry.</td></tr>
                            ) : filtered.map(order => (
                                <tr key={order._id}>
                                    <td className="ps-4 py-4">
                                        <div className="fw-bold text-primary fs-7">#{order._id.substring(0, 10).toUpperCase()}</div>
                                        <div className="text-muted extra-small d-flex align-items-center gap-1 mt-1 font-label fw-bold"> <Calendar size={10} /> REGISTERED: {new Date(order.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold fs-7">{order.shippingAddress?.name || 'Authorized Customer'}</div>
                                        <div className="text-muted extra-small fw-bold opacity-75">{order.shippingAddress?.city?.toUpperCase()} LOGISTICS HUB</div>
                                    </td>
                                    <td><span className="fw-bold text-secondary fs-6">₹{order.totalPrice.toLocaleString()}</span></td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm rounded-pill px-3 fs-9 fw-bold border-opacity-25 shadow-sm transition-all py-2"
                                            value={order.status || 'Processing'}
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                            style={{ minWidth: '130px' }}
                                        >
                                            <option value="Processing">PROCESSING</option>
                                            <option value="Shipped">SHIPPED / IN TRANSIT</option>
                                            <option value="Delivered">DELIVERED / SETTLED</option>
                                            <option value="Cancelled">VOID / CANCELLED</option>
                                        </select>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-sm btn-white border shadow-sm rounded-pill p-3 hover-bg-primary hover-text-white transition-all" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>
                                                <Eye size={16} className="text-primary" />
                                            </button>
                                            <button className="btn btn-sm btn-white border shadow-sm text-danger rounded-pill p-3 hover-bg-danger hover-text-white transition-all">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* HIGH-POLY MODAL: Order Details */}
            {showModal && selectedOrder && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-80 d-flex justify-content-center align-items-center p-3 animate-fade-in" style={{ zIndex: 9999, backdropFilter: 'blur(5px)' }}>
                    <div className="bg-white rounded-5 shadow-2xl w-100 overflow-hidden border-0 shadow-lg" style={{ maxWidth: '950px', maxHeight: '94vh' }}>
                        {/* Modal Header */}
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-30">
                            <div>
                                <h4 className="font-headline text-primary m-0 fw-bold d-flex align-items-center gap-2 shadow-text-sm"><Briefcase size={22} /> Order Registry Trace</h4>
                                <span className="extra-small text-muted font-label uppercase mt-1 d-block fw-bold opacity-75">UNIQUE IDENTIFIER: {selectedOrder._id}</span>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-primary btn-sm rounded-pill px-5 shadow-md d-flex align-items-center gap-2 border-0 fw-bold font-label extra-small py-2" onClick={() => generateInvoice(selectedOrder)}> <Download size={14} /> AUTHORIZE INVOICE</button>
                                <button className="btn btn-light btn-sm rounded-circle p-2 border shadow-sm hover-bg-danger hover-text-white transition-all" onClick={() => { setShowModal(false); setSelectedOrder(null); }}> <X size={22} /> </button>
                            </div>
                        </div>
                        {/* Modal Body */}
                        <div className="p-5 overflow-auto admin-modal-body" style={{ maxHeight: '78vh' }}>
                            <div className="row g-5 mb-5">
                                <div className="col-md-6">
                                    <h6 className="font-headline text-primary border-bottom border-opacity-10 pb-3 mb-4 fw-bold d-flex align-items-center gap-2 uppercase font-label" style={{ letterSpacing: '1px' }}><Users size={18} /> Customer Identification</h6>
                                    <div className="bg-light bg-opacity-40 p-4 rounded-5 border border-opacity-10 shadow-inner">
                                        <div className="mb-3 d-flex justify-content-between"><span className="extra-small text-muted uppercase fw-bold opacity-75 font-label">Verified Name:</span> <span className="small fw-bold text-primary">{selectedOrder.shippingAddress?.name || 'Valued Client'}</span></div>
                                        <div className="mb-3 d-flex justify-content-between"><span className="extra-small text-muted uppercase fw-bold opacity-75 font-label">Contact Handle:</span> <span className="small fw-bold text-muted">{selectedOrder.shippingAddress?.phone || 'N/A'}</span></div>
                                        <div className="mb-2"><span className="extra-small text-muted uppercase fw-bold opacity-75 font-label">Shipment Destination:</span> </div>
                                        <p className="mb-0 small fw-bold text-muted lh-large bg-white p-4 rounded-4 border border-opacity-10 mt-2 shadow-sm font-body">
                                            {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.line2}<br />
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="font-headline text-primary border-bottom border-opacity-10 pb-3 mb-4 fw-bold d-flex align-items-center gap-2 uppercase font-label" style={{ letterSpacing: '1px' }}><CreditCard size={18} /> Transaction Audit</h6>
                                    <div className="bg-light bg-opacity-40 p-4 rounded-5 border border-opacity-10 shadow-inner">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <span className="extra-small text-muted uppercase fw-bold opacity-75 font-label">Settlement Mode:</span>
                                            <span className="badge bg-white border text-primary rounded-pill px-4 py-2 fs-9 shadow-sm fw-bold border-opacity-10 font-label">{selectedOrder.paymentMethod?.toUpperCase()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <span className="extra-small text-muted uppercase fw-bold opacity-75 font-label">Receipt Status:</span>
                                            <span className={`badge rounded-pill px-4 py-2 fs-9 shadow-sm fw-bold border-0 ${selectedOrder.isPaid ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                                {selectedOrder.isPaid ? 'PAID / SETTLED' : 'UNPAID / PENDING'}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="extra-small text-muted uppercase fw-bold opacity-75 font-label">Logistics Status:</span>
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-4 py-2 fs-9 fw-bold">
                                                {selectedOrder.status?.toUpperCase() || 'REGISTERED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h6 className="font-headline text-primary border-bottom border-opacity-10 pb-3 mb-4 fw-bold d-flex align-items-center gap-2 uppercase font-label" style={{ letterSpacing: '1px' }}><ShoppingCart size={18} /> Shipment Manifest</h6>
                            <div className="table-responsive rounded-5 border bg-white overflow-hidden shadow-sm border-opacity-50">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light bg-opacity-50 font-label">
                                        <tr className="extra-small text-muted uppercase fw-bold" style={{ letterSpacing: '2px' }}>
                                            <th className="ps-5 py-4">Digital Asset</th>
                                            <th className="text-center">Unit Val</th>
                                            <th className="text-center">Qty</th>
                                            <th className="text-end pe-5">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.orderItems.map((item, idx) => (
                                            <tr key={idx} className="transition-all hover-scale-xs">
                                                <td className="ps-5 py-4">
                                                    <div className="d-flex align-items-center gap-4">
                                                        <img src={item.image} alt={item.name} className="cat-thumb-mini border border-opacity-30 rounded-4 shadow-sm" style={{ width: '64px', height: '64px' }} />
                                                        <div className="d-flex flex-column">
                                                            <span className="small fw-bold text-primary font-headline" style={{ fontSize: '15px' }}>{item.name}</span>
                                                            {item.variant && <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1 mt-1" style={{ fontSize: '11px' }}><Box size={10} /> {item.variant}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center fs-7 fw-bold text-muted">₹{item.price.toLocaleString()}</td>
                                                <td className="text-center fs-7 fw-bold">x{item.qty}</td>
                                                <td className="text-end pe-5 fs-7 fw-bold text-secondary">₹{(item.price * item.qty).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-light bg-opacity-30 font-label">
                                        <tr className="border-top border-opacity-10">
                                            <td colSpan="3" className="text-end py-3 extra-small text-muted fw-bold uppercase">Inventory Valuation:</td>
                                            <td className="text-end pe-5 py-3 fs-7 fw-bold">₹{selectedOrder.itemsPrice.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="text-end py-3 extra-small text-muted fw-bold uppercase">Logistics Surcharge:</td>
                                            <td className="text-end pe-5 py-3 fs-7 fw-bold">₹{selectedOrder.deliveryPrice.toLocaleString()}</td>
                                        </tr>
                                        <tr className="border-top border-opacity-30 bg-primary bg-opacity-5">
                                            <td colSpan="3" className="text-end py-4 fw-bold text-primary font-headline fs-6">Grand Total Registry:</td>
                                            <td className="text-end pe-5 py-4 fw-bold text-primary font-headline fs-3">₹{selectedOrder.totalPrice.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CustomersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', isAdmin: false, password: '' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            setUsers(data);
        } catch (error) {
            console.error('User fetch error:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please re-login.');
                window.location.href = '/login';
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDeleteUser = async (id) => {
        if (window.confirm('Erase this user record from registry?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) { alert('Failed to remove record.'); }
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUser._id}`, {
                name: editForm.name, email: editForm.email, isAdmin: editForm.isAdmin
            });
            if (editForm.password) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUser._id}/reset-password`, { password: editForm.password });
            }
            alert('Identity profile synchronized.');
            setEditUser(null);
            fetchUsers();
        } catch (error) { alert('Synchronization error.'); }
    };

    if (loading) return <div className="p-5 text-center text-muted animate-pulse border bg-white rounded-4 shadow-sm"><Users className="mx-auto mb-3 opacity-15" size={64} /> Analyzing customer registry...</div>;

    const filtered = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

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
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light border-bottom border-opacity-10 font-label">
                            <tr className="extra-small text-muted uppercase fw-bold" style={{ letterSpacing: '2px' }}>
                                <th className="ps-5 py-4">Digital Identity Holder</th>
                                <th>Registry Handle</th>
                                <th>Access Privilege</th>
                                <th className="text-center">Security Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(user => (
                                <tr key={user._id} className="transition-all hover-scale-xs">
                                    <td className="ps-5 py-4">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="rounded-full bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-md border border-white border-2" style={{ width: '46px', height: '46px', fontSize: '20px', borderRadius: '50%' }}>
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-headline fw-bold text-primary" style={{ fontSize: '15px' }}>{user.name || 'ANONYMOUS'}</span>
                                        </div>
                                    </td>
                                    <td className="font-body small text-muted fw-bold opacity-75">{user.email}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-4 py-2 font-label text-uppercase fs-9 fw-bold shadow-sm ${user.isAdmin ? 'bg-secondary text-white' : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10'}`}>
                                            {user.isAdmin ? 'SUPER ADMIN' : 'STORE CUSTOMER'}
                                        </span>
                                    </td>
                                    <td className="text-center">
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
            </div>

            {editUser && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-80 d-flex justify-content-center align-items-center shadow-2xl animate-fade-in" style={{ zIndex: 9999, backdropFilter: 'blur(10px)' }}>
                    <div className="bg-white rounded-5 shadow-2xl p-5 w-100 border-0" style={{ maxWidth: '540px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-opacity-10 pb-4">
                            <div>
                                <h4 className="font-headline text-primary m-0 fw-bold d-flex align-items-center gap-3"><Lock size={22} /> Access Profile Configuration</h4>
                                <p className="extra-small text-muted fw-bold m-0 uppercase opacity-75 mt-2 font-label">SYSTEM ID: {editUser._id}</p>
                            </div>
                            <button className="btn btn-light btn-sm rounded-circle p-2 border shadow-sm hover-bg-danger hover-text-white transition-all" onClick={() => setEditUser(null)}> <X size={24} /> </button>
                        </div>
                        <form onSubmit={handleSaveUser}>
                            <div className="mb-4">
                                <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Registry Holder Name</label>
                                <input type="text" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm font-body fw-bold" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="extra-small text-muted fw-bold mb-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Authorized Email Address</label>
                                <input type="email" className="form-control rounded-4 py-3 border-opacity-25 shadow-sm font-body fw-bold" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                            <div className="mb-4 p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-10 shadow-inner">
                                <div className="form-check form-switch d-flex align-items-center gap-4">
                                    <input className="form-check-input border-primary shadow-none" style={{ transform: 'scale(1.3)' }} type="checkbox" id="userRole" checked={editForm.isAdmin} onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })} />
                                    <label className="form-check-label font-body fw-bold text-primary mb-0 small" htmlFor="userRole">Assign Administrative Access Level</label>
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="extra-small text-danger fw-bold mb-2 uppercase d-flex align-items-center gap-2 opacity-75 font-label" style={{ letterSpacing: '1px' }}> <AlertTriangle size={14} /> SECURITY KEY RESET (PASSWORD) </label>
                                <input type="text" className="form-control rounded-4 py-3 border-opacity-25 border-danger border-opacity-30 shadow-sm" placeholder="Input only to overwrite registry password..." value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                            </div>
                            <div className="d-flex gap-2 justify-content-end mt-4">
                                <button type="button" className="btn btn-light px-5 py-3 rounded-pill border fw-bold font-label extra-small" onClick={() => setEditUser(null)}>DISCARD</button>
                                <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-md border-0 font-label extra-small">SAVE & AUTHORIZE</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CMSContentTab = () => {
    const [cmsData, setCmsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timerValue, setTimerValue] = useState({ hours: 0, minutes: 0 });

    const fetchCMS = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
            setCmsData(data);
        } catch (error) { console.error('CMS fetch error:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchCMS(); }, []);

    const handleSaveCMS = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/homepage`, cmsData);
            alert('Settings saved successfully!');
            fetchCMS();
        } catch (error) { console.error('CMS save error:', error); }
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
                <button className="btn btn-primary rounded-pill px-5 py-3 shadow-md fw-bold d-flex align-items-center gap-3 border-0 transition-all hover-shadow-lg font-label" onClick={handleSaveCMS}> <Save size={20} /> Save Changes </button>
            </div>

            <div className="card shadow-premium border-0 rounded-4 overflow-hidden mb-5">
                <div className="card-header bg-white border-bottom p-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
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
                                                                alert('Image upload failed. Please try again.');
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
                                        <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20">
                                            <div className="mb-3 d-flex align-items-center gap-2">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary"><Star size={18} /></div>
                                                <span className="extra-small fw-bold text-muted uppercase font-label">SLOT {idx + 1}</span>
                                            </div>
                                            <div className="mb-3">
                                                <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Icon Name (Lucide)</label>
                                                <input type="text" className="form-control form-control-sm rounded-pill shadow-sm" value={feature.icon} onChange={(e) => {
                                                    const nf = [...(cmsData.features || [{}, {}, {}, {}])]; nf[idx] = { ...feature, icon: e.target.value }; setCmsData({ ...cmsData, features: nf });
                                                }} />
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
                                        <button className="btn btn-sm btn-danger rounded-circle p-2 position-absolute top-0 end-0 m-3 shadow-md border-0 opacity-0 group-hover-opacity-100 transition-all" onClick={() => {
                                            const nci = [...cmsData.categoryItems]; nci.splice(idx, 1); setCmsData({ ...cmsData, categoryItems: nci });
                                        }}><X size={16} /></button>
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
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>2 LARGE PROMOTIONAL CARDS BEFORE THE NEWS SECTION</p>
                            </div>
                        </div>
                        <div className="row g-4">
                            {[0, 1].map((idx) => {
                                const banner = (cmsData?.experienceBanners || [])[idx] || { title: '', text: '', img: '', btnText: 'Explore', btnStyle: idx === 0 ? 'primary' : 'light' };
                                return (
                                    <div className="col-6" key={idx}>
                                        <div className="p-4 bg-light bg-opacity-40 rounded-5 border border-opacity-20">
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
                                <h4 className="font-headline text-primary fs-5 mb-0 fw-bold d-flex align-items-center gap-3"> <ShoppingCart size={24} /> Website Banners</h4>
                                <p className="text-muted extra-small fw-bold m-0 mt-2 uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Edit Homepage Banners and Promotions</p>
                            </div>
                            <button className="btn btn-outline-primary rounded-pill px-4 py-2 extra-small fw-bold border-2 d-flex align-items-center gap-2 font-label" onClick={() => setCmsData({ ...cmsData, promos: [...(cmsData.promos || []), { title: 'Limited Time Offer', discount: 'SAVE 20%', bg: '#f6f8f8', accentColor: '#0F484E' }] })}> <Plus size={16} /> ADD BANNER</button>
                        </div>
                        <div className="row g-4">
                            {(cmsData?.promos || []).map((promo, idx) => (
                                <div className="col-md-6" key={idx}>
                                    <div className="p-4 rounded-5 border border-opacity-20 transition-all hover-shadow-lg shadow-sm group hover-bg-white" style={{ backgroundColor: promo.bg || '#ffffff', borderLeft: `8px solid ${promo.accentColor || '#6BB252'}` }}>
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div className="badge rounded-pill px-4 py-2 small fw-bold shadow-sm font-label" style={{ backgroundColor: promo.accentColor || '#6BB252', color: '#fff' }}>ACTIVE PROMO</div>
                                            <button className="btn btn-sm btn-white border rounded-pill p-2 shadow-sm text-danger hover-bg-danger hover-text-white transition-all opacity-0 group-hover-opacity-100" onClick={() => {
                                                const np = [...cmsData.promos]; np.splice(idx, 1); setCmsData({ ...cmsData, promos: np });
                                            }}> <Trash size={18} /> </button>
                                        </div>
                                        <div className="row g-4">
                                            <div className="col-md-7">
                                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label" style={{ letterSpacing: '1px' }}>Headline Title</label>
                                                <input type="text" className="form-control rounded-4 py-2 border-opacity-30 shadow-sm font-body fw-bold" value={promo.title} onChange={(e) => handlePromoChange(idx, 'title', e.target.value)} />
                                                <div className="row g-3 mt-3">
                                                    <div className="col-6">
                                                        <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">Accent HEX</label>
                                                        <input type="text" className="form-control form-control-sm rounded-pill font-label shadow-sm" style={{ fontWeight: 800 }} value={promo.accentColor || '#0F484E'} onChange={(e) => handlePromoChange(idx, 'accentColor', e.target.value)} />
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="extra-small text-muted fw-bold mb-1 d-block uppercase opacity-75 font-label">BG HEX</label>
                                                        <input type="text" className="form-control form-control-sm rounded-pill font-label shadow-sm" style={{ fontWeight: 800 }} value={promo.bg || '#f8f8f8'} onChange={(e) => handlePromoChange(idx, 'bg', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                                <label className="extra-small text-muted fw-bold mb-2 d-block uppercase opacity-75 font-label">Asset Overlay</label>
                                                <div className="cat-thumb-mini border border-opacity-10 rounded-5 overflow-hidden shadow-inner bg-white p-3 d-flex align-items-center justify-content-center" style={{ height: '110px' }}>
                                                    <img src={promo.img || '/Reference/images/product-thumb-1.png'} className="h-100 object-fit-contain group-hover-opacity-100 transition-all" alt="" />
                                                </div>
                                                <input type="text" className="form-control form-control-sm rounded-pill mt-3 extra-small font-label" placeholder="Cloud asset URL..." value={promo.img || ''} onChange={(e) => handlePromoChange(idx, 'img', e.target.value)} />
                                            </div>
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
                                                        } catch (err) { alert('Upload failed'); }
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
        </div>
    );
};

const HighlightsTab = () => {
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
            // We need to send FormData because the backend uses Multer
            const formData = new FormData();
            formData.append(field, !currentVal);

            await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, formData);

            // Optimistic Update
            setProducts(products.map(p => p._id === productId ? { ...p, [field]: !currentVal } : p));
        } catch (error) { console.error('Toggle error:', error); }
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
                    <table className="table table-hover align-middle mb-0">
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
                                    <td className="ps-4 py-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded-4 p-1" style={{ width: 48, height: 48 }}>
                                                <img src={prod.img || prod.image || "/images/reference/product-thumb-1.png"} className="w-100 h-100 object-fit-cover rounded-3" alt="" />
                                            </div>
                                            <div className="fw-bold font-headline">{prod.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill extra-small fw-bold font-label uppercase" style={{ letterSpacing: '0.5px' }}>{prod.category}</span>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-inline-block p-0">
                                            <input
                                                className="form-check-input custom-switch border-primary"
                                                type="checkbox"
                                                checked={prod.isBestSeller}
                                                onChange={() => toggleStatus(prod._id, 'isBestSeller', prod.isBestSeller)}
                                            />
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-inline-block p-0">
                                            <input
                                                className="form-check-input custom-switch border-secondary"
                                                type="checkbox"
                                                checked={prod.isFeatured}
                                                onChange={() => toggleStatus(prod._id, 'isFeatured', prod.isFeatured)}
                                            />
                                        </div>
                                    </td>
                                    <td className="text-center">
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

const BulkUploadTab = ({ onComplete }) => {
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
        if (!isValid) return alert('Please fill in Name, Price, and Category for all rows.');

        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/api/products/bulk`, { products: rows }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}` }
            });
            alert('Bulk products uploaded successfully!');
            setRows([{ name: '', description: '', price: '', stock: '', category: 'DATES', image: '' }]);
            if (onComplete) onComplete();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
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
                    <table className="table table-hover align-middle mb-0">
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
                                    <td className="ps-4 py-3" style={{ minWidth: '250px' }}>
                                        <input type="text" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 fw-bold" placeholder="Egyptian Medjool..." value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} />
                                    </td>
                                    <td style={{ minWidth: '180px' }}>
                                        <select className="form-select form-select-sm rounded-4 border-opacity-25 py-2 fw-bold" value={row.category} onChange={(e) => updateRow(idx, 'category', e.target.value)}>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ width: '120px' }}>
                                        <input type="number" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 fw-bold text-secondary" placeholder="999" value={row.price} onChange={(e) => updateRow(idx, 'price', e.target.value)} />
                                    </td>
                                    <td style={{ width: '120px' }}>
                                        <input type="number" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 fw-bold" placeholder="50" value={row.stock} onChange={(e) => updateRow(idx, 'stock', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="text" className="form-control form-control-sm rounded-4 border-opacity-25 py-2 extra-small text-muted" placeholder="https://..." value={row.image} onChange={(e) => updateRow(idx, 'image', e.target.value)} />
                                    </td>
                                    <td className="text-center">
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
