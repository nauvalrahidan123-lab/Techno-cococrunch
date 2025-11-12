
// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DashboardIcon, ProductsIcon, SalesIcon, EmployeesIcon, LogoutIcon, InfoIcon } from './icons';
import toast from 'react-hot-toast';

interface AdminSidebarProps {
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        // Navigate to the login page after state has been updated
        navigate('/admin');
    };

    const linkClasses = "flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 transform rounded-lg hover:bg-gray-200 hover:text-gray-700";
    const activeLinkClasses = "bg-brand-primary text-white hover:bg-brand-primary hover:text-white";

    return (
        <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r sticky top-0">
            <h2 className="text-3xl font-display font-bold text-center text-brand-dark">Admin</h2>
            <div className="flex flex-col justify-between flex-1 mt-6">
                <nav className="space-y-2">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}>
                        <DashboardIcon /><span className="mx-4 font-medium">Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}>
                        <ProductsIcon /><span className="mx-4 font-medium">Produk & Stok</span>
                    </NavLink>
                    <NavLink to="/admin/sales" className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}>
                        <SalesIcon /><span className="mx-4 font-medium">Penjualan</span>
                    </NavLink>
                    <NavLink to="/admin/employees" className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}>
                        <EmployeesIcon /><span className="mx-4 font-medium">Karyawan</span>
                    </NavLink>
                     <NavLink to="/admin/business-info" className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}>
                        <InfoIcon /><span className="mx-4 font-medium">Info Bisnis</span>
                    </NavLink>
                </nav>
                <div>
                    <button onClick={handleLogout} className={linkClasses}>
                        <LogoutIcon /><span className="mx-4 font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
