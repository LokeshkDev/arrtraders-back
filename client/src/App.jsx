import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import FloatingActions from './components/FloatingActions';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import ProductCollectionPage from './pages/ProductCollectionPage';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ShopProvider } from './context/ShopContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Faq from './pages/Faq';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';

const ProductRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToSlug = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        if (data && data.slug) {
          const createSlug = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
          const categorySlug = createSlug(data.category);
          navigate(`/${categorySlug}/${data.slug}`, { replace: true });
        } else {
          navigate('/categories', { replace: true });
        }
      } catch (error) {
        console.error('Redirect error:', error);
        navigate('/categories', { replace: true });
      }
    };
    redirectToSlug();
  }, [id, navigate]);

  return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" role="status"></div></div>;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return <div className="app-container d-flex flex-column min-vh-100">{children}</div>;
  }

  return (
    <div className="app-container d-flex flex-column min-vh-100 pb-5 pb-md-0">
      <ScrollToTop />
      <Header />
      <div className="flex-grow-1 w-100">
        {children}
      </div>
      <Footer />
      <FloatingActions />
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <ShopProvider>
      <CartProvider>
        <WishlistProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:id" element={<Categories />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/featured" element={<ProductCollectionPage type="featured" />} />
              <Route path="/best-sellers" element={<ProductCollectionPage type="bestSeller" />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/product/:id" element={<ProductRedirect />} />
              <Route path="/:categorySlug/:productSlug" element={<ProductDetails />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/order-failure" element={<OrderFailure />} />
            </Routes>
          </Layout>
        </Router>
      </WishlistProvider>
    </CartProvider>
    </ShopProvider>
  );
}

export default App;
