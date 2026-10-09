import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Compass, Watch, Clock, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WatchCategory } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenOrderTracking: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  adminName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenOrderTracking,
  onOpenAdmin,
  isAdminLoggedIn,
  adminName,
}) => {
  const { totalItems, setIsCartOpen } = useCart();

  const categories: { id: string; label: string }[] = [
    { id: 'Semua', label: 'Semua Koleksi' },
    { id: 'Chronograph & Luxury', label: 'Chronograph & Luxury' },
    { id: 'Sport & Diver', label: 'Sport & Diver' },
    { id: 'Classic & Minimalist', label: 'Classic & Minimalist' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e12]/95 backdrop-blur-md border-b border-amber-900/20 text-gray-100">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#181a20] via-[#241c14] to-[#181a20] border-b border-amber-500/15 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-amber-200/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              100% ORIGINAL BERGARANSI RESMI 2 TAHUN
            </span>
            <span className="hidden md:inline text-amber-600">•</span>
            <span className="hidden md:inline text-gray-400">
              PENGIRIMAN AMAN BERASURANSI KE SELURUH INDONESIA
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-300">
            <button
              onClick={onOpenOrderTracking}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Lacak Status Pesanan
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
            >
              {isAdminLoggedIn ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Admin Mode ({adminName || 'Admin'})</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Branding */}
          <div
            onClick={() => {
              setSelectedCategory('Semua');
              setSearchQuery('');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/25 transition-all">
              <div className="w-full h-full bg-[#0c0e12] rounded-[7px] flex items-center justify-center">
                <Watch className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
                  KHZZZ
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-medium">
                  STORE
                </span>
              </div>
              <p className="text-[10px] tracking-widest uppercase text-amber-400/80 -mt-0.5">
                Haute Horlogerie Boutique
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jam tangan (Cosmograph, Diver, Moonphase...)"
                className="w-full pl-10 pr-4 py-2 bg-[#14171f] border border-gray-800 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Right (Cart + Order Tracking Mobile) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenOrderTracking}
              className="md:hidden p-2 rounded-lg bg-[#14171f] border border-gray-800 text-gray-300 hover:text-amber-400"
              title="Lacak Pesanan"
            >
              <Clock className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-200 transition-all cursor-pointer shadow-md shadow-amber-950/40"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0c0e12] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wider hidden sm:inline uppercase text-amber-300">
                Keranjang
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jam tangan..."
              className="w-full pl-10 pr-4 py-2 bg-[#14171f] border border-gray-800 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 mt-1 no-scrollbar border-t border-gray-800/40">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-2 shrink-0">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-wider font-medium text-[11px]">Kategori:</span>
          </div>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                    : 'bg-[#14171f] text-gray-300 border border-gray-800/80 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
