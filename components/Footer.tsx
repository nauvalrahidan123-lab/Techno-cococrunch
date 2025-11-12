
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getBusinessInfo } from '../services/firestoreService';
import { BusinessInfo } from '../types';

const Footer = () => {
    const [info, setInfo] = useState<BusinessInfo | null>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const businessInfo = await getBusinessInfo();
                setInfo(businessInfo);
            } catch (error) {
                console.error("Failed to fetch business info for footer:", error);
            }
        };
        fetchInfo();
    }, []);

    const handleComingSoon = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        if (!url || url === '#') {
            toast('Fitur ini belum tersedia.');
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };
    
    const getWhatsAppUrl = (number: string) => {
        if (!number) return '#';
        // Ensure number is clean and starts with country code (e.g., 62)
        const cleanedNumber = number.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanedNumber}`;
    }

    if (!info) {
        return (
            <footer className="bg-brand-dark text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-sm text-gray-500">Memuat footer...</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="font-display text-2xl font-bold">{info.name}</p>
                    <p className="mt-2 text-sm text-gray-400">
                        {info.tagline}
                    </p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <a href={info.instagramUrl} onClick={(e) => handleComingSoon(e, info.instagramUrl)} className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                        <a href={info.tiktokUrl} onClick={(e) => handleComingSoon(e, info.tiktokUrl)} className="text-gray-400 hover:text-white transition-colors">TikTok</a>
                        <a 
                            href={getWhatsAppUrl(info.whatsappNumber)}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} {info.name}. Semua Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
