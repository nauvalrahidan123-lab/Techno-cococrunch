// FIX: Removed failing vite/client reference. The type error indicates a global configuration issue, and this reference is ineffective here.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use modern v9+ Firebase Authentication syntax.
      // The 'auth' object is guaranteed to be initialized if the app has loaded.
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login berhasil!');
      navigate('/admin/dashboard');
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            toast.error('Email atau password salah.');
        } else {
            toast.error('Terjadi kesalahan saat login.');
            console.error("Firebase login error:", error);
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Admin Login</h1>
        <p className="text-center text-sm text-gray-500">
          Gunakan akun yang telah dibuat di Firebase Authentication.
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email-input" className="text-sm font-bold text-gray-600 block">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password-input" className="text-sm font-bold text-gray-600 block">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;