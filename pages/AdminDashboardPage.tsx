
import React, { useEffect, useState } from 'react';
import { getOrders, getProducts } from '../services/firestoreService';
import { Order, Product } from '../types';
import { DollarSign, Package, AlertTriangle, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StatCard: React.FC<{ title: string; value: string; description: string; icon: React.ReactNode; color: string }> = ({ title, value, description, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 flex items-start space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
        </div>
    </div>
);

const SalesChart = ({ orders }) => {
    const salesData = orders.reduce((acc, order) => {
        const date = new Date(order.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + order.total;
        return acc;
    }, {});

    const sortedDates = Object.keys(salesData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const chartData = {
        labels: sortedDates.map(date => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
        datasets: [
            {
                label: 'Pendapatan Harian',
                data: sortedDates.map(date => salesData[date]),
                borderColor: '#4F46E5', // brand-primary
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.3,
            },
        ],
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Grafik Pendapatan Penjualan',
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 mt-8">
            <Line options={options} data={chartData} />
        </div>
    );
}

const AdminDashboardPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderData, productData] = await Promise.all([getOrders(), getProducts()]);
                setOrders(orderData);
                setProducts(productData);
            } catch (error: any) {
                if (error.message && error.message.toLowerCase().includes('permission')) {
                    toast.error('Gagal memuat data dashboard: Periksa aturan keamanan Firestore Anda.', { duration: 6000 });
                } else {
                    toast.error('Gagal memuat data dashboard.');
                }
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
    const totalProducts = products.length;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenueThisMonth = orders
        .filter(order => new Date(order.date) >= startOfMonth)
        .reduce((sum, order) => sum + order.total, 0);

    return (
        <div>
            <h1 className="text-4xl font-bold font-display text-brand-dark mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Pendapatan"
                    value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
                    description="Dari semua penjualan"
                    icon={<DollarSign className="text-green-800" />}
                    color="bg-green-100"
                />
                <StatCard 
                    title="Pendapatan Bulan Ini"
                    value={`Rp ${revenueThisMonth.toLocaleString('id-ID')}`}
                    description={`Sejak ${startOfMonth.toLocaleDateString('id-ID')}`}
                    icon={<Package className="text-blue-800" />}
                    color="bg-blue-100"
                />
                <StatCard 
                    title="Produk Stok Menipis"
                    value={lowStockProducts.toString()}
                    description="Perlu segera restock"
                    icon={<AlertTriangle className="text-red-800" />}
                    color="bg-red-100"
                />
                <StatCard 
                    title="Total Jenis Produk"
                    value={totalProducts.toString()}
                    description="Varian produk yang dijual"
                    icon={<Archive className="text-yellow-800" />}
                    color="bg-yellow-100"
                />
            </div>
            <SalesChart orders={orders} />
        </div>
    );
};

export default AdminDashboardPage;
