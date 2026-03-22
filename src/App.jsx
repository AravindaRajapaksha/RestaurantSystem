import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ToastProvider } from './context/ToastContext';
import { FoodsProvider } from './context/FoodsContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Shop from './pages/Shop';
import CartDrawer from './components/CartDrawer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Menu from './pages/Menu';
import AdminDashboard from './pages/AdminDashboard';
import AdminManageItems from './pages/AdminManageItems';
import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <FoodsProvider>
        <OrdersProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <div className="app-container">
                  <Navbar />
                  <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/admin-login" element={<AdminLogin />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<Faq />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                      <Route path="/admin/manage" element={<AdminRoute><AdminManageItems /></AdminRoute>} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
                <CartDrawer />
              </Router>
            </ToastProvider>
          </CartProvider>
        </OrdersProvider>
      </FoodsProvider>
    </AuthProvider>
  );
}

export default App;
