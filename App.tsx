// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './services/firebase';
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
import AdminBusinessInfoPage from './pages/AdminBusinessInfoPage';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Memuat Aplikasi...</div>
    </div>
);


function App() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        let sessionUserId = localStorage.getItem('sessionUserId');
        if (!sessionUserId) {
            sessionUserId = crypto.randomUUID();
            localStorage.setItem('sessionUserId', sessionUserId);
        }
        setUserId(sessionUserId);
    }, []);
    
    useEffect(() => {
        // Since firebase.ts will now throw an error if initialization fails,
        // we can safely assume 'auth' is available here and listen for changes.
        const unsubscribe = onAuthStateChanged(auth, user => {
            setIsAuthenticated(!!user);
            setAuthChecked(true);
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


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

    if (!authChecked) {
        return <LoadingSpinner />;
    }

    return (
        <HashRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={!isAuthenticated ? <AdminLoginPage /> : <Navigate to="/admin/dashboard" replace />} />
                
                {/* Protected Admin Routes */}
                {isAuthenticated && (
                    <Route path="/admin/*" element={<AdminLayout isAuth={isAuthenticated} />}>
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="products" element={<AdminProductsPage />} />
                        <Route path="sales" element={<AdminSalesPage />} />
                        <Route path="employees" element={<AdminEmployeesPage />} />
                        <Route path="business-info" element={<AdminBusinessInfoPage />} />
                        {/* Redirect any other /admin path to dashboard */}
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>
                )}
                
                {/* Customer Facing Routes */}
                <Route path="/*" element={
                    <div className="flex flex-col min-h-screen">
                        <Header cartItemCount={cartItemCount} />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<ShopPage addToCart={addToCart} />} />
                                <Route path="/cart" element={<CartPage cartItems={cartItems} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} userId={userId} />} />
                                {/* Redirect any other path to home */}
                                <Route path="*" element={<Navigate to="/" replace />} />
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