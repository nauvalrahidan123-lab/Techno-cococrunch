// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React, { useState, useMemo } from 'react';
import { CartItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { addOrder } from '../services/firestoreService';
import toast from 'react-hot-toast';

const CheckoutConfirmationModal = ({ isOpen, onClose, onConfirm, orderDetails, isProcessing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold font-display text-brand-dark mb-4">Konfirmasi Pesanan Anda</h2>
                <div className="space-y-4 text-gray-600">
                    <div>
                        <h3 className="font-semibold text-gray-800">Item Pesanan:</h3>
                        <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                            {orderDetails.items.map(item => (
                                <li key={item.product.id}>{item.product.name} ({item.product.flavor}) x {item.quantity}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Alamat Pengiriman:</h3>
                        <p>{orderDetails.customerName}</p>
                        <p>{orderDetails.customerAddress}</p>
                    </div>
                     <div className="border-t pt-4 mt-4 space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span> <span>Rp {orderDetails.subtotal.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span>Pengiriman</span> <span>Rp {orderDetails.shipping.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span>Pajak (11%)</span> <span>Rp {orderDetails.tax.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between font-bold text-lg text-brand-dark"><span>Grand Total</span> <span>Rp {orderDetails.grandTotal.toLocaleString('id-ID')}</span></div>
                    </div>
                </div>
                <div className="flex justify-end mt-8 space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Batal</button>
                    <button type="button" onClick={onConfirm} disabled={isProcessing} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
                        {isProcessing ? 'Memproses...' : 'Konfirmasi & Bayar'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const CartPage: React.FC<{ cartItems: CartItem[]; updateQuantity: (productId: string, quantity: number) => void; removeFromCart: (productId: string) => void; clearCart: () => void; }> = ({ cartItems, updateQuantity, removeFromCart, clearCart }) => {
    const navigate = useNavigate();
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { subtotal, shipping, tax, grandTotal } = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        const shipping = subtotal > 0 ? 10000 : 0; // Flat rate shipping
        const tax = subtotal * 0.11;
        const grandTotal = subtotal + shipping + tax;
        return { subtotal, shipping, tax, grandTotal };
    }, [cartItems]);
    
    const handleProceedToCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerAddress) {
            toast.error("Nama dan alamat harus diisi.");
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmCheckout = async () => {
        setIsProcessing(true);
        try {
            const newOrder = await addOrder({
                items: cartItems,
                total: grandTotal,
                customerName,
                customerAddress,
            });
            toast.success(`Pesanan #${newOrder.id} berhasil dibuat!`);
            clearCart();
            navigate('/');
        } catch (error) {
            toast.error('Gagal membuat pesanan.');
            console.error("Checkout error: ", error);
        } finally {
            setIsProcessing(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold font-display text-brand-dark mb-6">Keranjang Belanja</h1>
            {cartItems.length === 0 ? (
                <div className="text-center py-10 bg-white shadow-lg rounded-xl">
                    <p className="text-gray-500 text-lg">Keranjang Anda kosong.</p>
                    <Link to="/" className="mt-4 inline-block bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row lg:space-x-8">
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white shadow-lg rounded-xl divide-y divide-gray-200">
                            {cartItems.map(item => (
                                <div key={item.product.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="h-24 w-24 object-cover rounded-lg mr-4" />
                                        <div>
                                            <p className="font-semibold text-lg text-brand-dark">{item.product.name} ({item.product.flavor})</p>
                                            <p className="text-gray-600">Rp {item.product.price.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                                            min="1"
                                            max={item.product.stock}
                                            className="w-20 text-center border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
                        <form onSubmit={handleProceedToCheckout} className="bg-white shadow-lg rounded-xl p-6 sticky top-28">
                            <h2 className="text-2xl font-bold font-display mb-6 text-brand-dark">Ringkasan & Pengiriman</h2>
                            <div className="mb-4">
                                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
                                <textarea id="customerAddress" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" rows={3} required></textarea>
                            </div>
                             <div className="space-y-2 border-t pt-4">
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Biaya Pengiriman</span><span>Rp {shipping.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Pajak (11%)</span><span>Rp {tax.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between font-bold text-lg text-brand-dark mt-2"><span>Grand Total</span><span>Rp {grandTotal.toLocaleString('id-ID')}</span></div>
                            </div>
                            <button type="submit" className="w-full mt-6 bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-500 transition-colors">
                                Lanjut ke Konfirmasi
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <CheckoutConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmCheckout}
                isProcessing={isProcessing}
                orderDetails={{ items: cartItems, customerName, customerAddress, subtotal, shipping, tax, grandTotal }}
            />
        </div>
    );
};

export default CartPage;