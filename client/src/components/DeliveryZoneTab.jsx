import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Trash, Edit, Search, MapPin, Upload, Filter, X, CheckCircle, AlertCircle
} from 'lucide-react';

const STATE_OPTIONS = [
    {
        name: 'Tamil Nadu',
        aliases: ['Tamil Nadu', 'TN', 'Tamilnadu'],
        pincodeHint: '600001, 600041, 641001',
        districts: [
            'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
            'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur',
            'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
            'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
            'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
            'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
            'Viluppuram', 'Virudhunagar'
        ]
    },
    {
        name: 'Karnataka',
        aliases: ['Karnataka', 'KA'],
        pincodeHint: '560001, 560041, 575001',
        districts: [
            'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
            'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada',
            'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu',
            'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
            'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
        ]
    },
    {
        name: 'Telangana',
        aliases: ['Telangana', 'TS', 'TG'],
        pincodeHint: '500001, 500034, 500081',
        districts: [
            'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad', 'Jagtial',
            'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy',
            'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad',
            'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu',
            'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad',
            'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet',
            'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
        ]
    },
    {
        name: 'Andhra Pradesh',
        aliases: ['Andhra Pradesh', 'AP', 'Andhrapradesh'],
        pincodeHint: '520001, 530001, 515001',
        districts: [
            'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
            'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur',
            'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam',
            'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam',
            'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR'
        ]
    }
];

const defaultFormData = {
    name: '',
    type: 'State',
    value: 'India',
    deliveryCharge: 50,
    minOrderForFreeDelivery: '',
    estimatedDeliveryDays: '2-4 Days',
    isActive: true
};

const getStateByName = (name) => STATE_OPTIONS.find((state) => state.name === name) || STATE_OPTIONS[0];

const inferCoverage = (zone) => {
    if (zone.type === 'State' && zone.value === 'India') return 'india';
    if (zone.type === 'State') return 'state';
    if (zone.type === 'City') return 'district';
    return 'pincodes';
};

