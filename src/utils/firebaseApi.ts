import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, User } from '../types';

export const firebaseApi = {
  // Продукты
  async getProducts(): Promise<Product[]> {
    console.log('🔍 Загружаем продукты из Firebase...');
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      console.log('📊 Количество документов в коллекции products:', querySnapshot.size);
      
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📦 Документ продукта:', doc.id, data);
        return {
          id: doc.id,
          ...data
        } as Product;
      });
      
      console.log(`✅ Загружено ${products.length} продуктов из Firebase:`, products);
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
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);
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
    console.log('🔍 Загружаем пользователей из Firebase...');
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      console.log(`✅ Загружено ${users.length} пользователей из Firebase:`, users);
      return users;
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей из Firebase:', error);
      return [];
    }
  },

  async createUser(user: User): Promise<User> {
    await addDoc(collection(db, 'users'), user);
    return user;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, updates);
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