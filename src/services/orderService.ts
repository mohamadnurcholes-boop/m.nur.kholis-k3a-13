import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, OrderStatus } from '../types';
import { updateProductStock } from './productService';
import { recordCustomerPurchase } from './customerService';

const ORDERS_COLLECTION = 'orders';

// Generate clean human-readable invoice code
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KHZ-${dateStr}-${randomSuffix}`;
}

// Place a new order
export async function createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
  const orderNumber = generateOrderNumber();
  const orderId = orderNumber.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderPayload,
    id: orderId,
    orderNumber,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(docRef, newOrder);

    // Deduct stock for each purchased item
    for (const item of newOrder.items) {
      try {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock || 0;
          const nextStock = Math.max(0, currentStock - item.quantity);
          await updateProductStock(item.productId, nextStock);
        }
      } catch (stockErr) {
        console.warn(`Failed to deduct stock for ${item.productId}:`, stockErr);
      }
    }

    // Record or update customer profile
    await recordCustomerPurchase({
      name: newOrder.customerName,
      email: newOrder.customerEmail,
      phone: newOrder.customerPhone,
      address: newOrder.shippingAddress,
      city: newOrder.city,
      orderTotal: newOrder.totalAmount,
    });

    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Real-time listener for orders
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as Order), id: docSnap.id });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    }
  );
}

// Customer uploads payment proof receipt
export async function uploadPaymentProof(orderId: string, proofUrl: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentProofUrl: proofUrl,
      paymentProofSubmittedAt: new Date().toISOString(),
      status: 'awaiting_approval' as OrderStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Admin approves customer payment
export async function approvePayment(orderId: string, note?: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'processing' as OrderStatus,
      approvalNote: note || 'Bukti pembayaran valid. Pesanan sedang disiapkan.',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Admin rejects payment
export async function rejectPayment(orderId: string, reason: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'rejected' as OrderStatus,
      approvalNote: `Pembayaran ditolak: ${reason}`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Update order status & tracking number
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  note?: string
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates: Partial<Order> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (note !== undefined) updates.approvalNote = note;

    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Delete order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Search order for customer tracking
export async function searchOrder(identifier: string): Promise<Order | null> {
  const cleanId = identifier.trim();
  if (!cleanId) return null;

  try {
    // 1. Check exact doc ID or orderNumber
    const docRef = doc(db, ORDERS_COLLECTION, cleanId.toLowerCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Order;
    }

    // 2. Query by orderNumber
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const qNumber = query(ordersRef, where('orderNumber', '==', cleanId.toUpperCase()));
    const snapNumber = await getDocs(qNumber);
    if (!snapNumber.empty) {
      return snapNumber.docs[0].data() as Order;
    }

    // 3. Query by customerEmail
    const qEmail = query(ordersRef, where('customerEmail', '==', cleanId.toLowerCase()), orderBy('createdAt', 'desc'));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      return snapEmail.docs[0].data() as Order;
    }

    return null;
  } catch (error) {
    console.warn('Order lookup error:', error);
    return null;
  }
}
