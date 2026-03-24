import { supabase } from './supabase';
import { Product, Order, User } from '../types';

// Products API
export const supabaseApi = {
  // ========== PRODUCTS ==========
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ========== ORDERS ==========
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  // ========== USERS ==========
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async createUser(user: User): Promise<User> {
    const newUser = {
      ...user,
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  },

  // ========== GROUP ORDERS ==========
  async getGroupOrders(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_orders')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching group orders:', error);
      return [];
    }
  },

  async createGroupOrder(groupOrder: any): Promise<any> {
    const newGroupOrder = {
      ...groupOrder,
      id: Date.now().toString(),
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('group_orders')
      .insert([newGroupOrder])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGroupOrder(id: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('group_orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  // ========== DELIVERY POOLS ==========
  async getDeliveryPools(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_pools')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching delivery pools:', error);
      return [];
    }
  },

  async createOrUpdatePool(pool: any): Promise<void> {
    const { error } = await supabase
      .from('delivery_pools')
      .upsert([pool]);

    if (error) throw error;
  },

  // ========== ANALYTICS ==========
  async trackVisit(visit?: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Проверяем, есть ли запись за сегодня
      const { data: existing } = await supabase
        .from('analytics')
        .select('*')
        .eq('date', today)
        .single();

      if (existing) {
        // Обновляем существующую запись
        await supabase
          .from('analytics')
          .update({ 
            visits: existing.visits + 1,
            uniqueVisitors: existing.uniqueVisitors + 1 
          })
          .eq('id', existing.id);
      } else {
        // Создаём новую запись
        await supabase
          .from('analytics')
          .insert([{
            id: Date.now().toString(),
            date: today,
            visits: 1,
            uniqueVisitors: 1,
            createdat: new Date().toISOString()
          }]);
      }
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  },

  async getVisitorStats(startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      return [];
    }
  },

  async getAnalytics(days: number = 30): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(days);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }
};

// Экспортируем как firebaseApi для совместимости
export const firebaseApi = supabaseApi;
