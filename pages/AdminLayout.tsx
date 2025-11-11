// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

interface AdminLayoutProps {
    isAuth: boolean;
    setAuth: (isAuth: boolean) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ isAuth, setAuth }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuth) {
            navigate('/admin');
        }
    }, [isAuth, navigate]);

    if (!isAuth) {
        return null; // or a loading spinner
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar setAuth={setAuth} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;