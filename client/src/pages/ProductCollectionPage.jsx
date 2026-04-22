import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  Filter,
  Search,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ShopContext } from '../context/ShopContext';

const ProductCollectionPage = ({ type = 'featured' }) => {
  const { products, loading } = useContext(ShopContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('relevant');

  const title = type === 'featured' ? 'Featured Collection' : 'Best Selling Products';
  const subtitle = type === 'featured' ? 'Handpicked premium selections from our harvest.' : 'The most loved items by our community.';
  const Icon = type === 'featured' ? Award : TrendingUp;

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products.filter(p => {
      const matchType = type === 'featured' ? p.isFeatured : p.isBestSeller;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });

    if (sortOption === 'lowToHigh') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === 'highToLow') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOption === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [products, searchQuery, sortOption, type]);

  return (
    <main className="categories-page-app animate-fade-in pb-5">
      <div className="pt-4 pt-lg-5"></div>

      <div className="container-lg px-3">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link to="/" className="btn btn-link text-secondary p-0 d-flex align-items-center gap-1 text-decoration-none small fw-bold">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="row g-4 mb-5 align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-primary bg-opacity-10 text-secondary p-3 rounded-4 shadow-sm">
                <Icon size={32} />
              </div>
              <div>
                <h1 className="display-5 fw-bold font-headline mb-1">{title}</h1>
                <p className="text-muted mb-0 font-body">{subtitle}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="search-box-premium position-relative">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search this collection..."
                className="form-control rounded-pill ps-5 py-3 border bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold mb-0 font-headline text-secondary fs-5">
              {loading ? 'Searching...' : `Found ${filteredProducts.length} Results`}
            </h3>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Sort by:</span>
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

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted fw-bold">Loading harvest collections...</p>
          </div>
        ) : (
          <>
            <div className="row g-2 g-md-4">
              {filteredProducts.map((item) => (
                <div key={item._id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard
                    product={item}
                    showFeaturedBadge={type === 'featured'}
                    showBestSellerBadge={type === 'bestSeller'}
                  />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-5 mt-4">
                <div className="bg-light d-inline-block p-4 rounded-circle mb-4">
                  <Search size={48} className="text-muted opacity-50" />
                </div>
                <h4 className="fw-bold text-muted">No items match your search</h4>
                <p className="text-muted small">Try broadening your search or exploring our full catalog.</p>
                <Link to="/categories" className="btn btn-outline-primary mt-3 rounded-pill px-4">Browse All Catalog</Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ProductCollectionPage;
