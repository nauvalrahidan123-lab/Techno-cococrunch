
import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, getProducts } from '../services/firestoreService';
import { Order, Product } from '../types';
import toast from 'react-hot-toast';

const AdminSalesPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ startDate: '', endDate: '', productId: '' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [orderData, productData] = await Promise.all([getOrders(), getProducts()]);
                setOrders(orderData);
                setProducts(productData);
            } catch (error) {
                toast.error("Gagal memuat data penjualan.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = order.date;
            const startDate = filter.startDate ? new Date(filter.startDate) : null;
            const endDate = filter.endDate ? new Date(filter.endDate) : null;

            if (startDate && orderDate < startDate) return false;
            if (endDate && orderDate > endDate) return false;
            if (filter.productId && !order.items.some(item => item.product.id === filter.productId)) return false;
            
            return true;
        });
    }, [orders, filter]);

    const totalGrossRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const profitMargin = 0.3; // Asumsi margin keuntungan 30%
    const totalNetProfit = totalGrossRevenue * profitMargin;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan Penjualan</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
                <h3 className="text-lg font-semibold mr-4">Filter Data:</h3>
                <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} className="p-2 border rounded" />
                <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} className="p-2 border rounded" />
                <select name="productId" value={filter.productId} onChange={handleFilterChange} className="p-2 border rounded">
                    <option value="">Semua Produk</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.flavor}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-gray-500">Pendapatan Kotor</h4>
                    <p className="text-3xl font-bold">Rp {totalGrossRevenue.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-gray-500">Pendapatan Bersih (Estimasi)</h4>
                    <p className="text-3xl font-bold text-green-600">Rp {totalNetProfit.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Pelanggan</th>
                            <th scope="col" className="px-6 py-3">Item</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Memuat...</td></tr>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{order.date.toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}</td>
                                    <td className="px-6 py-4 font-semibold">Rp {order.total.toLocaleString('id-ID')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="text-center py-4">Tidak ada data penjualan yang cocok.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSalesPage;
