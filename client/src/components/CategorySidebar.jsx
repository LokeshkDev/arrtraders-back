import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Apple, 
  Carrot, 
  Milk, 
  Beef, 
  Fish, 
  IceCream, 
  Wheat, 
  Soup,
  ChevronRight
} from 'lucide-react';
import './CategorySidebar.css';

const CategorySidebar = () => {
  const categories = [
    { name: 'Fresh Vegetables', icon: <Carrot size={20} />, count: 12, path: '/category/vegetables' },
    { name: 'Fresh Fruits', icon: <Apple size={20} />, count: 8, path: '/category/fruits' },
    { name: 'Dairy & Eggs', icon: <Milk size={20} />, count: 15, path: '/category/dairy' },
    { name: 'Fresh Meat', icon: <Beef size={20} />, count: 6, path: '/category/meat' },
    { name: 'Sea Food', icon: <Fish size={20} />, count: 9, path: '/category/seafood' },
    { name: 'Frozen Foods', icon: <IceCream size={20} />, count: 11, path: '/category/frozen' },
    { name: 'Grains & Bread', icon: <Wheat size={20} />, count: 22, path: '/category/grains' },
    { name: 'Soups & Pantry', icon: <Soup size={20} />, count: 14, path: '/category/pantry' },
  ];

  return (
    <aside className="category-sidebar-wrap animated slideInLeft">
      <div className="sidebar-header d-none d-lg-block">
        <h3>Top Categories</h3>
      </div>
      <ul className="category-vertical-list">
        {categories.map((cat, idx) => (
          <li key={idx}>
            <Link to={cat.path} className="category-item">
              <span className="icon-wrap">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
              <span className="cat-count d-none d-xl-block">{cat.count}</span>
              <ChevronRight size={14} className="arrow-icon" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <Link to="/categories" className="view-all-btn">
          View All Categories <ChevronRight size={16} />
        </Link>
      </div>
    </aside>
  );
};

export default CategorySidebar;
