import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'khzzz_store_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed saving cart to localStorage', err);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) return false;

    let success = true;
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          success = false;
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          success = false;
          return prev;
        }
        return [...prev, { product, quantity }];
      }
    });

    if (success) {
      setIsCartOpen(true);
    }
    return success;
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = item.product.stock;
          const finalQty = Math.min(quantity, maxAllowed);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountPercent(0);
    setDiscountFixed(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Masukkan kode voucher' };

    if (clean === 'KHZZZLUXURY' || clean === 'KHZZZ10') {
      setCouponCode(clean);
      setDiscountPercent(10);
      setDiscountFixed(0);
      return { success: true, message: 'Voucher 10% Diskon berhasil diterapkan!' };
    } else if (clean === 'VIPHOROLOGY' || clean === 'VIP500') {
      setCouponCode(clean);
      setDiscountPercent(0);
      setDiscountFixed(500000);
      return { success: true, message: 'Voucher Potongan Rp 500.000 berhasil!' };
    } else {
      return { success: false, message: 'Kode voucher tidak valid atau sudah kadaluarsa.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setDiscountFixed(0);
  };

  const discount = Math.min(
    subtotal,
    discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : discountFixed
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        couponCode,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
