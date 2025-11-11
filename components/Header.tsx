// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from './icons';

interface HeaderProps {
    cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="text-3xl font-display font-bold text-brand-dark">
                            TokoJajan
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/admin" className="text-gray-600 hover:text-brand-primary font-medium transition-colors duration-200">
                            Admin
                        </Link>
                        <Link to="/cart" className="relative text-gray-600 hover:text-brand-primary transition-colors duration-200">
                            <ShoppingCartIcon />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-brand-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;