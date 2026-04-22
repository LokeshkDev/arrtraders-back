import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter,
  ArrowRight,
  Search,
  ChevronRight,
  ChevronDown,
  Award,
  TrendingUp
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ShopContext } from '../context/ShopContext';
import './Categories.css';

const ALL_PRODUCTS = [
  { _id: 'prod_ajwa_01', name: 'Al-Madina Ajwa', price: 1250, badge: 'PREMIUM QUALITY', img: '/images/reference/product-thumb-1.png', qty: '500g', rating: 4.9, summary: 'Rich, silky dark dates from Medina...', category: 'Dates' },
  { _id: 'prod_medjool_01', name: 'Medjool King', price: 1800, badge: 'BEST SELLER', img: '/images/reference/product-thumb-3.png', qty: '500g', rating: 5.0, summary: 'The king of dates, jumbo-sized...', category: 'Dates' },
  { _id: 'prod_sukkari_01', name: 'Golden Sukkari', price: 950, badge: 'NEW HARVEST', img: '/images/reference/product-thumb-2.png', qty: '500g', rating: 4.8, summary: 'Delicate crystalline texture...', category: 'Dates' },
  { _id: 'prod_mabroom_01', name: 'Premium Mabroom', price: 1100, img: '/images/reference/product-thumb-7.png', qty: '500g', rating: 4.7, summary: 'Chewy and slender dates...', category: 'Dates' },
  { _id: 'prod_almond_01', name: 'California Almonds', price: 1200, img: '/images/reference/product-thumb-11.png', qty: '1kg', rating: 4.9, summary: 'Crunchy and nutrient rich...', category: 'Nuts' },
  { _id: 'prod_cashew_01', name: 'Jumbo Cashews', price: 1100, img: '/images/reference/product-thumb-4.png', qty: '1kg', rating: 4.8, summary: 'Creamy and large cashews...', category: 'Nuts' },
  { _id: 'prod_pistachio_01', name: 'Salted Pistachios', price: 1400, img: '/images/reference/product-thumb-13.png', qty: '1kg', rating: 4.9, summary: 'Perfectly roasted Iranian pistachios...', category: 'Nuts' },
  { _id: 'prod_wellness_01', name: 'Superfood Mix', price: 850, badge: 'HEALTH MIX', img: '/images/reference/product-thumb-8.png', qty: '500g', rating: 4.8, summary: 'Curated blend for daily energy...', category: 'Wellness' },
];

