import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts } from '../services/firestoreService';
import { Product } from '../types';
import toast from 'react-hot-toast';

const HeroSection = () => {
    const handleScrollToProducts = () => {
        const productsSection = document.getElementById('produk');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="bg-white text-center py-16 px-4 sm:px-6 lg:px-8 rounded-2xl shadow-sm mb-12">
            <h1 className="text-5xl font-display font-extrabold text-brand-dark tracking-tight">
                Cemilan Favorit, Rasa Juara!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                Temukan kelezatan Cococrunch dan Basreng dalam berbagai varian rasa yang bikin nagih. Dibuat dari bahan berkualitas untukmu.
            </p>
            <div className="mt-8">
                <button 
                    onClick={handleScrollToProducts}
                    className="inline-block bg-brand-secondary text-white font-bold py-3 px-8 rounded-full hover:bg-amber-500 transition-transform transform hover:scale-105"
                >
                    Lihat Produk
                </button>
            </div>
        </div>
    );
};

const ProductCard: React.FC<{ product: Product; addToCart: (product: Product) => void; }> = ({ product, addToCart }) => {
    const stockColor = product.stock <= product.minStock ? 'text-red-500' : 'text-green-600';
    const placeholderImage = 'https://images.unsplash.com/photo-1582213794353-764536d3969a?q=80&w=400&h=300&fit=crop';

    // FIX: Use component state to manage image source for robustness.
    // This prevents issues where an invalid imageUrl prop might cause rendering problems
    // and ensures the onError handler correctly falls back to a placeholder.
    const [imageSrc, setImageSrc] = useState(product.imageUrl || placeholderImage);

    useEffect(() => {
        // Update image source if the product prop changes
        setImageSrc(product.imageUrl || placeholderImage);
    }, [product.imageUrl]);

    const handleImageError = () => {
        setImageSrc(placeholderImage);
    };


    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border border-gray-200/80">
            <img 
                className="w-full h-56 object-cover" 
                src={imageSrc} 
                alt={`${product.name} ${product.flavor}`}
                onError={handleImageError}
            />
            <div className="p-5">
                <h3 className="text-xl font-bold font-display text-brand-dark">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{product.flavor}</p>
                <p className="text-2xl font-bold text-brand-primary mb-3">
                    Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className={`text-sm font-medium ${stockColor} mb-4`}>
                    Stok: {product.stock}
                </p>
                <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    disabled={product.stock === 0}
                >
                    {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                </button>
            </div>
        </div>
    );
};

const ShopPage: React.FC<{ addToCart: (product: Product) => void; }> = ({ addToCart }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Handles scrolling to product list when navigated with state
        if (location.state?.scrollToProducts) {
            const productsSection = document.getElementById('produk');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Clean up state to prevent scrolling on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productList = await getProducts();
                setProducts(productList);
            } catch (error) {
                toast.error('Gagal memuat produk.');
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        toast.success(`${product.name} (${product.flavor}) ditambahkan!`);
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Memuat produk...</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <HeroSection />
            <h2 id="produk" className="text-3xl font-bold font-display text-brand-dark mb-8 text-center">Produk Kami</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} addToCart={handleAddToCart} />
                ))}
            </div>
        </div>
    );
};

export default ShopPage;