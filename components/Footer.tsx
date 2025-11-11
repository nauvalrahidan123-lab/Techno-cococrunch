import React from 'react';
import toast from 'react-hot-toast';

const Footer = () => {
    const handleComingSoon = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method.
        // Using the default `toast()` function for informational messages.
        toast('Fitur ini belum tersedia.');
    };

    return (
        <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="font-display text-2xl font-bold">TokoJajan</p>
                    <p className="mt-2 text-sm text-gray-400">
                        Menyajikan cemilan Cococrunch & Basreng terbaik untuk Anda.
                    </p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <a href="#" onClick={handleComingSoon} className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                        <a href="#" onClick={handleComingSoon} className="text-gray-400 hover:text-white transition-colors">TikTok</a>
                        {/* Ganti 6281234567890 dengan nomor WhatsApp Anda (format internasional tanpa + atau 0 di depan) */}
                        <a 
                            href="https://wa.me/6285849492809" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} TokoJajan. Semua Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;