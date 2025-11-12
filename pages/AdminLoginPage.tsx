
import React, { useState } from 'react';

interface AdminLoginPageProps {
    onLogin: (password: string) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate a brief delay for better user experience
    setTimeout(() => {
        onLogin(password);
        setLoading(false);
    }, 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Akses Panel Admin</h1>
        <p className="text-center text-sm text-gray-500">
          Masukkan sandi yang telah diatur untuk melanjutkan.
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password-input" className="text-sm font-bold text-gray-600 block">
              Sandi Admin
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