const Categories = () => {
  const { categories, products, getImageUrl, loading } = useContext(ShopContext);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('relevant'); // newly added sorting state
  const [expandedCatId, setExpandedCatId] = useState(null);

  const [searchParams] = useSearchParams();
  const selectedFromUrl = searchParams.get('selected');

  useEffect(() => {
    if (selectedFromUrl) {
      setActiveCategory(selectedFromUrl);
    }
  }, [selectedFromUrl]);

  const toggleExpand = (id) => {
    setExpandedCatId(expandedCatId === id ? null : id);
  };

  const filteredProducts = useMemo(() => {
    const dataSource = products && products.length > 0 ? products : ALL_PRODUCTS; // Fallback to mock if API empty for development preview
    let result = dataSource.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchCat = false;
      if (activeCategory === 'All') {
        matchCat = true;
      } else {
        const activeCatObj = categories.find(c => c.name === activeCategory);
        if (activeCatObj) {
          const childCats = categories.filter(c => c.parent === activeCatObj._id).map(c => c.name);
          if (p.category === activeCategory || childCats.includes(p.category)) {
            matchCat = true;
          }
        } else {
          matchCat = p.category === activeCategory;
        }
      }
      return matchSearch && matchCat;
    });

    if (sortOption === 'lowToHigh') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === 'highToLow') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOption === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [activeCategory, searchQuery, products, sortOption]);

  return (
    <main className="categories-page-app animate-fade-in">
      {/* Top Margin specific to mobile so it doesn't collide with the header */}
      <div className="pt-4 pt-lg-5"></div>

      <div className="container-lg px-2 px-md-3">
        <div className="row g-2 g-md-5">

          {/* SIDEBAR - Desktop Only */}
          <aside className="d-none d-lg-block col-lg-3">
            <div className="sidebar-sticky-wrapper border rounded-4 bg-white shadow-sm p-4 pb-4">
              <div className="search-box-premium mb-4 position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search collection..."
                  className="form-control rounded-pill ps-5 py-3 border bg-light shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <h5 className="fw-bold mb-3 font-headline text-secondary ps-2 fs-6">Categories</h5>

              <ul className="list-unstyled mb-0 overflow-auto" style={{ maxHeight: '600px' }}>
                <li className="category-accordion-item border-bottom py-2">
                  <button
                    className={`w-100 bg-transparent border-0 d-flex align-items-center p-2 rounded transition-all ${activeCategory === 'All' ? 'text-white fw-bold bg-primary' : 'text-secondary hover-bg-light'}`}
                    onClick={() => setActiveCategory('All')}
                  >
                    <span className="text-truncate" style={{ fontSize: '14px' }}>All Collections</span>
                  </button>
                </li>
                <li className="category-accordion-item border-bottom py-2">
                  <Link
                    to="/featured"
                    className="w-100 bg-transparent border-0 d-flex align-items-center gap-3 p-2 rounded transition-all text-secondary hover-bg-light"
                  >
                    <Award size={20} className="text-primary opacity-75" />
                    <span className="text-truncate text-start fw-bold" style={{ fontSize: '14px' }}>Featured Products</span>
                  </Link>
                </li>
                <li className="category-accordion-item border-bottom py-2">
                  <Link
                    to="/best-sellers"
                    className="w-100 bg-transparent border-0 d-flex align-items-center gap-3 p-2 rounded transition-all text-secondary hover-bg-light"
                  >
                    <TrendingUp size={20} className="text-primary opacity-75" />
                    <span className="text-truncate text-start fw-bold" style={{ fontSize: '14px' }}>Best Sellers</span>
                  </Link>
                </li>
                {loading && <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary"></div></div>}
                {!loading && categories.filter(c => !c.parent).map(cat => {
                  const hasChildren = categories.some(c => c.parent === cat._id);
                  const isExpanded = expandedCatId === cat._id || activeCategory === cat.name || categories.some(c => c.parent === cat._id && c.name === activeCategory);

                  return (
                    <React.Fragment key={cat._id}>
                      <li className="category-accordion-item border-bottom py-2">
                        <div className="d-flex w-100 align-items-center">
                          <button
                            className={`flex-grow-1 bg-transparent border-0 d-flex align-items-center gap-3 p-2 rounded transition-all ${activeCategory === cat.name && !hasChildren ? 'text-white fw-bold bg-primary' : 'text-secondary hover-bg-light'}`}
                            onClick={() => { setActiveCategory(cat.name); setExpandedCatId(cat._id); }}
                          >
                            <img src={getImageUrl(cat.image)} alt={cat.name} className="flex-shrink-0 rounded-circle object-fit-cover shadow-sm" style={{ width: '28px', height: '28px' }} />
                            <span className="text-truncate text-start fw-bold" style={{ fontSize: '14px' }}>{cat.name}</span>
                          </button>
                          {hasChildren && (
                            <button className="btn btn-sm btn-link text-muted p-1" onClick={() => toggleExpand(cat._id)}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </div>
                      </li>
                      {hasChildren && isExpanded && categories.filter(c => c.parent === cat._id).map(child => (
                        <li key={child._id} className="category-accordion-item border-bottom py-1 ps-5 bg-light bg-opacity-50">
                          <button
                            className={`w-100 bg-transparent border-0 d-flex align-items-center gap-3 p-2 rounded transition-all ${activeCategory === child.name ? 'text-white fw-bold bg-primary' : 'text-muted hover-bg-light'}`}
                            onClick={() => setActiveCategory(child.name)}
                          >
                            <span className="text-truncate text-start" style={{ fontSize: '13px' }}>↳ {child.name}</span>
                          </button>
                        </li>
                      ))}
                    </React.Fragment>
                  )
                })}
              </ul>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="col-12 col-lg-9">

            {/* MOBILE ONLY: Search and Horizontal Tabs */}
            <div className="d-block d-lg-none">
              <div className="search-box-premium mb-4 position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search collection..."
                  className="form-control rounded-pill ps-5 py-3 border bg-white shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="d-flex overflow-auto gap-2 mb-4 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  className={`btn flex-shrink-0 rounded-pill px-4 ${activeCategory === 'All' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                  onClick={() => setActiveCategory('All')}
                >
                  All Collections
                </button>
                <Link to="/featured" className="btn flex-shrink-0 rounded-pill px-4 btn-outline-secondary bg-white d-flex align-items-center gap-2">
                  <Award size={18} /> Featured
                </Link>
                <Link to="/best-sellers" className="btn flex-shrink-0 rounded-pill px-4 btn-outline-secondary bg-white d-flex align-items-center gap-2">
                  <TrendingUp size={18} /> Best Sellers
                </Link>
                {loading && <div className="spinner-border spinner-border-sm text-primary align-self-center ms-3"></div>}
                {!loading && categories.filter(c => !c.parent).map(cat => (
                  <button
                    key={cat._id}
                    className={`btn flex-shrink-0 rounded-pill px-4 d-flex align-items-center gap-2 ${activeCategory === cat.name || categories.some(c => c.parent === cat._id && c.name === activeCategory) ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'}`}
                    onClick={() => setActiveCategory(cat.name)}
                  >
                    <img src={getImageUrl(cat.image)} alt={cat.name} className="rounded-circle object-fit-cover shadow-sm" style={{ width: '20px', height: '20px' }} />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Mobile Sub-category Row */}
              {activeCategory !== 'All' && (() => {
                const activeCatObj = categories.find(c => c.name === activeCategory);
                const activeParentId = activeCatObj?.parent || activeCatObj?._id;
                const children = categories.filter(c => c.parent === activeParentId);

                if (children.length > 0) {
                  const parentCatName = categories.find(c => c._id === activeParentId)?.name;
                  return (
                    <div className="d-flex overflow-auto gap-2 mb-4 pb-2 border-bottom" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', marginTop: '-15px' }}>
                      <button
                        className={`btn flex-shrink-0 rounded-pill px-3 py-1 font-label extra-small ${activeCategory === parentCatName ? 'btn-secondary text-white' : 'btn-outline-secondary bg-white text-muted border-opacity-50'}`}
                        onClick={() => setActiveCategory(parentCatName)}
                      >
                        All in {parentCatName}
                      </button>
                      {children.map(child => (
                        <button
                          key={child._id}
                          className={`btn flex-shrink-0 rounded-pill px-3 py-1 font-label extra-small ${activeCategory === child.name ? 'btn-secondary text-white shadow-sm' : 'btn-outline-secondary bg-white text-muted border-opacity-50'}`}
                          onClick={() => setActiveCategory(child.name)}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )
                }
                return null;
              })()}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold mb-0 font-headline text-secondary fs-5">Showing {filteredProducts.length} Results</h3>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted d-none d-md-inline">Sort by:</span>
                <select
                  className="form-select form-select-sm rounded-pill px-3 shadow-sm"
                  style={{ minWidth: '150px' }}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="relevant">Relevant</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid (Responsive: 2 on mobile, 3 tablet, 4 desktop) */}
            <div className="row g-2 g-md-4">
              {filteredProducts.map((item) => (
                <div key={item._id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-5 mt-5">
                <img src="/images/reference/empty-cart.png" alt="Empty" className="img-fluid mb-4" style={{ maxWidth: '200px', opacity: 0.5 }} />
                <h4 className="fw-bold text-muted">No products found for this section</h4>
                <button className="btn btn-outline-primary mt-3 rounded-pill" onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>Reset Filters</button>
              </div>
            )}

            {/* Heritage Story - Desktop Only */}
            <div className="mt-5 p-5 rounded-5 shadow-premium text-white position-relative overflow-hidden d-none d-lg-block" style={{ background: 'var(--secondary)' }}>
              <div className="position-absolute top-0 end-0 opacity-10 p-5 mt-n5 me-n5">
                <Award size={200} />
              </div>
              <div className="position-relative" style={{ maxWidth: '600px', zIndex: 2 }}>
                <h2 className="display-6 fw-bold font-headline mb-4">Our Quality Story</h2>
                <p className="mb-4 fs-6 opacity-75 font-body">
                  Sourced from the best organic farms, AR Rahman Dates and Nuts brings you high-quality products for your health and taste.
                </p>
                <Link to="/about" className="btn btn-primary rounded-pill px-5 py-3"> Learn More <ArrowRight size={18} className="ms-2" /></Link>
              </div>
            </div>
          </div>
        </div>

        {/* Heritage Story - Mobile/Tab Full Width */}
        <div className="mt-4 p-4 p-md-5 rounded-4 shadow-premium text-white position-relative overflow-hidden d-block d-lg-none mx-n2 mx-md-0 mb-4" style={{ background: 'var(--secondary)' }}>
          <div className="position-absolute top-0 end-0 opacity-10 p-3 mt-n4 me-n4">
            <Award size={150} />
          </div>
          <div className="position-relative" style={{ zIndex: 2 }}>
            <h2 className="h3 fw-bold font-headline mb-3">Our Quality Story</h2>
            <p className="mb-4 small opacity-75 font-body">
              Sourced from the best organic farms, AR Rahman Dates and Nuts brings you high-quality products for your health.
            </p>
            <Link to="/about" className="btn btn-primary rounded-pill px-4 py-2 small fw-bold"> Learn More <ArrowRight size={16} className="ms-1" /></Link>
          </div>
        </div>
        <div className="pb-5 mb-5 d-lg-none"></div> {/* Spacer for mobile bottom nav */}
      </div>
    </main>
  );
};

export default Categories;
