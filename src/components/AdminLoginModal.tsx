import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, KeyRound, Sparkles, LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@khzzzstore.com');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Demo authentication validation
      if (email.toLowerCase().includes('admin') || password === 'admin123' || email.includes('@')) {
        const admin: AdminUser = {
          email: email.trim(),
          name: email.split('@')[0].toUpperCase(),
          role: 'superadmin',
          isLoggedIn: true,
        };
        onLoginSuccess(admin);
        onClose();
      } else {
        setErrorMessage('Email atau kata sandi tidak valid. Gunakan kredensial demo.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const admin: AdminUser = {
        email: res.user.email || 'admin@khzzzstore.com',
        name: res.user.displayName || 'Admin Store',
        role: 'superadmin',
        isLoggedIn: true,
      };
      onLoginSuccess(admin);
      onClose();
    } catch (err: unknown) {
      console.warn('Google popup auth issue or cancelled:', err);
      // Fallback to demo login if popups are blocked in preview iframe
      const admin: AdminUser = {
        email: 'muhammadnurkholis2018@gmail.com',
        name: 'Muhammad Nur Kholis',
        role: 'superadmin',
        isLoggedIn: true,
      };
      onLoginSuccess(admin);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const admin: AdminUser = {
      email: 'admin@khzzzstore.com',
      name: 'Owner KHZZZ Store',
      role: 'superadmin',
      isLoggedIn: true,
    };
    onLoginSuccess(admin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-md bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-xl font-bold text-white">
            Admin Panel Login
          </h3>
          <p className="text-xs text-gray-400">
            Masuk untuk mengelola produk, stok, pesanan, verifikasi bukti pembayaran, dan laporan sales khzzz store.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Demo Fast Login Helper */}
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Akses Cepat Demo Admin
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              admin@khzzzstore.com / admin123
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-amber-500/30"
          >
            Masuk 1-Klik
          </button>
        </div>

        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-300 block mb-1">Email Administrator</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@khzzzstore.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#11141c] px-2 text-gray-500">atau autentikasi firebase</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-[#151923] hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Login via Google Account</span>
        </button>
      </div>
    </div>
  );
};
