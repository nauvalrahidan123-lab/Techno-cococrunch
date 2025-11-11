import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="font-display text-2xl font-bold">TokoJajan</p>
                    <p className="mt-2 text-sm text-gray-400">
                        Menyajikan cemilan Cococrunch & Basreng terbaik untuk Anda.
                    </p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">TikTok</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a>
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
