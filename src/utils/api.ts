const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://rinok-server.onrender.com' 
  : 'http://localhost:3001/api';

export const api = {
  // Products
  getProducts: async () => {
    const response = await fetch(`${API_BASE}/api/products`);
    return response.json();
  },

  createProduct: async (product: any) => {
    const response = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return response.json();
  },

  updateProduct: async (productId: string, updates: any) => {
    const response = await fetch(`${API_BASE}/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  deleteProduct: async (productId: string) => {
    const response = await fetch(`${API_BASE}/api/products/${productId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Orders
  getOrders: async () => {
    const response = await fetch(`${API_BASE}/api/orders`);
    return response.json();
  },

  createOrder: async (order: any) => {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE}/api/users`);
    return response.json();
  },

  createUser: async (user: any) => {
    const response = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return response.json();
  },

  // Upload image to Telegram and get URL
  uploadImageToTelegram: async (file: File): Promise<string> => {
    try {
      const BOT_TOKEN = '7991123999:AAFsFnrAfySNgR3k2QRytrZr7FNh4_xd_Tg';
      const CHAT_ID = '-1003087106966';
      
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', file);
      
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.ok) {
        const fileId = result.result.photo[result.result.photo.length - 1].file_id;
        
        // Получаем прямую ссылку на файл
        const fileResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
        const fileResult = await fileResponse.json();
        
        if (fileResult.ok) {
          return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileResult.result.file_path}`;
        }
      }
      
      throw new Error('Ошибка загрузки в Telegram');
    } catch (error) {
      console.error('Telegram upload error:', error);
      // Fallback к base64
      return api.convertImageToBase64(file);
    }
  },

  // Convert image to base64 for local storage (fallback)
  convertImageToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};