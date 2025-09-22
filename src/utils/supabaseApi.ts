import { supabase } from './supabase';
import { User, Product, Order } from '../types';

// API для пользователей
export const supabaseApi = {
  // Пользователи
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async createUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Товары
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const productWithId = {
      ...product,
      id: Date.now().toString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productWithId])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Заказы
  async getOrders(): Promise<Order[]> {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersError) throw ordersError;

    // Получаем позиции для каждого заказа
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) throw itemsError;
        
        return {
          ...order,
          items: items || []
        };
      })
    );

    return ordersWithItems;
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const orderWithId = {
      ...order,
      id: Date.now().toString()
    };

    // Создаем заказ
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderWithId.id,
        customer_id: orderWithId.customerId,
        total: orderWithId.total,
        status: orderWithId.status,
        delivery_address: orderWithId.deliveryAddress,
        pavilion_number: orderWithId.pavilionNumber,
        courier_id: orderWithId.courierId,
        created_at: orderWithId.createdAt
      }])
      .select()
      .single();
    
    if (orderError) throw orderError;

    // Создаем позиции заказа
    if (orderWithId.items && orderWithId.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderWithId.items.map(item => ({
            order_id: orderWithId.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            price: item.price
          }))
        );
      
      if (itemsError) throw itemsError;
    }

    return orderWithId;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: updates.status,
        courier_id: updates.courierId,
        pavilion_number: updates.pavilionNumber
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};