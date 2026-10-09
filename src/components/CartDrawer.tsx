import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(inputCoupon);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setInputCoupon('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setCouponMessage(null), 3000);
  };

  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#11141c] border-l border-amber-900/30 text-gray-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#0e1017]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-display text-lg font-bold text-white">Keranjang Belanja</h2>
                <p className="text-xs text-gray-400">
                  {items.length === 0 ? 'Belum ada produk' : `${items.length} jenis jam tangan terpilih`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center text-gray-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-serif-display text-base font-semibold text-gray-200">
                    Keranjang Anda Kosong
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Jelajahi koleksi jam tangan mewah kami dan temukan mahakarya favorit Anda.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all uppercase tracking-wider"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-[#151923] border border-gray-800/80 hover:border-gray-700 transition-all"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-black shrink-0 border border-gray-800"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] text-amber-400 font-mono-code uppercase block">
                            {item.product.brand}
                          </span>
                          <h4 className="font-serif-display text-xs font-bold text-gray-100 line-clamp-1">
                            {item.product.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-mono-code text-xs font-bold text-amber-400 mt-1">
                        {formatRupiah(item.product.price)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/60">
                      <div className="flex items-center rounded-lg bg-[#0e1017] border border-gray-800 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-mono-code text-xs font-bold text-gray-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 flex items-center justify-center text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded font-bold disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono-code text-xs font-medium text-gray-300">
                        Total: {formatRupiah(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 bg-[#0e1017] border-t border-gray-800 space-y-4">
              {/* Voucher Input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Voucher: <strong>{couponCode}</strong></span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Kode Voucher (cth: KHZZZLUXURY)"
                          className="w-full pl-9 pr-3 py-2 bg-[#151923] border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 uppercase focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-800 hover:bg-amber-500 hover:text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer text-gray-300"
                      >
                        Gunakan
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        className={`text-[11px] ${
                          couponMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {couponMessage.text}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500">
                      Gunakan kode <span className="text-amber-400 font-mono">KHZZZLUXURY</span> (Diskon 10%) atau <span className="text-amber-400 font-mono">VIP500</span> (Potongan 500rb)
                    </p>
                  </form>
                )}
              </div>

              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-mono-code text-gray-200">{formatRupiah(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Potongan Diskon</span>
                    <span className="font-mono-code">- {formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimasi Ongkos Kirim</span>
                  <span className="text-emerald-400 font-medium">Dihitung saat checkout</span>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Sementara</span>
                  <span className="font-mono-code text-amber-400 text-base">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Transaksi Terenkripsi Aman & Bergaransi</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
