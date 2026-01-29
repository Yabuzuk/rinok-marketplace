import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, User } from '../types';

export const firebaseApi = {
  // Продукты
  async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Product;
      });
      
      return products;
    } catch (error) {
      console.error('❌ Ошибка загрузки продуктов из Firebase:', error);
      return [];
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const docRef = await addDoc(collection(db, 'products'), product);
    return { id: docRef.id, ...product };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      if (error.code === 'not-found') {
        console.error(`❌ Товар с ID ${id} не найден в базе данных`);
        throw new Error(`Товар не найден в базе данных. Возможно, он был удален.`);
      }
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id));
  },

  // Заказы
  async getOrders(): Promise<Order[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...order };
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, updates);
  },

  // Пользователи
  async getUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      return users;
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей из Firebase:', error);
      return [];
    }
  },

  async createUser(user: User): Promise<User> {
    try {
      // Если у пользователя уже есть ID, используем setDoc
      if (user.id) {
        const docRef = doc(db, 'users', user.id);
        await setDoc(docRef, user);
        return user;
      } else {
        // Если ID нет, создаем с автоматическим ID
        const docRef = await addDoc(collection(db, 'users'), user);
        return { ...user, id: docRef.id };
      }
    } catch (error) {
      console.error('❌ Ошибка создания пользователя:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      if (error.code === 'not-found') {
        console.error(`❌ Пользователь с ID ${id} не найден в базе данных`);
        throw new Error(`Пользователь не найден в базе данных. Возможно, он был удален.`);
      }
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(doc(db, 'users', id));
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }
};