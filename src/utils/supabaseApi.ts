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
      
      // Преобразуем lowercase поля в camelCase
      const products = (data || []).map((p: any) => ({
        ...p,
        sellerId: p.sellerid,
        pavilionNumber: p.pavilionnumber,
        minOrderQuantity: p.minorderquantity,
        internalCode: p.internalcode,
        createdAt: p.createdat
      }));
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = {
      id: Date.now().toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      stock: product.stock,
      sellerid: product.sellerId,
      pavilionnumber: product.pavilionNumber,
      minorderquantity: product.minOrderQuantity,
      internalcode: product.internalCode,
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;
    
    // Преобразуем обратно в camelCase
    return {
      ...data,
      sellerId: data.sellerid,
      pavilionNumber: data.pavilionnumber,
      minOrderQuantity: data.minorderquantity,
      internalCode: data.internalcode,
      createdAt: data.createdat
    };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    // Конвертируем camelCase в lowercase для PostgreSQL
    const dbUpdates: any = { ...updates };
    
    if (updates.sellerId !== undefined) {
      dbUpdates.sellerid = updates.sellerId;
      delete dbUpdates.sellerId;
    }
    if (updates.pavilionNumber !== undefined) {
      dbUpdates.pavilionnumber = updates.pavilionNumber;
      delete dbUpdates.pavilionNumber;
    }
    if (updates.minOrderQuantity !== undefined) {
      dbUpdates.minorderquantity = updates.minOrderQuantity;
      delete dbUpdates.minOrderQuantity;
    }
    if (updates.internalCode !== undefined) {
      dbUpdates.internalcode = updates.internalCode;
      delete dbUpdates.internalCode;
    }
    if (updates.createdAt !== undefined) {
      dbUpdates.createdat = updates.createdAt;
      delete dbUpdates.createdAt;
    }

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
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
      
      // Преобразуем lowercase поля в camelCase
      const orders = (data || []).map((o: any) => ({
        ...o,
        customerId: o.customerid,
        totalWeight: o.totalweight,
        deliveryAddress: o.deliveryaddress,
        deliveryDate: o.deliverydate,
        deliveryTimeSlot: o.deliverytimeslot,
        deliveryType: o.deliverytype,
        deliveryPrice: o.deliveryprice,
        pavilionNumber: o.pavilionnumber,
        groupOrderId: o.grouporderid,
        courierId: o.courierid,
        isModified: o.ismodified,
        customerApproved: o.customerapproved,
        createdAt: o.createdat
      }));
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const newOrder: any = {
      id: Date.now().toString(),
      customerid: (order as any).customerId,
      items: order.items,
      total: order.total,
      totalweight: (order as any).totalWeight || 0,
      status: order.status,
      deliveryaddress: (order as any).deliveryAddress,
      deliverydate: (order as any).deliveryDate,
      deliverytimeslot: (order as any).deliveryTimeSlot,
      deliverytype: (order as any).deliveryType,
      deliveryprice: (order as any).deliveryPrice || 0,
      pavilionnumber: (order as any).pavilionNumber,
      grouporderid: (order as any).groupOrderId,
      courierid: (order as any).courierId,
      ismodified: (order as any).isModified || false,
      customerapproved: (order as any).customerApproved || false,
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;
    
    // Преобразуем обратно в camelCase
    return {
      ...data,
      customerId: data.customerid,
      totalWeight: data.totalweight,
      deliveryAddress: data.deliveryaddress,
      deliveryDate: data.deliverydate,
      deliveryTimeSlot: data.deliverytimeslot,
      deliveryType: data.deliverytype,
      deliveryPrice: data.deliveryprice,
      pavilionNumber: data.pavilionnumber,
      groupOrderId: data.grouporderid,
      courierId: data.courierid,
      isModified: data.ismodified,
      customerApproved: data.customerapproved,
      createdAt: data.createdat
    };
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    // Конвертируем camelCase в lowercase для PostgreSQL
    const dbUpdates: any = { ...updates };
    
    if (updates.customerId !== undefined) {
      dbUpdates.customerid = (updates as any).customerId;
      delete dbUpdates.customerId;
    }
    if ((updates as any).totalWeight !== undefined) {
      dbUpdates.totalweight = (updates as any).totalWeight;
      delete dbUpdates.totalWeight;
    }
    if ((updates as any).deliveryAddress !== undefined) {
      dbUpdates.deliveryaddress = (updates as any).deliveryAddress;
      delete dbUpdates.deliveryAddress;
    }
    if ((updates as any).deliveryDate !== undefined) {
      dbUpdates.deliverydate = (updates as any).deliveryDate;
      delete dbUpdates.deliveryDate;
    }
    if ((updates as any).deliveryTimeSlot !== undefined) {
      dbUpdates.deliverytimeslot = (updates as any).deliveryTimeSlot;
      delete dbUpdates.deliveryTimeSlot;
    }
    if ((updates as any).deliveryType !== undefined) {
      dbUpdates.deliverytype = (updates as any).deliveryType;
      delete dbUpdates.deliveryType;
    }
    if ((updates as any).deliveryPrice !== undefined) {
      dbUpdates.deliveryprice = (updates as any).deliveryPrice;
      delete dbUpdates.deliveryPrice;
    }
    if ((updates as any).pavilionNumber !== undefined) {
      dbUpdates.pavilionnumber = (updates as any).pavilionNumber;
      delete dbUpdates.pavilionNumber;
    }
    if ((updates as any).groupOrderId !== undefined) {
      dbUpdates.grouporderid = (updates as any).groupOrderId;
      delete dbUpdates.groupOrderId;
    }
    if ((updates as any).courierId !== undefined) {
      dbUpdates.courierid = (updates as any).courierId;
      delete dbUpdates.courierId;
    }
    if ((updates as any).managerId !== undefined) {
      dbUpdates.managerid = (updates as any).managerId;
      delete dbUpdates.managerId;
    }
    if ((updates as any).isModified !== undefined) {
      dbUpdates.ismodified = (updates as any).isModified;
      delete dbUpdates.isModified;
    }
    if ((updates as any).customerApproved !== undefined) {
      dbUpdates.customerapproved = (updates as any).customerApproved;
      delete dbUpdates.customerApproved;
    }
    if ((updates as any).createdAt !== undefined) {
      dbUpdates.createdat = (updates as any).createdAt;
      delete dbUpdates.createdAt;
    }

    const { error } = await supabase
      .from('orders')
      .update(dbUpdates)
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
      
      // Преобразуем lowercase поля в camelCase
      const users = (data || []).map((u: any) => ({
        ...u,
        sellerActive: u.selleractive,
        createdAt: u.createdat,
        cardHolderName: u.cardholdername,
        bankCard: u.bankcard,
        cardPhone: u.cardphone,
        bankName: u.bankname,
        pavilionNumber: u.pavilionnumber,
        addresses: Array.isArray(u.addresses) ? u.addresses : []
      }));
      
      return users;
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
    // Конвертируем camelCase в lowercase для PostgreSQL
    const dbUpdates: any = { ...updates };
    
    if (updates.sellerActive !== undefined) {
      dbUpdates.selleractive = updates.sellerActive;
      delete dbUpdates.sellerActive;
    }
    if (updates.cardHolderName !== undefined) {
      dbUpdates.cardholdername = updates.cardHolderName;
      delete dbUpdates.cardHolderName;
    }
    if (updates.bankCard !== undefined) {
      dbUpdates.bankcard = updates.bankCard;
      delete dbUpdates.bankCard;
    }
    if (updates.cardPhone !== undefined) {
      dbUpdates.cardphone = updates.cardPhone;
      delete dbUpdates.cardPhone;
    }
    if (updates.bankName !== undefined) {
      dbUpdates.bankname = updates.bankName;
      delete dbUpdates.bankName;
    }
    if (updates.pavilionNumber !== undefined) {
      dbUpdates.pavilionnumber = updates.pavilionNumber;
      delete dbUpdates.pavilionNumber;
    }

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
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
      
      // Преобразуем lowercase поля в camelCase
      const groupOrders = (data || []).map((g: any) => ({
        ...g,
        deliveryDate: g.deliverydate,
        deliveryTimeSlot: g.deliverytimeslot,
        deliveryPoolId: g.deliverypoolid,
        poolCloseTime: g.poolclosetime,
        organizerId: g.organizerid,
        organizerName: g.organizername,
        deliveryPrice: g.deliveryprice,
        deliveryShares: g.deliveryshares,
        createdAt: g.createdat
      }));
      
      return groupOrders;
    } catch (error) {
      console.error('Error fetching group orders:', error);
      return [];
    }
  },

  async createGroupOrder(groupOrder: any): Promise<any> {
    const newGroupOrder: any = {
      id: Date.now().toString(),
      code: groupOrder.code,
      address: groupOrder.address,
      deliverydate: groupOrder.deliveryDate,
      deliverytimeslot: groupOrder.deliveryTimeSlot,
      deliverypoolid: groupOrder.deliveryPoolId,
      poolclosetime: groupOrder.poolCloseTime,
      organizerid: groupOrder.organizerId,
      organizername: groupOrder.organizerName,
      participants: groupOrder.participants || [],
      status: groupOrder.status || 'open',
      deliveryprice: groupOrder.deliveryPrice,
      deliveryshares: groupOrder.deliveryShares,
      createdat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('group_orders')
      .insert([newGroupOrder])
      .select()
      .single();

    if (error) throw error;
    
    // Преобразуем обратно в camelCase
    return {
      ...data,
      deliveryDate: data.deliverydate,
      deliveryTimeSlot: data.deliverytimeslot,
      deliveryPoolId: data.deliverypoolid,
      poolCloseTime: data.poolclosetime,
      organizerId: data.organizerid,
      organizerName: data.organizername,
      deliveryPrice: data.deliveryprice,
      deliveryShares: data.deliveryshares,
      createdAt: data.createdat
    };
  },

  async updateGroupOrder(id: string, updates: any): Promise<void> {
    // Конвертируем camelCase в lowercase для PostgreSQL
    const dbUpdates: any = { ...updates };
    
    if (updates.deliveryDate !== undefined) {
      dbUpdates.deliverydate = updates.deliveryDate;
      delete dbUpdates.deliveryDate;
    }
    if (updates.deliveryTimeSlot !== undefined) {
      dbUpdates.deliverytimeslot = updates.deliveryTimeSlot;
      delete dbUpdates.deliveryTimeSlot;
    }
    if (updates.deliveryPoolId !== undefined) {
      dbUpdates.deliverypoolid = updates.deliveryPoolId;
      delete dbUpdates.deliveryPoolId;
    }
    if (updates.poolCloseTime !== undefined) {
      dbUpdates.poolclosetime = updates.poolCloseTime;
      delete dbUpdates.poolCloseTime;
    }
    if (updates.organizerId !== undefined) {
      dbUpdates.organizerid = updates.organizerId;
      delete dbUpdates.organizerId;
    }
    if (updates.organizerName !== undefined) {
      dbUpdates.organizername = updates.organizerName;
      delete dbUpdates.organizerName;
    }
    if (updates.deliveryPrice !== undefined) {
      dbUpdates.deliveryprice = updates.deliveryPrice;
      delete dbUpdates.deliveryPrice;
    }
    if (updates.deliveryShares !== undefined) {
      dbUpdates.deliveryshares = updates.deliveryShares;
      delete dbUpdates.deliveryShares;
    }
    if (updates.createdAt !== undefined) {
      dbUpdates.createdat = updates.createdAt;
      delete dbUpdates.createdAt;
    }

    const { error } = await supabase
      .from('group_orders')
      .update(dbUpdates)
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
      
      // Преобразуем lowercase поля в camelCase
      const pools = (data || []).map((p: any) => ({
        ...p,
        timeSlot: p.timeslot,
        closeTime: p.closetime,
        groupOrders: p.grouporders,
        createdAt: p.createdat
      }));
      
      return pools;
    } catch (error) {
      console.error('Error fetching delivery pools:', error);
      return [];
    }
  },

  async createOrUpdatePool(pool: any): Promise<void> {
    // Конвертируем camelCase в lowercase для PostgreSQL
    const dbPool: any = { ...pool };
    
    if (pool.timeSlot !== undefined) {
      dbPool.timeslot = pool.timeSlot;
      delete dbPool.timeSlot;
    }
    if (pool.closeTime !== undefined) {
      dbPool.closetime = pool.closeTime;
      delete dbPool.closeTime;
    }
    if (pool.groupOrders !== undefined) {
      dbPool.grouporders = pool.groupOrders;
      delete dbPool.groupOrders;
    }
    if (pool.createdAt !== undefined) {
      dbPool.createdat = pool.createdAt;
      delete dbPool.createdAt;
    }

    const { error } = await supabase
      .from('delivery_pools')
      .upsert([dbPool]);

    if (error) throw error;
  },

  // ========== ANALYTICS ==========
  async trackVisit(visit?: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Проверяем, есть ли запись за сегодня
      const { data: existing, error: selectError } = await supabase
        .from('analytics')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (selectError) {
        console.warn('Analytics select error:', selectError);
        return;
      }

      if (existing) {
        // Обновляем существующую запись
        const { error: updateError } = await supabase
          .from('analytics')
          .update({ 
            visits: existing.visits + 1,
            uniquevisitors: existing.uniquevisitors + 1 
          })
          .eq('id', existing.id);
        
        if (updateError) console.warn('Analytics update error:', updateError);
      } else {
        // Создаём новую запись
        const { error: insertError } = await supabase
          .from('analytics')
          .insert([{
            id: Date.now().toString(),
            date: today,
            visits: 1,
            uniquevisitors: 1,
            createdat: new Date().toISOString()
          }]);
        
        if (insertError) console.warn('Analytics insert error:', insertError);
      }
    } catch (error) {
      console.warn('Error tracking visit:', error);
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
      
      // Преобразуем lowercase поля в camelCase
      const analytics = (data || []).map((a: any) => ({
        ...a,
        uniqueVisitors: a.uniquevisitors,
        createdAt: a.createdat
      }));
      
      return analytics;
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
      
      // Преобразуем lowercase поля в camelCase
      const analytics = (data || []).map((a: any) => ({
        ...a,
        uniqueVisitors: a.uniquevisitors,
        createdAt: a.createdat
      }));
      
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }
};

// Экспортируем как firebaseApi для совместимости
export const firebaseApi = supabaseApi;
