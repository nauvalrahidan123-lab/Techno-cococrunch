
import React, { useState, useEffect, useCallback } from 'react';
import { BusinessInfo } from '../types';
import { getBusinessInfo, updateBusinessInfo } from '../services/firestoreService';
import toast from 'react-hot-toast';

const AdminBusinessInfoPage = () => {
    const [info, setInfo] = useState<BusinessInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchInfo = useCallback(async () => {
        setLoading(true);
        try {
            const businessInfo = await getBusinessInfo();
            setInfo(businessInfo);
        } catch (error) {
            toast.error('Gagal memuat informasi bisnis.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (info) {
            setInfo({ ...info, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!info) return;

        setIsSaving(true);
        try {
            await updateBusinessInfo(info);
            toast.success('Informasi bisnis berhasil diperbarui!');
        } catch (error) {
            toast.error('Gagal menyimpan perubahan.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div>Memuat informasi bisnis...</div>;
    }

    if (!info) {
        return <div>Gagal memuat data. Coba muat ulang halaman.</div>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold font-display text-brand-dark mb-8">Informasi Bisnis</h1>
            <div className="bg-white shadow-xl rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                        <input type="text" id="name" name="name" value={info.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">Tagline/Slogan</label>
                        <input type="text" id="tagline" name="tagline" value={info.tagline} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                        <input type="text" id="whatsappNumber" name="whatsappNumber" value={info.whatsappNumber} onChange={handleChange} placeholder="Gunakan format 628..." className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" required />
                         <p className="text-xs text-gray-500 mt-1">Nomor ini akan digunakan untuk tombol WhatsApp di footer.</p>
                    </div>
                    <div>
                        <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">URL Instagram</label>
                        <input type="url" id="instagramUrl" name="instagramUrl" value={info.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="tiktokUrl" className="block text-sm font-medium text-gray-700 mb-1">URL TikTok</label>
                        <input type="url" id="tiktokUrl" name="tiktokUrl" value={info.tiktokUrl} onChange={handleChange} placeholder="https://tiktok.com/@..." className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSaving} className="bg-brand-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg disabled:bg-gray-400">
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBusinessInfoPage;
