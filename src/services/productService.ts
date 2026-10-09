import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/defaultProducts';

const PRODUCTS_COLLECTION = 'products';

// Check and seed initial 12 products if database is fresh
export async function seedProductsIfEmpty(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);

    if (snapshot.empty) {
      console.log('Database products empty. Seeding initial 12 luxury watches into real Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
      }
      return INITIAL_PRODUCTS;
    }

    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
  }
}

// Reset products in Firestore to default 12 items
export async function resetProductsToDefault(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);

    // Remove existing
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, docSnap.id));
    }

    // Insert 12 initial products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}

// Real-time listener for products
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(productsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as Product), id: docSnap.id });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    }
  );
}

// Save or Update Product
export async function saveProduct(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
  }
}

// Quick Stock update
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      stock: Math.max(0, newStock),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}
