import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  CheckCircle,
  BarChart3,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  Check,
  X,
  RotateCcw,
  Store,
  LogOut,
  TrendingUp,
  DollarSign,
  Clock,
  Truck,
  AlertTriangle,
  UploadCloud,
  Layers,
  Phone,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Product, Order, Customer, AdminUser, WatchCategory, OrderStatus } from '../types';
import { formatRupiah, formatDate, getOrderStatusConfig } from '../utils/formatters';
import {
  saveProduct,
  updateProductStock,
  deleteProduct,
  resetProductsToDefault
} from '../services/productService';
import {
  updateOrderStatus,
  approvePayment,
  rejectPayment,
  deleteOrder
} from '../services/orderService';

interface AdminDashboardProps {
  admin: AdminUser;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onBackToStore: () => void;
  onLogout: () => void;
}

type AdminTab = 'sales' | 'products' | 'orders' | 'approval' | 'customers';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  products,
  orders,
  customers,
  onBackToStore,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('Semua');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Semua');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals inside Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);
  const [shippingResiModal, setShippingResiModal] = useState<{ orderId: string; resi: string } | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ orderId: string; reason: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form State for Adding / Editing Product
  const [formProdName, setFormProdName] = useState('');
  const [formProdBrand, setFormProdBrand] = useState('KHZZZ Horology');
  const [formProdCategory, setFormProdCategory] = useState<WatchCategory>('Chronograph & Luxury');
  const [formProdPrice, setFormProdPrice] = useState<number>(5000000);
  const [formProdOrigPrice, setFormProdOrigPrice] = useState<number>(6000000);
  const [formProdStock, setFormProdStock] = useState<number>(10);
  const [formProdBadge, setFormProdBadge] = useState<Product['badge']>('New');
  const [formProdImage, setFormProdImage] = useState('');
  const [formProdDesc, setFormProdDesc] = useState('');
  const [formMovement, setFormMovement] = useState('Automatic Calibre 28,800 vph');
  const [formDiameter, setFormDiameter] = useState('40 mm');
  const [formWR, setFormWR] = useState('100 Meter / 10 ATM');
  const [formStrap, setFormStrap] = useState('Solid 316L Stainless Steel');
  const [formGlass, setFormGlass] = useState('Scratch-resistant Sapphire Crystal');

  // Awaiting approval count
  const awaitingApprovalOrders = orders.filter((o) => o.status === 'awaiting_approval');

  // Sales Analytics calculations
  const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = validOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Category sales breakdown
  const categoryRevenue: Record<string, number> = {
    'Chronograph & Luxury': 0,
    'Sport & Diver': 0,
    'Classic & Minimalist': 0,
  };
  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (item.category && categoryRevenue[item.category] !== undefined) {
        categoryRevenue[item.category] += item.price * item.quantity;
      }
    });
  });

  // Top selling products
  const productSalesMap: Record<string, { product: Product; quantitySold: number; totalRev: number }> = {};
  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      const existingP = products.find((p) => p.id === item.productId);
      if (existingP) {
        if (!productSalesMap[existingP.id]) {
          productSalesMap[existingP.id] = { product: existingP, quantitySold: 0, totalRev: 0 };
        }
        productSalesMap[existingP.id].quantitySold += item.quantity;
        productSalesMap[existingP.id].totalRev += item.price * item.quantity;
      }
    });
  });
  const topSellingList = Object.values(productSalesMap).sort((a, b) => b.quantitySold - a.quantitySold);

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormProdName('');
    setFormProdBrand('KHZZZ Horology');
    setFormProdCategory('Chronograph & Luxury');
    setFormProdPrice(4500000);
    setFormProdOrigPrice(5500000);
    setFormProdStock(8);
    setFormProdBadge('New');
    setFormProdImage('https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80');
    setFormProdDesc('Jam tangan mewah dengan presisi tingkat tinggi dan material premium.');
    setFormMovement('Automatic Movement 28,800 vph');
    setFormDiameter('41 mm');
    setFormWR('100 Meter / 10 ATM');
    setFormStrap('Solid 316L Stainless Steel');
    setFormGlass('Sapphire Crystal AR Coating');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormProdName(prod.name);
    setFormProdBrand(prod.brand);
    setFormProdCategory(prod.category);
    setFormProdPrice(prod.price);
    setFormProdOrigPrice(prod.originalPrice);
    setFormProdStock(prod.stock);
    setFormProdBadge(prod.badge);
    setFormProdImage(prod.imageUrl);
    setFormProdDesc(prod.description);
    setFormMovement(prod.specs.movement);
    setFormDiameter(prod.specs.caseDiameter);
    setFormWR(prod.specs.waterResistance);
    setFormStrap(prod.specs.strapMaterial);
    setFormGlass(prod.specs.glass);
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prodId = editingProduct ? editingProduct.id : `khz-watch-${Date.now().toString(36)}`;
    const productPayload: Product = {
      id: prodId,
      name: formProdName.trim(),
      brand: formProdBrand.trim(),
      category: formProdCategory,
      price: Number(formProdPrice),
      originalPrice: Number(formProdOrigPrice),
      stock: Number(formProdStock),
      badge: formProdBadge,
      imageUrl: formProdImage.trim() || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      description: formProdDesc.trim(),
      rating: editingProduct ? editingProduct.rating : 4.9,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 12,
      featured: editingProduct ? editingProduct.featured : true,
      specs: {
        movement: formMovement,
        caseDiameter: formDiameter,
        waterResistance: formWR,
        strapMaterial: formStrap,
        glass: formGlass,
      },
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    await saveProduct(productPayload);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari database?`)) {
      await deleteProduct(id);
    }
  };

  const handleResetDefaults = async () => {
    await resetProductsToDefault();
    setIsResetConfirmOpen(false);
  };

  // Handlers for Orders & Approvals
  const handleApproveOrder = async (orderId: string) => {
    await approvePayment(orderId, 'Pembayaran valid dan telah disetujui admin.');
  };

  const handleRejectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModal) return;
    await rejectPayment(rejectionModal.orderId, rejectionModal.reason || 'Nominal bukti transfer tidak cocok.');
    setRejectionModal(null);
  };

  const handleUpdateResiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingResiModal) return;
    await updateOrderStatus(shippingResiModal.orderId, 'shipped', shippingResiModal.resi.trim(), 'Pesanan sedang dikirim ke alamat tujuan.');
    setShippingResiModal(null);
  };

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const matchCat = productCategoryFilter === 'Semua' || p.category === productCategoryFilter;
    const matchQ = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'Semua' || o.status === orderStatusFilter;
    const matchQ =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchQ;
  });

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.toLowerCase().includes(customerSearch.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0e1017] border-b border-gray-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-black font-bold text-sm shadow-md shadow-amber-500/20">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-display text-base sm:text-lg font-bold text-white tracking-wide">
                  KHZZZ STORE ADMIN PANEL
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Realtime Firestore
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Logged in as: <strong className="text-amber-400">{admin.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToStore}
              className="px-3.5 py-2 rounded-xl bg-[#161a25] hover:bg-gray-800 text-gray-200 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Kembali ke</span> Toko
            </button>
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/60 transition-colors cursor-pointer"
              title="Keluar Admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-gray-800/80 mt-2.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'sales'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Laporan Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'products'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Data Produk & Stok ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Data Order & Riwayat ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approval')}
            className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'approval'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approval Bukti Pembayaran</span>
            {awaitingApprovalOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {awaitingApprovalOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'customers'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Pelanggan ({customers.length})</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ============================================================== */}
        {/* TAB 1: LAPORAN SALES */}
        {/* ============================================================== */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-white">
                  Laporan & Analisis Penjualan
                </h2>
                <p className="text-xs text-gray-400">
                  Data transaksi terakumulasi langsung dari koleksi orders Firestore real-time.
                </p>
              </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#12151f] border border-gray-800/80 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Total Pendapatan (Omset)</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono-code text-2xl font-bold text-emerald-400">
                  {formatRupiah(totalRevenue)}
                </div>
                <div className="text-[11px] text-gray-500">
                  Dari {validOrders.length} pesanan sah (non-cancel)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151f] border border-gray-800/80 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Total Transaksi Masuk</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono-code text-2xl font-bold text-amber-400">
                  {orders.length}
                </div>
                <div className="text-[11px] text-gray-500">
                  {awaitingApprovalOrders.length} menunggu approval bayar
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151f] border border-gray-800/80 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Jam Tangan Terjual</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono-code text-2xl font-bold text-blue-400">
                  {totalItemsSold} Unit
                </div>
                <div className="text-[11px] text-gray-500">
                  Unit timepieces berpindah ke pembeli
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151f] border border-gray-800/80 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Rata-Rata Order (AOV)</span>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono-code text-2xl font-bold text-purple-400">
                  {formatRupiah(averageOrderValue)}
                </div>
                <div className="text-[11px] text-gray-500">
                  Nilai belanja per transaksi
                </div>
              </div>
            </div>

            {/* Visual Breakdown by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category Share */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12151f] border border-gray-800 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Penjualan per Kategori Jam
                </h3>
                <div className="space-y-4 pt-2">
                  {Object.entries(categoryRevenue).map(([catName, catRev]) => {
                    const percent = totalRevenue > 0 ? Math.round((catRev / totalRevenue) * 100) : 0;
                    return (
                      <div key={catName} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300 font-medium">{catName}</span>
                          <span className="font-mono-code text-amber-400 font-bold">
                            {formatRupiah(catRev)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12151f] border border-gray-800 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Produk Terlaris (Top Selling Watches)
                </h3>

                {topSellingList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">
                    Belum ada data penjualan tercatat. Buat pesanan baru untuk melihat statistik produk terlaris.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topSellingList.slice(0, 5).map(({ product, quantitySold, totalRev }, idx) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#161a25] border border-gray-800 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 font-bold font-mono text-amber-400">#{idx + 1}</span>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-black"
                          />
                          <div>
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-[11px] text-gray-400">{product.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-400 font-mono">
                            {quantitySold} Unit Terjual
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {formatRupiah(totalRev)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DATA PRODUK & STOK */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-white">
                  Katalog Produk & Kelola Stok
                </h2>
                <p className="text-xs text-gray-400">
                  Total {products.length} jam tangan terdaftar di Firestore. Perubahan stok akan langsung terlihat oleh customer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset 12 jam tangan default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset 12 Default</span>
                </button>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tambah Jam Tangan</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari nama jam, brand..."
                  className="w-full pl-9 pr-3 py-2 bg-[#12151f] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                {['Semua', 'Chronograph & Luxury', 'Sport & Diver', 'Classic & Minimalist'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      productCategoryFilter === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-[#12151f] text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-[#12151f] border border-gray-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1017] text-gray-400 uppercase tracking-wider border-b border-gray-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Jam Tangan</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4 text-center">Stok Gudang</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#161a25]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-cover bg-black border border-gray-800 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-white">{prod.name}</div>
                              <div className="text-[11px] text-gray-400">{prod.brand}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono-code text-gray-300">
                          {prod.category}
                        </td>

                        <td className="py-3 px-4 font-mono-code font-bold text-amber-400">
                          {formatRupiah(prod.price)}
                        </td>

                        {/* Inline Stock Modifier */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => updateProductStock(prod.id, prod.stock - 1)}
                              className="w-6 h-6 rounded bg-[#1b202e] hover:bg-gray-700 text-gray-300 font-bold flex items-center justify-center cursor-pointer"
                              title="Kurangi 1 unit"
                            >
                              -
                            </button>
                            <span
                              className={`w-10 text-center font-mono-code font-bold ${
                                prod.stock <= 0
                                  ? 'text-rose-400'
                                  : prod.stock <= 5
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => updateProductStock(prod.id, prod.stock + 1)}
                              className="w-6 h-6 rounded bg-[#1b202e] hover:bg-gray-700 text-gray-300 font-bold flex items-center justify-center cursor-pointer"
                              title="Tambah 1 unit"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {prod.badge ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {prod.badge}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-black text-gray-300 transition-colors cursor-pointer"
                              title="Edit Jam Tangan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-600 hover:text-white text-gray-300 transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DATA ORDER & RIWAYAT */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-white">
                  Data Order & Riwayat Transaksi
                </h2>
                <p className="text-xs text-gray-400">
                  Total {orders.length} pesanan tercatat. Admin dapat mengubah status, memasukkan nomor resi, dan mengelola order.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari nomor pesanan, nama pemesan, email..."
                  className="w-full pl-9 pr-3 py-2 bg-[#12151f] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  'Semua',
                  'pending_payment',
                  'awaiting_approval',
                  'processing',
                  'shipped',
                  'delivered',
                  'rejected',
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-[#12151f] text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    {st === 'Semua' ? 'Semua Status' : getOrderStatusConfig(st as OrderStatus).label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-[#12151f] border border-gray-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1017] text-gray-400 uppercase tracking-wider border-b border-gray-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">No. Pesanan</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Jam Dipesan</th>
                      <th className="py-3 px-4">Total Bayar</th>
                      <th className="py-3 px-4">Status Pesanan</th>
                      <th className="py-3 px-4 text-right">Kelola Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Tidak ada pesanan yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => {
                        const statusConf = getOrderStatusConfig(ord.status);
                        return (
                          <tr key={ord.id} className="hover:bg-[#161a25]/60 transition-colors">
                            <td className="py-3 px-4">
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="font-mono-code font-bold text-amber-400 hover:underline text-left block"
                              >
                                {ord.orderNumber}
                              </button>
                              <div className="text-[10px] text-gray-400">
                                {formatDate(ord.createdAt)}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{ord.customerName}</div>
                              <div className="text-[11px] text-gray-400">{ord.customerPhone}</div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="text-gray-200">
                                {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                Via {ord.courier}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono-code font-bold text-amber-400">
                              {formatRupiah(ord.totalAmount)}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusConf.badgeClass}`}
                              >
                                {statusConf.label}
                              </span>
                              {ord.trackingNumber && (
                                <div className="text-[10px] text-cyan-300 font-mono mt-1">
                                  Resi: {ord.trackingNumber}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setViewingOrder(ord)}
                                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                                  title="Lihat Rincian Pesanan"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Quick state changes */}
                                {ord.status === 'awaiting_approval' && (
                                  <button
                                    onClick={() => handleApproveOrder(ord.id)}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </button>
                                )}

                                {ord.status === 'processing' && (
                                  <button
                                    onClick={() => setShippingResiModal({ orderId: ord.id, resi: '' })}
                                    className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Truck className="w-3 h-3" /> Input Resi
                                  </button>
                                )}

                                {ord.status === 'shipped' && (
                                  <button
                                    onClick={() => updateOrderStatus(ord.id, 'delivered')}
                                    className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    Tandai Selesai
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    if (confirm('Hapus order ini dari Firestore?')) {
                                      deleteOrder(ord.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                  title="Hapus Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: APPROVAL BUKTI PEMBAYARAN */}
        {/* ============================================================== */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-display text-xl font-bold text-white">
                Approval Bukti Pembayaran Pelanggan
              </h2>
              <p className="text-xs text-gray-400">
                Verifikasi struk bukti transfer yang diunggah pelanggan sebelum pesanan diproses dan dikemas di gudang.
              </p>
            </div>

            {awaitingApprovalOrders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#12151f] border border-gray-800 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif-display text-lg font-bold text-white">
                  Semua Bukti Pembayaran Telah Diverifikasi!
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Tidak ada pesanan yang sedang menunggu approval saat ini. Jika pelanggan mengunggah bukti transfer baru, kartu approval akan muncul di sini secara real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {awaitingApprovalOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-[#12151f] border border-amber-500/40 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                        <div>
                          <span className="font-mono-code text-sm font-bold text-amber-400">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {formatDate(ord.paymentProofSubmittedAt || ord.createdAt)}
                          </span>
                        </div>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Menunggu Approval
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-gray-400">{ord.customerEmail} • {ord.customerPhone}</div>
                        <div className="text-gray-300 font-mono text-sm pt-1">
                          Nominal: <strong className="text-amber-400">{formatRupiah(ord.totalAmount)}</strong>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Metode: {ord.paymentMethod}
                        </div>
                      </div>

                      {/* Image Preview */}
                      {ord.paymentProofUrl ? (
                        <div
                          onClick={() => setSelectedProofImage(ord.paymentProofUrl || null)}
                          className="relative aspect-video rounded-xl overflow-hidden border border-gray-700 bg-black group cursor-pointer"
                        >
                          <img
                            src={ord.paymentProofUrl}
                            alt="Bukti Transfer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white gap-1">
                            <Eye className="w-4 h-4" /> Klik untuk Perbesar
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-center text-xs text-gray-500">
                          Pelanggan belum mengunggah gambar bukti
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => handleApproveOrder(ord.id)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" /> Setujui
                      </button>

                      <button
                        onClick={() => setRejectionModal({ orderId: ord.id, reason: '' })}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/40 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Tolak Bukti
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: DATA PELANGGAN */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-white">
                  Data Pelanggan (Customer Directory)
                </h2>
                <p className="text-xs text-gray-400">
                  Total {customers.length} pelanggan tercatat di Firestore dengan riwayat akumulasi belanja.
                </p>
              </div>
            </div>

            {/* Customer Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Cari nama pelanggan, nomor WhatsApp, email..."
                className="w-full pl-9 pr-3 py-2 bg-[#12151f] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Customers Table */}
            <div className="rounded-2xl bg-[#12151f] border border-gray-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1017] text-gray-400 uppercase tracking-wider border-b border-gray-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nama Pelanggan</th>
                      <th className="py-3 px-4">Kontak</th>
                      <th className="py-3 px-4">Alamat Pengiriman</th>
                      <th className="py-3 px-4 text-center">Total Order</th>
                      <th className="py-3 px-4">Akumulasi Belanja</th>
                      <th className="py-3 px-4">Order Terakhir</th>
                      <th className="py-3 px-4 text-right">Hubungi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          Belum ada data pelanggan yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
                        const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                        return (
                          <tr key={cust.id} className="hover:bg-[#161a25]/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{cust.name}</div>
                              <div className="text-[11px] text-gray-400">{cust.email}</div>
                            </td>

                            <td className="py-3 px-4 font-mono-code text-gray-300">
                              {cust.phone}
                            </td>

                            <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                              {cust.address}, {cust.city}
                            </td>

                            <td className="py-3 px-4 text-center font-mono-code font-bold text-amber-400">
                              {cust.totalOrders}x
                            </td>

                            <td className="py-3 px-4 font-mono-code font-bold text-emerald-400">
                              {formatRupiah(cust.totalSpent)}
                            </td>

                            <td className="py-3 px-4 text-gray-400 text-[11px]">
                              {formatDate(cust.lastOrderDate)}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <a
                                href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(cust.name)}%2C%20terima%20kasih%20telah%20berbelanja%20di%20khzzz%20store.`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-semibold text-xs transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-800 bg-[#0e1017] flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-bold text-white">
                {editingProduct ? 'Edit Data Jam Tangan' : 'Tambah Jam Tangan Baru ke Katalog'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Nama Model Jam Tangan *</label>
                  <input
                    type="text"
                    required
                    value={formProdName}
                    onChange={(e) => setFormProdName(e.target.value)}
                    placeholder="Cth: KHZZZ Cosmograph Dark Sapphire"
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Brand / Lini Produksi *</label>
                  <input
                    type="text"
                    required
                    value={formProdBrand}
                    onChange={(e) => setFormProdBrand(e.target.value)}
                    placeholder="KHZZZ Horology Geneva"
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Kategori Jam Tangan *</label>
                  <select
                    value={formProdCategory}
                    onChange={(e) => setFormProdCategory(e.target.value as WatchCategory)}
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Chronograph & Luxury">Chronograph & Luxury</option>
                    <option value="Sport & Diver">Sport & Diver</option>
                    <option value="Classic & Minimalist">Classic & Minimalist</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Badge Tag</label>
                  <select
                    value={formProdBadge || ''}
                    onChange={(e) => setFormProdBadge(e.target.value as Product['badge'])}
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Best Seller">Best Seller</option>
                    <option value="Limited Edition">Limited Edition</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                    <option value="Featured">Featured</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Harga Jual (IDR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formProdPrice}
                    onChange={(e) => setFormProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Harga Coret / Asli (IDR)</label>
                  <input
                    type="number"
                    min={0}
                    value={formProdOrigPrice}
                    onChange={(e) => setFormProdOrigPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Jumlah Stok Gudang *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formProdStock}
                    onChange={(e) => setFormProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">URL Foto Jam Tangan</label>
                  <input
                    type="url"
                    value={formProdImage}
                    onChange={(e) => setFormProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={formProdDesc}
                  onChange={(e) => setFormProdDesc(e.target.value)}
                  placeholder="Detail keistimewaan jam tangan, cerita pembuatan, dan keunggulan material..."
                  className="w-full p-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl bg-[#0e1017] border border-gray-800 space-y-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Spesifikasi Teknis
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">Mesin / Movement</label>
                    <input
                      type="text"
                      value={formMovement}
                      onChange={(e) => setFormMovement(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#151923] border border-gray-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">Diameter Case</label>
                    <input
                      type="text"
                      value={formDiameter}
                      onChange={(e) => setFormDiameter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#151923] border border-gray-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">Water Resistance</label>
                    <input
                      type="text"
                      value={formWR}
                      onChange={(e) => setFormWR(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#151923] border border-gray-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">Kaca Kristal</label>
                    <input
                      type="text"
                      value={formGlass}
                      onChange={(e) => setFormGlass(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#151923] border border-gray-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Simpan ke Database Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VIEW FULL ORDER DETAILS */}
      {/* ============================================================== */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl p-6 overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-800">
                <span className="text-xs font-mono-code text-amber-400 uppercase tracking-widest block">
                  Detail Transaksi
                </span>
                <h3 className="font-serif-display text-xl font-bold text-white">
                  Invoice {viewingOrder.orderNumber}
                </h3>
                <div className="text-xs text-gray-400 mt-1">
                  Waktu Pemesanan: {formatDate(viewingOrder.createdAt)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-[#161a25] p-4 rounded-xl border border-gray-800">
                <div>
                  <span className="text-gray-400 block">Nama Penerima:</span>
                  <span className="font-bold text-white">{viewingOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Nomor Telepon:</span>
                  <span className="font-mono text-white">{viewingOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Alamat Email:</span>
                  <span className="text-white">{viewingOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Metode Pembayaran:</span>
                  <span className="font-bold text-amber-300">{viewingOrder.paymentMethod}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block">Alamat Pengiriman:</span>
                  <span className="text-white">{viewingOrder.shippingAddress}, {viewingOrder.city} ({viewingOrder.postalCode})</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                  Item Jam Tangan ({viewingOrder.items.length})
                </span>
                {viewingOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#161a25] border border-gray-800 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={it.imageUrl} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-medium text-white">{it.name}</div>
                        <div className="text-gray-400">{it.quantity} x {formatRupiah(it.price)}</div>
                      </div>
                    </div>
                    <span className="font-mono-code font-bold text-amber-400">
                      {formatRupiah(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-[#0e1017] rounded-xl border border-gray-800 space-y-1 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatRupiah(viewingOrder.subtotal)}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon:</span>
                    <span className="font-mono">- {formatRupiah(viewingOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Ongkos Kirim ({viewingOrder.courier}):</span>
                  <span className="font-mono">{formatRupiah(viewingOrder.shippingFee)}</span>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Bayar:</span>
                  <span className="font-mono text-amber-400 text-base">{formatRupiah(viewingOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Proof Preview if present */}
              {viewingOrder.paymentProofUrl && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-amber-300 block mb-1">Bukti Transfer Pelanggan:</span>
                  <img
                    src={viewingOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    onClick={() => setSelectedProofImage(viewingOrder.paymentProofUrl || null)}
                    className="max-h-40 rounded-xl border border-amber-500/40 cursor-pointer object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RESI PENGIRIMAN */}
      {/* ============================================================== */}
      {shippingResiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-sm bg-[#11141c] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif-display text-base font-bold text-white">
              Input Nomor Resi Ekspedisi
            </h3>
            <p className="text-xs text-gray-400">
              Masukkan nomor resi pengiriman agar status pesanan berubah menjadi "Sedang Dikirim" dan bisa dilacak pelanggan.
            </p>
            <form onSubmit={handleUpdateResiSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={shippingResiModal.resi}
                onChange={(e) => setShippingResiModal({ ...shippingResiModal, resi: e.target.value })}
                placeholder="Cth: JNE1092837465"
                className="w-full px-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShippingResiModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  Kirim & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REJECTION REASON */}
      {/* ============================================================== */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-sm bg-[#11141c] border border-rose-900/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif-display text-base font-bold text-rose-400">
              Tolak Bukti Pembayaran
            </h3>
            <p className="text-xs text-gray-400">
              Berikan alasan penolakan agar pelanggan mengetahui mengapa bukti transfer mereka ditolak.
            </p>
            <form onSubmit={handleRejectOrderSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                placeholder="Cth: Nominal transfer kurang Rp 50.000 atau gambar buram/tidak terbaca..."
                className="w-full p-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FULL RESOLUTION PAYMENT PROOF VIEWER */}
      {/* ============================================================== */}
      {selectedProofImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedProofImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2 bg-[#11141c] rounded-2xl border border-gray-800">
            <button
              onClick={() => setSelectedProofImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedProofImage}
              alt="Bukti Transfer Penuh"
              className="max-h-[80vh] max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RESET CONFIRMATION */}
      {/* ============================================================== */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-md bg-[#11141c] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif-display text-lg font-bold text-white">
                Reset ke 12 Produk Default?
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Tindakan ini akan mengembalikan data katalog produk di Firestore ke 12 produk jam tangan awal (4 Chronograph & Luxury, 4 Sport & Diver, 4 Classic & Minimalist).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-xs text-gray-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
              >
                Ya, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
