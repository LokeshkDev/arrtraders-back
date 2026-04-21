import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  ChevronDown,
  CornerDownRight,
  ArrowRight
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import './SideCategoryMenu.css';

const SideCategoryMenu = ({ isOpen, onClose }) => {
  const { categories, getImageUrl, loading } = React.useContext(ShopContext);

  const [expandedCatId, setExpandedCatId] = useState(null);

  const toggleExpand = (e, id) => {
      e.preventDefault();
      e.stopPropagation();
      setExpandedCatId(expandedCatId === id ? null : id);
  };

  return (
    <>
      {/* Overlay */}
      <div className={`side-menu-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      
      {/* Sidebar */}
      <aside className={`side-category-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">MENU</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="menu-body">
          <ul className="category-list list-unstyled mb-0">
            {loading && <li className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm"></div></li>}
            {!loading && categories.filter(c => !c.parent).map((cat) => {
              const hasChildren = categories.some(c => c.parent === cat._id);
              const isExpanded = expandedCatId === cat._id;
              
              return (
              <React.Fragment key={cat._id}>
                <li className="category-item-wrap border-bottom">
                  <div className="d-flex w-100 align-items-stretch">
                      <Link 
                        to={`/categories?selected=${cat.name}`}
                        className="category-main-link d-flex align-items-center justify-content-between text-decoration-none py-3 px-3 hover-bg-light flex-grow-1"
                        onClick={onClose}
                      >
                      <div className="d-flex align-items-center gap-3">
                        <img src={getImageUrl(cat.image)} alt={cat.name} className="flex-shrink-0 rounded-circle object-fit-cover shadow-sm" style={{ width: '30px', height: '30px' }} />
                        <span className="cat-name fw-bold text-secondary text-truncate" style={{ maxWidth: '180px' }}>{cat.name}</span>
                      </div>
                    </Link>
                    {hasChildren ? (
                        <button 
                            className="border-0 bg-transparent px-3 text-muted" 
                            onClick={(e) => toggleExpand(e, cat._id)}
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                    ) : (
                        <Link to={`/categories?selected=${cat.name}`} onClick={onClose} className="d-flex align-items-center px-3 text-muted text-decoration-none">
                            <ChevronRight size={18} />
                        </Link>
                    )}
                  </div>
                </li>
                {hasChildren && isExpanded && (
                    <li className="bg-light bg-opacity-50">
                        <ul className="list-unstyled mb-0">
                           {categories.filter(c => c.parent === cat._id).map(child => (
                               <li key={child._id} className="border-bottom border-white">
                                  <Link 
                                    to={`/categories?selected=${child.name}`}
                                    className="d-flex align-items-center text-decoration-none py-2 px-5 hover-bg-light text-muted"
                                    onClick={onClose}
                                  >
                                    <CornerDownRight size={14} className="me-2 opacity-50" />
                                    <span className="small">{child.name}</span>
                                  </Link>
                               </li>
                           ))}
                        </ul>
                    </li>
                )}
              </React.Fragment>
            )})}
          </ul>
        </div>

      </aside>
    </>
  );
};

export default SideCategoryMenu;
