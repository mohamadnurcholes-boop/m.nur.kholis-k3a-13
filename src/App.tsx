/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentProofModal } from './components/PaymentProofModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

import { Product, Order, Customer, AdminUser } from './types';
import { seedProductsIfEmpty, subscribeToProducts } from './services/productService';
import { subscribeToOrders } from './services/orderService';
import { subscribeToCustomers } from './services/customerService';
import { testConnection } from './firebase';

import {
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  ShoppingBag,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  return (
    <CartProvider>
      <MainStoreApp />
    </CartProvider>
  );
}

function MainStoreApp() {
  // Real Firestore Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Storefront Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Modals & UI View States
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofTargetOrderId, setProofTargetOrderId] = useState('');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Admin Session State
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('khzzz_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Initial database boot & listeners
  useEffect(() => {
    let unsubscribeProducts: (() => void) | null = null;
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeCustomers: (() => void) | null = null;

    async function initFirestoreData() {
      try {
        await testConnection();
        // Seed initial 12 products if database is empty
        const initialProducts = await seedProductsIfEmpty();
        setProducts(initialProducts);
        setIsDbReady(true);

        // Realtime listener for products
        unsubscribeProducts = subscribeToProducts((liveProducts) => {
          setProducts(liveProducts);
        });

        // Realtime listener for orders
        unsubscribeOrders = subscribeToOrders((liveOrders) => {
          setOrders(liveOrders);
        });

        // Realtime listener for customers
        unsubscribeCustomers = subscribeToCustomers((liveCustomers) => {
          setCustomers(liveCustomers);
        });
      } catch (err: unknown) {
        console.error('Failed to initialize Firestore connection:', err);
        setDbError('Menghubungkan ke database...');
      }
    }

    initFirestoreData();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeCustomers) unsubscribeCustomers();
    };
  }, []);

  // Save admin session
  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('khzzz_admin_session', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('khzzz_admin_session');
    }
  }, [adminUser]);

  // Handle Admin Toggle
  const handleOpenAdmin = () => {
    if (adminUser?.isLoggedIn) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setAdminUser(admin);
    setIsAdminView(true);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setIsAdminView(false);
  };

  const handleOpenUploadProofForOrder = (orderId: string) => {
    setProofTargetOrderId(orderId);
    setIsProofModalOpen(true);
  };

  // Filtered & Sorted Product List
  const filteredProducts = products.filter((prod) => {
    const matchCategory =
      selectedCategory === 'Semua' || prod.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      prod.name.toLowerCase().includes(query) ||
      prod.brand.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query) ||
      prod.description.toLowerCase().includes(query);

    const matchStock = !onlyInStock || prod.stock > 0;

    return matchCategory && matchSearch && matchStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    // Default featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Calculate counts per category
  const countChronograph = products.filter((p) => p.category === 'Chronograph & Luxury').length;
  const countSport = products.filter((p) => p.category === 'Sport & Diver').length;
  const countClassic = products.filter((p) => p.category === 'Classic & Minimalist').length;

  // IF ADMIN VIEW IS ACTIVE
  if (isAdminView && adminUser?.isLoggedIn) {
    return (
      <AdminDashboard
        admin={adminUser}
        products={products}
        orders={orders}
        customers={customers}
        onBackToStore={() => setIsAdminView(false)}
        onLogout={handleAdminLogout}
      />
    );
  }

  // STOREFRONT VIEW
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0e12] text-gray-100 selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenOrderTracking={() => setIsTrackingModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={Boolean(adminUser?.isLoggedIn)}
        adminName={adminUser?.name}
      />

      {/* Hero Showcase Banner */}
      <HeroBanner
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('koleksi-jam');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Section */}
      <main id="koleksi-jam" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Heading & Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono-code uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katalog Realtime Firestore (12 Jam Tangan Terkurasi)</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-white">
              {selectedCategory === 'Semua' ? 'Koleksi Lengkap Jam Tangan' : selectedCategory}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Menampilkan {sortedProducts.length} jam tangan bergaransi resmi dengan spesifikasi teknis tinggi.
            </p>
          </div>

          {/* Controls: Sorting & In-Stock filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In-Stock Filter Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141720] border border-gray-800 text-xs text-gray-300 cursor-pointer hover:border-gray-700 select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-gray-700 text-amber-500 focus:ring-amber-500/20"
              />
              <span>Hanya yang Tersedia</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141720] border border-gray-800 text-xs text-gray-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="featured" className="bg-[#141720] text-gray-200">Rekomendasi Unggulan</option>
                <option value="price_asc" className="bg-[#141720] text-gray-200">Harga: Terendah ke Tertinggi</option>
                <option value="price_desc" className="bg-[#141720] text-gray-200">Harga: Tertinggi ke Terendah</option>
                <option value="rating" className="bg-[#141720] text-gray-200">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Count Chips */}
        <div className="flex flex-wrap gap-2.5 pt-6 pb-8">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedCategory === 'Semua'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#141720] text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>Semua Produk</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'Semua' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'}`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Chronograph & Luxury')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedCategory === 'Chronograph & Luxury'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#141720] text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>Chronograph & Luxury</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'Chronograph & Luxury' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'}`}>
              {countChronograph}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Sport & Diver')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedCategory === 'Sport & Diver'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#141720] text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>Sport & Diver</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'Sport & Diver' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'}`}>
              {countSport}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Classic & Minimalist')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedCategory === 'Classic & Minimalist'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#141720] text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>Classic & Minimalist</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'Classic & Minimalist' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'}`}>
              {countClassic}
            </span>
          </button>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#11141c] border border-gray-800/80 p-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-400/50 mx-auto" />
            <h3 className="font-serif-display text-lg font-bold text-white">
              Tidak Ada Jam Tangan Yang Sesuai
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Cobalah ubah kata kunci pencarian atau bersihkan filter untuk melihat koleksi lainnya.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setOnlyInStock(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={(prod) => setViewingProduct(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onDirectCheckout={() => {
          setIsCheckoutOpen(true);
        }}
      />

      <CartDrawer
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          console.log('Order created successfully:', order);
        }}
        onOpenUploadProof={(orderId) => {
          handleOpenUploadProofForOrder(orderId);
        }}
      />

      <PaymentProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        initialOrderId={proofTargetOrderId}
      />

      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        onOpenUploadProof={(orderId) => {
          handleOpenUploadProofForOrder(orderId);
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Footer */}
      <Footer
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('koleksi-jam');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenOrderTracking={() => setIsTrackingModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
}
