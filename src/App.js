import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/flowers"  element={<CategoryPage category="flowers" />} />
        <Route path="/gifts"    element={<CategoryPage category="gifts" />} />
        <Route path="/parties"  element={<CategoryPage category="parties" />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/orders"   element={<OrdersPage />} />
        <Route path="/admin"    element={<AdminPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