const DeliveryZoneTab = ({ showToast, setConfirmModal }) => {
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const firstInputRef = React.useRef(null);
    const bulkFirstInputRef = React.useRef(null);

    const [deliverySubTab, setDeliverySubTab] = useState('zones');
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [shippingSettings, setShippingSettings] = useState({
        freeShippingThreshold: 1999
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [coverage, setCoverage] = useState('india');
    const [selectedState, setSelectedState] = useState('Tamil Nadu');
    const [selectedDistrict, setSelectedDistrict] = useState('Chennai');
    const [pincodeList, setPincodeList] = useState('');
    const [formData, setFormData] = useState({ ...defaultFormData, name: 'All India Delivery' });
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkData, setBulkData] = useState({
        pincodes: '',
        name: '',
        deliveryCharge: 50
    });

    const currentState = getStateByName(selectedState);
    const parsedPincodes = pincodeList.split(/[\s,]+/).map((pin) => pin.trim()).filter(Boolean);
    const bulkParsedPincodes = bulkData.pincodes.split(/[\s,]+/).map((pin) => pin.trim()).filter(Boolean);

    useEffect(() => {
        if (!showForm && !bulkMode) return;
        const focusTarget = bulkMode ? bulkFirstInputRef.current : firstInputRef.current;
        if (focusTarget) {
            window.requestAnimationFrame(() => focusTarget.focus());
        }
    }, [showForm, bulkMode]);

    const resetForm = () => {
        setEditId(null);
        setCoverage('india');
        setSelectedState('Tamil Nadu');
        setSelectedDistrict('Chennai');
        setPincodeList('');
        setFormData({ ...defaultFormData, name: 'All India Delivery', value: 'India' });
    };

    const fetchZones = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/delivery/zones`);
            setZones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch zones:', error);
            setZones([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchShippingSettings = async () => {
        try {
            setSettingsLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/homepage`);
            setShippingSettings({
                freeShippingThreshold: data.freeShippingThreshold ?? 1999
            });
        } catch (error) {
            console.error('Failed to fetch shipping settings:', error);
        } finally {
            setSettingsLoading(false);
        }
    };

    const saveShippingSettings = async (e) => {
        e.preventDefault();
        try {
            setSavingSettings(true);
            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/homepage`, {
                freeShippingThreshold: Number(shippingSettings.freeShippingThreshold)
            });
            showToast('Free shipping rule updated');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update shipping settings', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    useEffect(() => {
        fetchZones();
        fetchShippingSettings();
    }, []);

    const handleStateChange = (stateName) => {
        const nextState = getStateByName(stateName);
        setSelectedState(nextState.name);
        setSelectedDistrict(nextState.districts[0]);
        if (coverage === 'state') {
            setFormData((prev) => ({ ...prev, type: 'State', value: nextState.name, name: prev.name || `${nextState.name} Delivery` }));
        }
    };

    const handleCoverageChange = (nextCoverage) => {
        setCoverage(nextCoverage);
        if (nextCoverage === 'india') {
            setFormData((prev) => ({ ...prev, type: 'State', value: 'India', name: prev.name || 'All India Delivery' }));
        }
        if (nextCoverage === 'state') {
            setFormData((prev) => ({ ...prev, type: 'State', value: selectedState, name: prev.name || `${selectedState} Delivery` }));
        }
        if (nextCoverage === 'district') {
            setFormData((prev) => ({ ...prev, type: 'City', value: selectedDistrict, name: prev.name || `${selectedDistrict} Delivery` }));
        }
        if (nextCoverage === 'pincodes') {
            setFormData((prev) => ({ ...prev, type: 'Pincode', value: pincodeList.split(/[\s,]+/).filter(Boolean)[0] || '' }));
        }
    };

    const buildPayload = () => {
        if (coverage === 'india') {
            return { ...formData, type: 'State', value: 'India', name: formData.name || 'All India Delivery' };
        }
        if (coverage === 'state') {
            return { ...formData, type: 'State', value: selectedState };
        }
        if (coverage === 'district') {
            return { ...formData, type: 'City', value: selectedDistrict };
        }
        const pincodes = pincodeList.split(/[\s,]+/).map((pin) => pin.trim()).filter(Boolean);
        return { ...formData, type: 'Pincode', value: pincodes[0] || '' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = buildPayload();

        const errors = {};
        if (!payload.name.trim()) errors.name = 'Zone name is required';
        if (coverage === 'pincodes') {
            if (parsedPincodes.length === 0) {
                errors.pincodes = 'At least one pincode is required';
            } else {
                const invalid = parsedPincodes.find((pin) => !/^\d{6}$/.test(pin));
                if (invalid) errors.pincodes = 'Pincode must be exactly 6 digits';
                const uniquePins = new Set(parsedPincodes);
                if (uniquePins.size !== parsedPincodes.length) errors.pincodes = 'Duplicate pincodes are not allowed';
                const existingPins = new Set(
                    zones
                        .filter((zone) => zone.type === 'Pincode' && (!editId || zone.id !== editId))
                        .map((zone) => String(zone.value || '').trim())
                );
                const duplicateExisting = parsedPincodes.find((pin) => existingPins.has(pin));
                if (duplicateExisting) errors.pincodes = `Pincode ${duplicateExisting} already exists`;
            }
        } else {
            const normalizedValue = String(payload.value || '').trim().toLowerCase();
            const duplicateZone = zones.find((zone) => (
                (!editId || zone.id !== editId)
                && String(zone.type || '').toLowerCase() === String(payload.type || '').toLowerCase()
                && String(zone.value || '').trim().toLowerCase() === normalizedValue
            ));
            if (duplicateZone) {
                errors.name = 'A zone with this coverage already exists';
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSaving(true);
        try {
            if (coverage === 'pincodes' && !editId) {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/delivery/zones/bulk`, {
                    pincodes: parsedPincodes,
                    name: payload.name || `${selectedState} Pincode Zone`,
                    deliveryCharge: payload.deliveryCharge
                });
                showToast(`${parsedPincodes.length} pincodes added to delivery zones`);
            } else if (editId) {
                if (coverage === 'pincodes' && parsedPincodes.length > 1) {
                    showToast('Edit mode supports one pincode. Use Create Zone or Bulk Upload for many pincodes.', 'error');
                    setIsSaving(false);
                    return;
                }
                await axios.put(`${import.meta.env.VITE_API_URL}/api/delivery/zones/${editId}`, payload);
                showToast('Delivery zone updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/delivery/zones`, payload);
                showToast('New delivery zone created');
            }

            fetchZones();
            setShowForm(false);
            resetForm();
            setFormErrors({});
        } catch (error) {
            showToast(error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (bulkParsedPincodes.length === 0) errors.bulkPincodes = 'At least one pincode is required';
        const invalid = bulkParsedPincodes.find((pin) => !/^\d{6}$/.test(pin));
        if (invalid) errors.bulkPincodes = 'Pincode must be exactly 6 digits';
        if (new Set(bulkParsedPincodes).size !== bulkParsedPincodes.length) errors.bulkPincodes = 'Duplicate pincodes are not allowed';
        const existingPins = new Set(
            zones
                .filter((zone) => zone.type === 'Pincode')
                .map((zone) => String(zone.value || '').trim())
        );
        const duplicateExisting = bulkParsedPincodes.find((pin) => existingPins.has(pin));
        if (duplicateExisting) errors.bulkPincodes = `Pincode ${duplicateExisting} already exists`;

        if (Object.keys(errors).length > 0) {
            setFormErrors((prev) => ({ ...prev, ...errors }));
            return;
        }

        setIsSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/delivery/zones/bulk`, {
                pincodes: bulkParsedPincodes,
                name: bulkData.name,
                deliveryCharge: bulkData.deliveryCharge
            });
            showToast(`Bulk upload complete: ${bulkParsedPincodes.length} pincodes added`);
            fetchZones();
            setBulkMode(false);
            setBulkData({ pincodes: '', name: '', deliveryCharge: 50 });
            setFormErrors({});
        } catch (error) {
            showToast(error.response?.data?.message || 'Bulk upload failed', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete Delivery Zone',
            message: 'Are you sure you want to remove this delivery zone? Customers in this area may no longer be able to place orders.',
            onConfirm: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/delivery/zones/${id}`);
                    showToast('Zone deleted successfully');
                    fetchZones();
                } catch (error) {
                    showToast('Deletion failed', 'error');
                }
            }
        });
    };

    const startEdit = (zone) => {
        const nextCoverage = inferCoverage(zone);
        const matchedState = STATE_OPTIONS.find((state) => state.aliases.includes(zone.value)) || STATE_OPTIONS[0];
        const districtState = STATE_OPTIONS.find((state) => state.districts.includes(zone.value)) || matchedState;

        setEditId(zone.id);
        setCoverage(nextCoverage);
        setSelectedState(nextCoverage === 'district' ? districtState.name : matchedState.name);
        setSelectedDistrict(nextCoverage === 'district' ? zone.value : districtState.districts[0]);
        setPincodeList(nextCoverage === 'pincodes' ? zone.value : '');
        setFormData({
            name: zone.name,
            type: zone.type,
            value: zone.value,
            deliveryCharge: zone.deliveryCharge,
            minOrderForFreeDelivery: zone.minOrderForFreeDelivery || '',
            estimatedDeliveryDays: zone.estimatedDeliveryDays,
            isActive: zone.isActive
        });
        setShowForm(true);
    };

    const filteredZones = zones.filter((zone) =>
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="delivery-zone-manager animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="font-headline fs-2 text-primary m-0 fw-bold">Delivery Zones</h2>
                    <p className="font-body text-muted small mt-1">Configure serviceable areas and dynamic delivery charges.</p>
                </div>
                {deliverySubTab === 'zones' && (
                    <div className="d-flex gap-2">
                        <button className="btn btn-white border fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm" onClick={() => setBulkMode(true)}>
                            <Upload size={16} /> Bulk Upload
                        </button>
                        <button className="btn btn-primary text-white fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm border-0" onClick={() => { resetForm(); setShowForm(true); }}>
                            <Plus size={16} /> Create Zone
                        </button>
                    </div>
                )}
            </div>

            <div className="delivery-subtabs d-flex flex-wrap gap-2 mb-4">
                <button className={`delivery-subtab ${deliverySubTab === 'zones' ? 'active' : ''}`} onClick={() => setDeliverySubTab('zones')}>
                    Delivery Zones
                </button>
                <button className={`delivery-subtab ${deliverySubTab === 'free-shipping' ? 'active' : ''}`} onClick={() => setDeliverySubTab('free-shipping')}>
                    Free Shipping
                </button>
            </div>

            {deliverySubTab === 'free-shipping' && (
                <div className="bg-white rounded-4 shadow-sm border border-opacity-50 p-4 p-md-5 mb-4">
                    <div className="mb-4">
                        <h4 className="font-headline text-primary fw-bold mb-1">Above Order Free Shipping</h4>
                        <p className="font-body text-muted small mb-0">Orders above this subtotal get free delivery automatically at checkout.</p>
                    </div>
                    {settingsLoading ? (
                        <div className="py-4 text-muted fw-bold">Loading shipping settings...</div>
                    ) : (
                        <form onSubmit={saveShippingSettings} className="row g-4 align-items-end">
                            <div className="col-md-6">
                                <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Free Shipping Threshold (Rs.)</label>
                                <input
                                    type="number"
                                    className="form-control rounded-4 py-3"
                                    value={shippingSettings.freeShippingThreshold}
                                    onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold border-0 d-flex align-items-center justify-content-center gap-2" disabled={savingSettings}>
                                     {savingSettings ? (
                                         <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> SAVING...</>
                                     ) : 'SAVE FREE SHIPPING RULE'}
                                 </button>
                             </div>
                        </form>
                    )}
                </div>
            )}

            {deliverySubTab === 'zones' && (showForm || bulkMode) && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content p-5 rounded-4 shadow-lg border border-opacity-50 bg-white" style={{ maxWidth: '680px', width: '100%' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h4 className="font-headline text-primary m-0 fw-bold">
                                {bulkMode ? 'Bulk Upload Pincodes' : (editId ? 'Edit Delivery Zone' : 'Create New Zone')}
                            </h4>
                            <button className="btn-close-admin" onClick={() => { setShowForm(false); setBulkMode(false); resetForm(); }}>
                                <X size={24} />
                            </button>
                        </div>

                        {bulkMode ? (
                            <form onSubmit={handleBulkSubmit}>
                                <div className="mb-4">
                                    <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Zone Name (Optional)</label>
                                    <input ref={bulkFirstInputRef} type="text" className="form-control rounded-4 py-3" placeholder="e.g. South Chennai" value={bulkData.name} onChange={(e) => setBulkData({ ...bulkData, name: e.target.value })} />
                                </div>
                                <div className="mb-4">
                                    <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Pincodes</label>
                                    <textarea className={`form-control rounded-4 ${formErrors.bulkPincodes ? 'is-invalid' : ''}`} rows="5" placeholder="600001, 600002, 600003..." value={bulkData.pincodes} onChange={(e) => {
                                        setBulkData({ ...bulkData, pincodes: e.target.value.replace(/[^\d,\s]/g, '') });
                                        if (formErrors.bulkPincodes) setFormErrors({ ...formErrors, bulkPincodes: null });
                                    }} required />
                                    {formErrors.bulkPincodes && <div className="invalid-feedback d-block">{formErrors.bulkPincodes}</div>}
                                    <small className="text-muted d-block mt-2">Use 6-digit pincodes separated by comma or new line.</small>
                                </div>
                                <div className="mb-4">
                                    <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Delivery Charge (Rs.)</label>
                                    <input type="number" className="form-control rounded-4 py-3" value={bulkData.deliveryCharge} onChange={(e) => setBulkData({ ...bulkData, deliveryCharge: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold uppercase tracking-widest font-label extra-small shadow-md border-0 mt-3" disabled={isSaving || bulkParsedPincodes.length === 0 || !!formErrors.bulkPincodes}>{isSaving ? 'PROCESSING...' : 'START BULK UPLOAD'}</button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                         <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Zone Name</label>
                                         <input 
                                             type="text" 
                                             className={`form-control rounded-4 py-3 ${formErrors.name ? 'is-invalid' : ''}`} 
                                             ref={firstInputRef}
                                             value={formData.name} 
                                             onChange={(e) => {
                                                 setFormData({ ...formData, name: e.target.value });
                                                 if(formErrors.name) setFormErrors({...formErrors, name: null});
                                             }} 
                                         />
                                         {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                                     </div>
                                    <div className="col-md-6">
                                        <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Coverage</label>
                                        <select className="form-select rounded-4 py-3" value={coverage} onChange={(e) => handleCoverageChange(e.target.value)}>
                                            <option value="india">All India default fallback</option>
                                            <option value="state">All pincodes in selected state</option>
                                            <option value="district">All pincodes in selected district</option>
                                            <option value="pincodes">Only selected pincodes</option>
                                        </select>
                                    </div>

                                    {coverage !== 'india' && (
                                        <div className="col-md-6">
                                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">State</label>
                                            <select className="form-select rounded-4 py-3" value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                                                {STATE_OPTIONS.map((state) => (
                                                    <option key={state.name} value={state.name}>{state.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {coverage === 'district' && (
                                        <div className="col-md-6">
                                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">District</label>
                                            <select className="form-select rounded-4 py-3" value={selectedDistrict} onChange={(e) => {
                                                setSelectedDistrict(e.target.value);
                                                setFormData((prev) => ({ ...prev, type: 'City', value: e.target.value, name: prev.name || `${e.target.value} Delivery` }));
                                            }}>
                                                {currentState.districts.map((district) => (
                                                    <option key={district} value={district}>{district}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                        <div className="col-12">
                                            <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Selected Pincodes</label>
                                            <textarea
                                                className={`form-control rounded-4 ${formErrors.pincodes ? 'is-invalid' : ''}`}
                                                rows="4"
                                                placeholder={`Example: ${currentState.pincodeHint}`}
                                                value={pincodeList}
                                                onChange={(e) => {
                                                    setPincodeList(e.target.value.replace(/[^\d,\s]/g, ''));
                                                    if(formErrors.pincodes) setFormErrors({...formErrors, pincodes: null});
                                                }}
                                            />
                                            {formErrors.pincodes && <div className="invalid-feedback">{formErrors.pincodes}</div>}
                                            <small className="text-muted d-block mt-2">Separate multiple pincodes with commas or new lines.</small>
                                        </div>

                                    <div className="col-12">
                                        <div className="zone-preview-box">
                                            <span className="zone-preview-label">Saved as</span>
                                            <strong>{coverage === 'india' ? 'All India' : coverage === 'state' ? 'State' : coverage === 'district' ? 'City/District' : 'Pincode'}</strong>
                                            <span>{coverage === 'india' ? 'India fallback' : coverage === 'state' ? selectedState : coverage === 'district' ? selectedDistrict : (pincodeList || 'Selected pincodes')}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Delivery Charge (Rs.)</label>
                                        <input type="number" className="form-control rounded-4 py-3" required value={formData.deliveryCharge} onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="admin-label-sm fw-bold mb-2 text-muted uppercase extra-small font-label">Est. Days</label>
                                        <input type="text" className="form-control rounded-4 py-3" value={formData.estimatedDeliveryDays} onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: e.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <div className="form-check form-switch p-0 d-flex align-items-center gap-3">
                                            <input className="form-check-input ms-0" type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                            <label className="form-check-label admin-label-sm fw-bold text-muted uppercase extra-small font-label mb-0">Enable delivery for this zone</label>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold uppercase tracking-widest font-label extra-small shadow-md border-0 mt-5 d-flex align-items-center justify-content-center gap-2" disabled={isSaving || !formData.name.trim() || (coverage === 'pincodes' && parsedPincodes.length === 0)}>
                                    {isSaving ? (
                                        <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> PROCESSING...</>
                                    ) : (editId ? 'UPDATE ZONE' : 'SAVE ZONE')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {deliverySubTab === 'zones' && <div className="bg-white rounded-4 shadow-sm border border-opacity-50 overflow-hidden mt-4">
                <div className="p-4 border-bottom border-opacity-10 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-light bg-opacity-30">
                    <div className="admin-search-bar border shadow-none flex-grow-1" style={{ maxWidth: '400px' }}>
                        <Search size={16} className="text-muted" />
                        <input type="text" placeholder="Filter by name or value..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="d-flex align-items-center gap-3 text-muted extra-small fw-bold uppercase font-label">
                        <Filter size={14} /> {filteredZones.length} Areas Configured
                    </div>
                </div>

                <div className="table-responsive d-none d-md-block">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 font-label extra-small fw-bold text-muted uppercase tracking-widest border-0">Zone Details</th>
                                <th className="px-4 py-3 font-label extra-small fw-bold text-muted uppercase tracking-widest border-0">Type</th>
                                <th className="px-4 py-3 font-label extra-small fw-bold text-muted uppercase tracking-widest border-0">Value</th>
                                <th className="px-4 py-3 font-label extra-small fw-bold text-muted uppercase tracking-widest border-0 text-center">Charge</th>
                                <th className="px-4 py-3 font-label extra-small fw-bold text-muted uppercase tracking-widest border-0 text-center">Status</th>
                                <th className="px-4 py-3 font-label extra-small fw-bold text-muted uppercase tracking-widest border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary" role="status" /></td></tr>
                            ) : filteredZones.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No zones found.</td></tr>
                            ) : filteredZones.map((zone) => (
                                <tr key={zone.id}>
                                    <td className="px-4 py-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="zone-icon-circle bg-secondary bg-opacity-10 text-secondary">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold font-headline text-primary small">{zone.name}</h6>
                                                <p className="mb-0 extra-small text-muted font-body">Est: {zone.estimatedDeliveryDays}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4"><span className="badge bg-light text-dark fw-bold border px-2 py-1 extra-small">{zone.type}</span></td>
                                    <td className="px-4 fw-bold font-label text-primary">{zone.value}</td>
                                    <td className="px-4 text-center fw-bold text-secondary">Rs. {zone.deliveryCharge}</td>
                                    <td className="px-4 text-center">
                                        {zone.isActive ? (
                                            <span className="badge-active-mini"><CheckCircle size={10} className="me-1" /> ACTIVE</span>
                                        ) : (
                                            <span className="badge-inactive-mini"><AlertCircle size={10} className="me-1" /> DISABLED</span>
                                        )}
                                    </td>
                                    <td className="px-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn-icon-admin edit" onClick={() => startEdit(zone)}><Edit size={16} /></button>
                                            <button className="btn-icon-admin delete" onClick={() => handleDelete(zone.id)}><Trash size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-md-none p-3">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
                    ) : filteredZones.length === 0 ? (
                        <div className="text-center py-5 text-muted">No zones found.</div>
                    ) : filteredZones.map((zone) => (
                        <div key={zone.id} className="bg-white border rounded-4 p-3 mb-3 shadow-sm position-relative">
                            <div className="d-flex align-items-start gap-3 mb-3">
                                <div className="zone-icon-circle bg-secondary bg-opacity-10 text-secondary flex-shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-1 fw-bold font-headline text-primary">{zone.name}</h6>
                                        {zone.isActive ? (
                                            <span className="badge-active-mini"><CheckCircle size={8} className="me-1" /> ACTIVE</span>
                                        ) : (
                                            <span className="badge-inactive-mini"><AlertCircle size={8} className="me-1" /> DISABLED</span>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <span className="badge bg-light text-dark fw-bold border px-2 py-1 extra-small">{zone.type}</span>
                                        <span className="fw-bold font-label text-primary extra-small">{zone.value}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top border-opacity-10">
                                <div>
                                    <p className="mb-0 extra-small text-muted font-body">Est: {zone.estimatedDeliveryDays}</p>
                                    <p className="mb-0 fw-bold text-secondary font-label mt-1">Charge: Rs. {zone.deliveryCharge}</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn-icon-admin edit" onClick={() => startEdit(zone)}><Edit size={16} /></button>
                                    <button className="btn-icon-admin delete" onClick={() => handleDelete(zone.id)}><Trash size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>}

            <style>{`
                .admin-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000;
                    padding: 1rem;
                }
                .admin-modal-content {
                    max-height: 90vh;
                    overflow-y: auto;
                }
                @media (max-width: 768px) {
                    .admin-modal-content { padding: 1.5rem !important; }
                }
                .btn-close-admin {
                    background: transparent; border: none; color: #999;
                    transition: color 0.3s;
                }
                .btn-close-admin:hover { color: #333; }
                .zone-icon-circle {
                    width: 40px; height: 40px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                }
                .delivery-subtab {
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    background: #fff;
                    color: #164333;
                    border-radius: 999px;
                    padding: 10px 18px;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .delivery-subtab.active {
                    background: #164333;
                    border-color: #164333;
                    color: #d4af37;
                }
                .zone-preview-box {
                    display: grid;
                    grid-template-columns: auto auto 1fr;
                    gap: 10px;
                    align-items: center;
                    padding: 12px 14px;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 12px;
                    background: rgba(212, 175, 55, 0.08);
                    color: #164333;
                    font-size: 13px;
                }
                .zone-preview-label {
                    color: #777;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 0.6px;
                }
                .btn-icon-admin {
                    width: 34px; height: 34px; border-radius: 8px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .btn-icon-admin.edit { background: #f0f7ff; color: #0066ff; }
                .btn-icon-admin.delete { background: #fff1f0; color: #ff4d4f; }
                .btn-icon-admin:hover { transform: scale(1.1); }
                .badge-active-mini {
                    background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f;
                    font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
                }
                .badge-inactive-mini {
                    background: #fff1f0; color: #ff4d4f; border: 1px solid #ffa39e;
                    font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default DeliveryZoneTab;
