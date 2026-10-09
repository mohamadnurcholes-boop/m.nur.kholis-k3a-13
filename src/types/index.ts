export type WatchCategory = 'Chronograph & Luxury' | 'Sport & Diver' | 'Classic & Minimalist';

export interface WatchSpecs {
  movement: string;
  caseDiameter: string;
  waterResistance: string;
  strapMaterial: string;
  glass: string;
  powerReserve?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: WatchCategory;
  price: number;
  originalPrice: number;
  stock: number;
  description: string;
  imageUrl: string;
  badge?: 'Best Seller' | 'New' | 'Limited Edition' | 'Sale' | 'Featured';
  rating: number;
  reviewsCount: number;
  featured: boolean;
  specs: WatchSpecs;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'awaiting_approval'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  courier: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentProofSubmittedAt?: string;
  approvalNote?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'store_manager';
  isLoggedIn: boolean;
}
