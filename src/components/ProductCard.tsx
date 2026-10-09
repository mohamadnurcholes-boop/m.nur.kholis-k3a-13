import React from 'react';
import { Star, ShoppingBag, Eye, Check, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail }) => {
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = currentInCart >= product.stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;

    const success = addToCart(product, 1);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div
      onClick={() => onViewDetail(product)}
      className="group relative bg-[#13161f] rounded-2xl border border-gray-800/80 hover:border-amber-500/50 shadow-lg hover:shadow-2xl hover:shadow-amber-950/20 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#0c0e12]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13161f] via-transparent to-black/30 opacity-70" />

        {/* Badge Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                product.badge === 'Best Seller'
                  ? 'bg-amber-500 text-black'
                  : product.badge === 'Limited Edition'
                  ? 'bg-purple-600 text-white'
                  : product.badge === 'Sale'
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-md self-start">
              Hemat {discountPercent}%
            </span>
          )}
        </div>

        {/* Stock Indicator Top Right */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="bg-rose-950/90 text-rose-300 border border-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Stok Habis
            </span>
          ) : product.stock <= 5 ? (
            <span className="bg-amber-950/90 text-amber-300 border border-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md">
              Sisa {product.stock} Unit
            </span>
          ) : (
            <span className="bg-black/60 text-emerald-400 border border-emerald-900/60 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-md">
              Stok: {product.stock}
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(product);
          }}
          className="absolute inset-x-4 bottom-3 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-gray-700 text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-amber-500 hover:text-black hover:border-amber-400"
        >
          <Eye className="w-3.5 h-3.5" />
          Lihat Spesifikasi Lengkap
        </button>
      </div>

      {/* Card Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono-code text-amber-400 tracking-wider uppercase font-medium">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-semibold text-gray-200">{product.rating}</span>
              <span className="text-[10px] text-gray-500">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Name & Brand */}
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">{product.brand}</p>
          <h3 className="font-serif-display text-base font-bold text-gray-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Key spec snippet */}
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {product.specs.movement} • {product.specs.caseDiameter} • {product.specs.waterResistance}
          </p>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-4 mt-3 border-t border-gray-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="font-mono-code text-base sm:text-lg font-bold text-amber-400">
              {formatRupiah(product.price)}
            </div>
            {product.originalPrice > product.price && (
              <div className="text-[11px] text-gray-500 line-through">
                {formatRupiah(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isMaxInCart}
            className={`p-2.5 rounded-xl font-semibold transition-all flex items-center justify-center cursor-pointer ${
              isOutOfStock || isMaxInCart
                ? 'bg-gray-800/60 text-gray-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-500 text-black'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95'
            }`}
            title={
              isOutOfStock
                ? 'Stok habis'
                : isMaxInCart
                ? 'Jumlah maksimal dalam keranjang'
                : 'Tambah ke Keranjang'
            }
          >
            {justAdded ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
