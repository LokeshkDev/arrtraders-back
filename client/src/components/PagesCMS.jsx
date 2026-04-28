import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, FileText, Info, Image as ImageIcon, 
    Plus, Trash, ChevronRight, Phone, Mail, 
    MapPin, Clock, MessageSquare, HelpCircle, 
    Shield, RefreshCw, Truck
} from 'lucide-react';

const PagesCMS = ({ showToast, setConfirmModal }) => {
    const [selectedSlug, setSelectedSlug] = useState('about');
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const pages = [
        { name: 'About Us', slug: 'about', icon: Info },
        { name: 'Contact Us', slug: 'contact', icon: Phone },
        { name: 'Shipping Policy', slug: 'shipping', icon: Truck },
        { name: 'Return & Refund', slug: 'returns', icon: RefreshCw },
        { name: 'Privacy Policy', slug: 'privacy', icon: Shield },
        { name: 'FAQ', slug: 'faq', icon: HelpCircle },
    ];

    const fetchPage = async (slug) => {
        try {
            setLoading(true);
            setPageData(null); // Reset pageData to prevent stale data rendering
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cms/pages/${slug}`);
            setPageData(data);
        } catch (error) {
            if (error.response?.status === 404) {
                // Initialize default structure if not found
                setPageData({
                    slug,
                    title: pages.find(p => p.slug === slug).name,
                    content: getDefaults(slug),
                    bannerImage: ''
                });
            } else {
                console.error('Fetch page error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const getDefaults = (slug) => {
        switch (slug) {
            case 'about': return {
                heroTitle: 'Our Story', heroSubtitle: 'About Us',
                storyTitle: 'From the Farm to Your Table',
                storyText1: 'AR Rahman Dates and Nuts brings you nature\'s finest treasures...',
                storyText2: 'Our journey began with a simple vision...',
                storyImage: '',
                features: [
                    { icon: '🌿', title: 'Pure Quality', desc: 'No additives or artificial preservatives.' },
                    { icon: '🌍', title: 'Direct Sourcing', desc: 'We work directly with farms.' },
                    { icon: '📦', title: 'Quality Packaging', desc: 'Carefully packed for freshness.' }
                ],
                footerTitle: 'Our Quality Standard',
                footerText: 'Every product is hand-picked and carefully inspected.'
            };
            case 'contact': return {
                subtitle: 'We would love to hear from you.',
                phone: '+91 98765 43210',
                email: 'info@arrahmandates.com',
                address: 'Alwarpet, Chennai, Tamil Nadu',
                hours: 'Mon-Sat: 10:00 AM - 8:00 PM'
            };
            case 'faq': return {
                items: [
                    { q: 'How do I track my order?', a: 'You can track your order using the link sent to your email.' }
                ]
            };
            default: return { text: 'Default policy text...' };
        }
    };

    useEffect(() => {
        fetchPage(selectedSlug);
    }, [selectedSlug]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await axios.put(`${import.meta.env.VITE_API_URL}/api/cms/pages/${selectedSlug}`, pageData);
            showToast('Page updated successfully!');
        } catch (error) {
            showToast('Failed to save page: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/cms/pages/upload`, formData);
            if (field === 'bannerImage') {
                setPageData({ ...pageData, bannerImage: data.url });
            } else {
                setPageData({
                    ...pageData,
                    content: { ...pageData.content, [field]: data.url }
                });
            }
        } catch (error) {
            alert('Image upload failed');
        }
    };

    const updateContentField = (field, value) => {
        setPageData({
            ...pageData,
            content: { ...pageData.content, [field]: value }
        });
    };

    if (loading) return <div className="p-5 text-center text-muted animate-pulse">Loading Page Editor...</div>;

    return (
        <div className="p-4 animate-fade-in">
            <div className="row g-4">
                {/* Sidebar Page Selector */}
                <div className="col-lg-3">
                    <div className="bg-white rounded-5 shadow-premium overflow-hidden border border-opacity-10 sticky-top" style={{ top: '100px' }}>
                        <div className="p-4 border-bottom bg-light bg-opacity-50">
                            <h6 className="m-0 font-label fw-bold text-primary text-uppercase ls-md">Page Registry</h6>
                        </div>
                        <div className="p-2">
                            {pages.map(p => {
                                const Icon = p.icon;
                                const isActive = selectedSlug === p.slug;
                                return (
                                    <button
                                        key={p.slug}
                                        onClick={() => setSelectedSlug(p.slug)}
                                        className={`w-100 border-0 p-3 mb-1 rounded-4 d-flex align-items-center justify-content-between transition-all ${isActive ? 'bg-primary text-white shadow-premium' : 'bg-transparent text-muted hover-bg-light'}`}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <Icon size={18} />
                                            <span className="font-headline fw-bold small">{p.name}</span>
                                        </div>
                                        {isActive && <ChevronRight size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="col-lg-9">
                    <div className="bg-white rounded-5 shadow-premium border border-opacity-10 min-vh-75 overflow-hidden">
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-20">
                            <div>
                                <h4 className="m-0 font-headline text-primary fw-bold">{pageData?.title}</h4>
                                <p className="m-0 extra-small text-muted font-label uppercase fw-bold ls-sm mt-1">Editing /cms/pages/{selectedSlug}</p>
                            </div>
                            <button 
                                className="btn btn-primary rounded-pill px-5 py-2 fw-bold font-label extra-small shadow-premium border-0 d-flex align-items-center gap-2"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'SAVING...' : <><Save size={16} /> SAVE PAGE</>}
                            </button>
                        </div>

                        <div className="p-5">
                            {/* Banner Image (Universal for all pages) */}
                            <div className="mb-5 p-4 bg-light rounded-5 border border-opacity-10">
                                <label className="extra-small text-muted fw-bold mb-3 d-block font-label uppercase ls-sm">Page Banner Image</label>
                                <div className="d-flex align-items-start gap-4">
                                    <div className="bg-white rounded-4 border p-2 shadow-sm" style={{ width: '200px', height: '120px' }}>
                                        {pageData.bannerImage ? (
                                            <img src={pageData.bannerImage} className="w-100 h-100 object-fit-cover rounded-3" alt="" />
                                        ) : (
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted opacity-50 bg-light rounded-3">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow-1">
                                        <input type="file" className="form-control rounded-4 py-3 border-opacity-25" onChange={(e) => handleImageUpload(e, 'bannerImage')} accept="image/*" />
                                        <p className="extra-small text-muted mt-2 mb-0">Recommended: 1920x400px. High resolution artisanal background.</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-5 opacity-10" />

                            {/* Specific Content Based on Page */}
                            {selectedSlug === 'about' && (
                                <div className="row g-4 animate-fade-in">
                                    <div className="col-md-6">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">HERO TITLE</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.heroTitle} onChange={(e) => updateContentField('heroTitle', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">HERO SUBTITLE</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.heroSubtitle} onChange={(e) => updateContentField('heroSubtitle', e.target.value)} />
                                    </div>
                                    <div className="col-12 mt-4">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">STORY TITLE</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.storyTitle} onChange={(e) => updateContentField('storyTitle', e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mt-4">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">STORY TEXT (PARA 1)</label>
                                        <textarea className="form-control rounded-4 py-3 shadow-sm" rows="4" value={pageData.content.storyText1} onChange={(e) => updateContentField('storyText1', e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mt-4">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">STORY TEXT (PARA 2)</label>
                                        <textarea className="form-control rounded-4 py-3 shadow-sm" rows="4" value={pageData.content.storyText2} onChange={(e) => updateContentField('storyText2', e.target.value)} />
                                    </div>
                                    <div className="col-12 mt-5">
                                        <label className="extra-small text-muted fw-bold mb-3 d-block font-label uppercase ls-sm">Story Side Image</label>
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="bg-light rounded-4 border p-2 shadow-sm" style={{ width: '120px', height: '120px' }}>
                                                {pageData.content.storyImage ? <img src={pageData.content.storyImage} className="w-100 h-100 object-fit-cover rounded-3" alt="" /> : <ImageIcon className="m-auto opacity-10" size={64} />}
                                            </div>
                                            <input type="file" className="form-control rounded-4 py-3" onChange={(e) => handleImageUpload(e, 'storyImage')} />
                                        </div>
                                    </div>
                                    <div className="col-12 mt-5">
                                        <h6 className="font-headline text-primary border-bottom pb-2 mb-4">Values / Features</h6>
                                        {(pageData.content.features || []).map((f, idx) => (
                                            <div key={idx} className="row g-3 mb-4 p-3 bg-light bg-opacity-30 rounded-4 border">
                                                <div className="col-md-2">
                                                    <label className="extra-small fw-bold opacity-50 mb-1">ICON/EMOJI</label>
                                                    <input type="text" className="form-control text-center py-2" value={f.icon} onChange={(e) => {
                                                        const nf = [...pageData.content.features];
                                                        nf[idx].icon = e.target.value;
                                                        updateContentField('features', nf);
                                                    }} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="extra-small fw-bold opacity-50 mb-1">TITLE</label>
                                                    <input type="text" className="form-control py-2" value={f.title} onChange={(e) => {
                                                        const nf = [...pageData.content.features];
                                                        nf[idx].title = e.target.value;
                                                        updateContentField('features', nf);
                                                    }} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="extra-small fw-bold opacity-50 mb-1">DESCRIPTION</label>
                                                    <input type="text" className="form-control py-2" value={f.desc} onChange={(e) => {
                                                        const nf = [...pageData.content.features];
                                                        nf[idx].desc = e.target.value;
                                                        updateContentField('features', nf);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-md-6 mt-5">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">FOOTER SECTION TITLE</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.footerTitle} onChange={(e) => updateContentField('footerTitle', e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mt-5">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">FOOTER SECTION TEXT</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.footerText} onChange={(e) => updateContentField('footerText', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {selectedSlug === 'contact' && (
                                <div className="row g-4 animate-fade-in">
                                    <div className="col-12">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">SUBTITLE</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.subtitle} onChange={(e) => updateContentField('subtitle', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">PHONE NUMBER</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.phone} onChange={(e) => updateContentField('phone', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">EMAIL ADDRESS</label>
                                        <input type="email" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.email} onChange={(e) => updateContentField('email', e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">STORE ADDRESS</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.address} onChange={(e) => updateContentField('address', e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="extra-small text-muted fw-bold mb-2 d-block font-label">BUSINESS HOURS TEXT</label>
                                        <input type="text" className="form-control rounded-4 py-3 shadow-sm" value={pageData.content.hours} onChange={(e) => updateContentField('hours', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {selectedSlug === 'faq' && (
                                <div className="animate-fade-in">
                                    {(pageData.content.items || []).map((item, idx) => (
                                        <div key={idx} className="mb-4 p-4 bg-light bg-opacity-30 rounded-4 border position-relative">
                                            <button className="btn btn-sm btn-white border rounded-circle position-absolute top-0 end-0 m-2 text-danger shadow-sm" onClick={() => {
                                                const ni = pageData.content.items.filter((_, i) => i !== idx);
                                                updateContentField('items', ni);
                                            }}><Trash size={14} /></button>
                                            <div className="mb-3">
                                                <label className="extra-small fw-bold opacity-50 mb-1">QUESTION</label>
                                                <input type="text" className="form-control py-2 fw-bold" value={item.q} onChange={(e) => {
                                                    const ni = [...pageData.content.items];
                                                    ni[idx].q = e.target.value;
                                                    updateContentField('items', ni);
                                                }} />
                                            </div>
                                            <div>
                                                <label className="extra-small fw-bold opacity-50 mb-1">ANSWER</label>
                                                <textarea className="form-control py-2" rows="2" value={item.a} onChange={(e) => {
                                                    const ni = [...pageData.content.items];
                                                    ni[idx].a = e.target.value;
                                                    updateContentField('items', ni);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-outline-primary rounded-pill px-4 py-2 font-label extra-small fw-bold" onClick={() => {
                                        updateContentField('items', [...pageData.content.items, { q: '', a: '' }]);
                                    }}><Plus size={16} /> ADD QUESTION</button>
                                </div>
                            )}

                            {['shipping', 'returns', 'privacy'].includes(selectedSlug) && (
                                <div className="animate-fade-in">
                                    <label className="extra-small text-muted fw-bold mb-2 d-block font-label uppercase ls-sm">Policy Content</label>
                                    <textarea 
                                        className="form-control rounded-5 p-4 border-opacity-25 shadow-sm font-body lh-lg" 
                                        rows="15" 
                                        placeholder="Paste your policy text here. Use separate paragraphs for clarity..."
                                        value={pageData.content.text}
                                        onChange={(e) => updateContentField('text', e.target.value)}
                                    />
                                    <p className="extra-small text-muted mt-3 d-flex align-items-center gap-2"> <Info size={14} /> Tip: You can use simple text. Each new line will be treated as a new paragraph in the public view.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PagesCMS;
