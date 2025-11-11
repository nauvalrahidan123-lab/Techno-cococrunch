import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth'; // Import untuk cek auth

import { auth } from './services/firebase'; // Import auth
import { CartItem, Product } from './types';

// Import Components and Pages
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

// Kunci untuk localStorage
const CART_STORAGE_KEY = 'cococrunch_cart';

function App() {
    // 1. Inisialisasi state keranjang dari LocalStorage (Persistence)
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    });
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true); // Status loading autentikasi

    // 2. [PERBAIKAN]: Sinkronisasi cartItems ke LocalStorage
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]); // Jalankan setiap kali cartItems berubah

    // 3. [PERBAIKAN]: Cek status autentikasi Firebase saat aplikasi dimuat
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User terautentikasi
                setIsAuthenticated(true);
            } else {
                // User logout atau tidak terautentikasi
                setIsAuthenticated(false);
            }
            setAuthLoading(false); // Selesai memuat status auth
        });

        return () => unsubscribe(); // Cleanup listener saat komponen dilepas
    }, []);

    // Logika Cart
    const addToCart = (product: Product) => {
        // ... (Logika addToCart yang sudah ada, tidak perlu diubah) ...
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
        // ... (Logika updateQuantity yang sudah ada, tidak perlu diubah) ...
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

    // Tampilkan loading saat mengecek status autentikasi
    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen text-lg">Memuat Autentikasi...</div>;
    }

    return (
        <HashRouter>
            <Toaster position="top-center" reverseOrder={false} />
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
