// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

import { isFirebaseConfigured } from './services/firebase';
import { CartItem, Product } from './types';

import Header from './components/Header';
import Footer from './components/Footer';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminSalesPage from './pages/AdminSalesPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';

const DemoModeBanner = () => {
    if (isFirebaseConfigured) {
        return null;
    }

    return (
        <div className="bg-amber-400 text-amber-900 font-bold p-3 text-center flex items-center justify-center gap-2">
            <AlertTriangle size={18} />
            <span>Mode Demo Aktif. Perubahan tidak akan disimpan.</span>
        </div>
    );
};

function App() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    // In Demo mode, let's start as authenticated to allow exploring the admin panel.
    const [isAuthenticated, setIsAuthenticated] = useState(!isFirebaseConfigured);

    const addToCart = (product: Product) => {
        setCartItems(prevItems => {
            const itemInCart = prevItems.find(item => item.product.id === product.id);
            if (itemInCart) {
                if(itemInCart.quantity < product.stock) {
                    return prevItems.map(item =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    toast.error(`Stok ${product.name} tidak mencukupi.`);
                    return prevItems;
                }
            }
            return [...prevItems, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setCartItems(prevItems => {
            const productInCart = prevItems.find(item => item.product.id === productId);
            if (productInCart && quantity > productInCart.product.stock) {
                toast.error(`Stok hanya tersisa ${productInCart.product.stock}`);
                return prevItems.map(item =>
                    item.product.id === productId ? { ...item, quantity: productInCart.product.stock } : item
                );
            }
            return prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };
    
    const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <HashRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <DemoModeBanner />
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={!isAuthenticated ? <AdminLoginPage setAuth={setIsAuthenticated} /> : <Navigate to="/admin/dashboard" />} />
                <Route path="/admin/*" element={<AdminLayout isAuth={isAuthenticated} setAuth={setIsAuthenticated} />}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="sales" element={<AdminSalesPage />} />
                    <Route path="employees" element={<AdminEmployeesPage />} />
                </Route>
                
                {/* Customer Facing Routes */}
                <Route path="/*" element={
                    <div className="flex flex-col min-h-screen">
                        <Header cartItemCount={cartItemCount} />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<ShopPage addToCart={addToCart} />} />
                                <Route path="/cart" element={<CartPage cartItems={cartItems} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                } />
            </Routes>
        </HashRouter>
    );
}

export default App;
