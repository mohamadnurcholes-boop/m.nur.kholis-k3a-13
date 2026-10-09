import React, { useState } from 'react';
import {
  X,
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { searchOrder } from '../services/orderService';
import { Order } from '../types';
import { formatRupiah, formatDate, getOrderStatusConfig } from '../utils/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadProof: (orderId: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  onOpenUploadProof,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const order = await searchOrder(queryInput.trim());
      setSearchedOrder(order);
    } catch (err) {
      console.error('Track order error:', err);
      setSearchedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: 'Pesanan Dibuat', icon: Clock },
    { title: 'Verifikasi Pembayaran', icon: CheckCircle },
    { title: 'Diproses Gudang', icon: Package },
    { title: 'Dalam Pengiriman', icon: Truck },
    { title: 'Terkirim / Selesai', icon: CheckCircle },
  ];

  const getStepActiveIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending_payment':
        return 0;
      case 'awaiting_approval':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = searchedOrder ? getStepActiveIndex(searchedOrder.status) : 0;
  const statusConfig = searchedOrder ? getOrderStatusConfig(searchedOrder.status) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-[#0e1017] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif-display text-lg sm:text-xl font-bold text-white">
              Lacak Status Pesanan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs text-gray-300 block">
              Masukkan Nomor Pesanan (Invoice) atau Email Pembeli:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Cth: KHZ-261008-8821 atau kholis@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Mencari...' : 'Cari Pesanan'}
              </button>
            </div>
          </form>

          {/* Results */}
          {hasSearched && !searchedOrder && !isLoading && (
            <div className="p-8 text-center bg-[#151923] rounded-2xl border border-gray-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400/60 mx-auto" />
              <p className="text-sm font-semibold text-gray-200">
                Pesanan tidak ditemukan
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Pastikan nomor pesanan (format: KHZ-xxxx) atau alamat email yang Anda masukkan sudah benar dan sesuai saat proses checkout.
              </p>
            </div>
          )}

          {searchedOrder && statusConfig && (
            <div className="space-y-6">
              {/* Order Status Header */}
              <div className="p-4 rounded-2xl bg-[#151923] border border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono-code text-gray-400 uppercase tracking-widest block">
                    No. Pesanan
                  </span>
                  <div className="font-serif-display text-lg font-bold text-white">
                    {searchedOrder.orderNumber}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Dibuat pada: {formatDate(searchedOrder.createdAt)}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badgeClass}`}
                  >
                    {statusConfig.label}
                  </span>
                  {searchedOrder.trackingNumber && (
                    <div className="text-xs text-cyan-300 font-mono mt-1.5 flex items-center gap-1 justify-end">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Resi: {searchedOrder.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="py-2">
                <div className="grid grid-cols-5 gap-1 text-center relative">
                  {steps.map((st, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const Icon = st.icon;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                              : 'bg-gray-800 text-gray-500 border border-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] mt-2 font-medium leading-tight ${
                            isCurrent ? 'text-amber-400 font-bold' : isDone ? 'text-gray-200' : 'text-gray-500'
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval / Rejection Note */}
              {searchedOrder.approvalNote && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <strong>Catatan dari Admin:</strong> {searchedOrder.approvalNote}
                </div>
              )}

              {/* Action: If pending payment or rejected, allow upload proof */}
              {(searchedOrder.status === 'pending_payment' || searchedOrder.status === 'rejected') && (
                <div className="p-4 rounded-2xl bg-[#1c1814] border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-amber-200/90 text-center sm:text-left">
                    <p className="font-semibold text-amber-300">
                      Menunggu Bukti Transfer Pembayaran
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Segera unggah struk pembayaran agar pesanan diproses oleh admin khzzz store.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUploadProof(searchedOrder.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Unggah Bukti Bayar
                  </button>
                </div>
              )}

              {/* Order Items Table */}
              <div className="bg-[#151923] rounded-2xl p-4 border border-gray-800 space-y-3">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider pb-2 border-b border-gray-800">
                  Rincian Jam Tangan Dipesan
                </h4>
                <div className="space-y-2">
                  {searchedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-black"
                        />
                        <div>
                          <div className="font-medium text-white line-clamp-1">{item.name}</div>
                          <div className="text-gray-400 text-[11px]">
                            {item.quantity} x {formatRupiah(item.price)}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-code font-bold text-amber-400">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-mono-code">{formatRupiah(searchedOrder.subtotal)}</span>
                  </div>
                  {searchedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Diskon:</span>
                      <span className="font-mono-code">- {formatRupiah(searchedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Ongkir ({searchedOrder.courier}):</span>
                    <span className="font-mono-code">{formatRupiah(searchedOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800/80">
                    <span>Total Pembayaran:</span>
                    <span className="font-mono-code text-amber-400 text-base">
                      {formatRupiah(searchedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-[#151923] rounded-2xl p-4 border border-gray-800 text-xs text-gray-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
                  <MapPin className="w-4 h-4" /> Alamat Pengiriman
                </div>
                <p>
                  <strong>{searchedOrder.customerName}</strong> ({searchedOrder.customerPhone})
                </p>
                <p className="text-gray-400">{searchedOrder.shippingAddress}, {searchedOrder.city}</p>
                <p className="text-gray-400">Metode Bayar: {searchedOrder.paymentMethod}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
