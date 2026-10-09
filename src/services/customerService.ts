import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Customer } from '../types';

const CUSTOMERS_COLLECTION = 'customers';

export async function recordCustomerPurchase(params: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  orderTotal: number;
}): Promise<void> {
  const customerId = params.email.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);

  try {
    const existingSnap = await getDoc(docRef);
    const now = new Date().toISOString();

    if (existingSnap.exists()) {
      const data = existingSnap.data() as Customer;
      await setDoc(
        docRef,
        {
          name: params.name,
          phone: params.phone || data.phone,
          address: params.address || data.address,
          city: params.city || data.city,
          totalOrders: (data.totalOrders || 0) + 1,
          totalSpent: (data.totalSpent || 0) + params.orderTotal,
          lastOrderDate: now,
        },
        { merge: true }
      );
    } else {
      const newCustomer: Customer = {
        id: customerId,
        name: params.name,
        email: params.email,
        phone: params.phone,
        address: params.address,
        city: params.city,
        totalOrders: 1,
        totalSpent: params.orderTotal,
        lastOrderDate: now,
        createdAt: now,
      };
      await setDoc(docRef, newCustomer);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CUSTOMERS_COLLECTION}/${customerId}`);
  }
}

export function subscribeToCustomers(
  onData: (customers: Customer[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const customersRef = collection(db, CUSTOMERS_COLLECTION);
  const q = query(customersRef, orderBy('lastOrderDate', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Customer[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as Customer), id: docSnap.id });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, CUSTOMERS_COLLECTION);
    }
  );
}
