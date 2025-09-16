const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://rinok-server.onrender.com/api'
  : 'http://localhost:3001/api';

export const api = {
  // Products
  getProducts: async () => {
    const response = await fetch(`${API_BASE}/products`);
    return response.json();
  },

  createProduct: async (product: any) => {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return response.json();
  },

  // Orders
  getOrders: async () => {
    const response = await fetch(`${API_BASE}/orders`);
    return response.json();
  },

  createOrder: async (order: any) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE}/users`);
    return response.json();
  },

  createUser: async (user: any) => {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return response.json();
  }
};