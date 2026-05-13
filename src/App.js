import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BookingPage from './pages/BookingPage';

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/flowers"     element={<CategoryPage category="flowers" />} />
        <Route path="/gifts"       element={<CategoryPage category="gifts" />} />
        <Route path="/parties"     element={<CategoryPage category="parties" />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart"        element={<CartPage />} />
        <Route path="/checkout"    element={<CheckoutPage />} />
        <Route path="/orders"      element={<OrdersPage />} />
        <Route path="/blog"        element={<BlogListPage />} />
        <Route path="/blog/:id"    element={<BlogDetailPage />} />
        <Route path="/book"        element={<BookingPage />} />
        <Route path="/admin"       element={<AdminPage />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <AuthModal />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <AppProvider>
          <CartProvider>
            <BrowserRouter>
              <Layout />
            </BrowserRouter>
          </CartProvider>
        </AppProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}
