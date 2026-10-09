import React, { useState } from 'react';
import { X, Star, ShoppingBag, Shield, Check, Clock, Compass, Layers, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectCheckout: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const maxAvailable = Math.max(0, product.stock - inCartQty);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock || maxAvailable <= 0) return;
    const success = addToCart(product, quantity);
    if (success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock || maxAvailable <= 0) return;
    addToCart(product, quantity);
    onClose();
    onDirectCheckout(product, quantity);
  };

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Big Watch Photo */}
          <div className="md:col-span-5 bg-[#0a0c10] relative flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-800">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-xl group">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono-code text-xs font-semibold uppercase">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-gray-400 text-xs">({product.reviewsCount} review pembeli)</span>
                </div>
              </div>

              {/* Title & Brand */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{product.brand}</p>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-white mt-1">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-mono-code text-2xl sm:text-3xl font-bold text-amber-400">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm sm:text-base text-gray-500 line-through">
                      {formatRupiah(product.originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      Diskon {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Technical Horological Specs */}
              <div className="bg-[#161a24] rounded-2xl p-4 border border-gray-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider pb-2 border-b border-gray-800">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Spesifikasi Teknis Jam Tangan
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Movement:</span>
                    <span className="font-medium text-gray-200">{product.specs.movement}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Diameter Case:</span>
                    <span className="font-medium text-gray-200">{product.specs.caseDiameter}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Water Resistance:</span>
                    <span className="font-medium text-gray-200">{product.specs.waterResistance}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Kaca Kristal:</span>
                    <span className="font-medium text-gray-200">{product.specs.glass}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Material Strap:</span>
                    <span className="font-medium text-gray-200">{product.specs.strapMaterial}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Power Reserve:</span>
                    <span className="font-medium text-gray-200">{product.specs.powerReserve || '42 Jam'}</span>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-400">Status Stok Realtime:</span>
                {isOutOfStock ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Stok Habis
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Tersedia {product.stock} unit di gudang
                  </span>
                )}
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                  Jumlah:
                </span>
                <div className="flex items-center rounded-xl bg-[#161a24] border border-gray-800 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono-code text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                    disabled={quantity >= maxAvailable || isOutOfStock}
                    className="w-8 h-8 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {inCartQty > 0 && (
                  <span className="text-[11px] text-amber-400">
                    ({inCartQty} sudah di keranjang)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || maxAvailable <= 0}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock || maxAvailable <= 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#181c26] border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> Berhasil Ditambahkan
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Masukkan Keranjang
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || maxAvailable <= 0}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock || maxAvailable <= 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  Beli Sekarang
                </button>
              </div>

              {/* Guarantees footnote */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800/60">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Garansi Resmi 2 Tahun
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Dikirim dalam 24 Jam
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Sertifikat Otentik
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
