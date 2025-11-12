// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

interface AdminLayoutProps {
    isAuth: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ isAuth }) => {
    // The redirection logic is now handled in App.tsx to centralize auth checks.
    // This component now simply renders the layout if isAuth is true.
    if (!isAuth) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;