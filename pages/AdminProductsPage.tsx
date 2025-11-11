import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/firestoreService';
import toast from 'react-hot-toast';
import { PlusIcon } from '../components/icons';

const ProductFormModal = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState(product || { name: '', flavor: '', price: 0, stock: 0, minStock: 10, imageUrl: '' });

    useEffect(() => {
        setFormData(product || { name: '', flavor: '', price: 0, stock: 0, minStock: 10, imageUrl: 'https://picsum.photos/400/300' });
    }, [product]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold font-display mb-6 text-brand-dark">{product ? 'Ubah Produk' : 'Tambah Produk Baru'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Produk (e.g., Cococrunch)" className="w-full p-2 border-gray-300 rounded-lg shadow-sm" required />
                    <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="Varian Rasa" className="w-full p-2 border-gray-300 rounded-lg shadow-sm" required />
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Harga" className="w-full p-2 border-gray-300 rounded-lg shadow-sm" required />
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stok Awal" className="w-full p-2 border-gray-300 rounded-lg shadow-sm" required />
                    <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} placeholder="Batas Minimum Stok" className="w-full p-2 border-gray-300 rounded-lg shadow-sm" required />
                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL Gambar" className="w-full p-2 border-gray-300 rounded-lg shadow-sm" required />
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-indigo-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const productList = await getProducts();
            setProducts(productList);
        } catch (error) {
            toast.error('Gagal memuat data produk.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSave = async (productData) => {
        const promise = productData.id 
            ? updateProduct(productData)
            : addProduct(productData);

        toast.promise(promise, {
            loading: 'Menyimpan...',
            success: 'Produk berhasil disimpan!',
            error: 'Gagal menyimpan produk.',
        });

        await promise;
        fetchProducts();
        setIsModalOpen(false);
        setEditingProduct(null);
    };
    
    const handleDelete = async (productId: string) => {
        if (window.confirm('Anda yakin ingin menghapus produk ini?')) {
            const promise = deleteProduct(productId);
            toast.promise(promise, {
                loading: 'Menghapus...',
                success: 'Produk berhasil dihapus!',
                error: 'Gagal menghapus produk.',
            });
            await promise;
            fetchProducts();
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };
    
    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold font-display text-brand-dark">Produk & Stok</h1>
                <button onClick={openAddModal} className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg">
                    <PlusIcon />
                    Tambah Produk
                </button>
            </div>
            
            <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Produk</th>
                            <th scope="col" className="px-6 py-3">Harga</th>
                            <th scope="col" className="px-6 py-3">Stok</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10">Memuat...</td></tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {product.name} <span className="text-gray-500 font-normal">({product.flavor})</span>
                                    </th>
                                    <td className="px-6 py-4">Rp {product.price.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 font-semibold">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        {product.stock > product.minStock ? 
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Aman</span> : 
                                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Perlu Restock</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 space-x-4 text-right">
                                        <button onClick={() => openEditModal(product)} className="font-medium text-brand-primary hover:underline">Ubah</button>
                                        <button onClick={() => handleDelete(product.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={editingProduct}
            />
        </div>
    );
};

export default AdminProductsPage;