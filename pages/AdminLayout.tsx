
// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React, from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

interface AdminLayoutProps {
    isAuth: boolean;
    onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ isAuth, onLogout }) => {
    // This check is now redundant because App.tsx handles redirection,
    // but it serves as a robust fallback.
    if (!isAuth) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar onLogout={onLogout} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
