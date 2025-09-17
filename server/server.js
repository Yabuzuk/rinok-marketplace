import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import MongoDB from './mongoDB.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://rinok-frontend.onrender.com',
    'http://localhost:3000',
    'https://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const db = new MongoDB(
  process.env.MONGODB_URI || 'mongodb://rinok_anywherehe:423c7d67d4e91c8b370846e868153e8be8ddbcf8@e4gb4v.h.filess.io:61004/rinok_anywherehe'
);

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getAll('products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('Creating product:', req.body);
    const product = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const messageId = await db.save('products', product);
    console.log('Product saved with message ID:', messageId);
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    // Для простоты создаем обновленный продукт
    const updatedProduct = {
      ...updates,
      id: productId,
      updatedAt: new Date().toISOString()
    };
    await db.save('products', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const success = await db.delete('products', productId);
    if (success) {
      res.json({ success: true, id: productId });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getAll('orders');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await db.save('orders', order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;
    await db.update('orders', orderId, updates);
    res.json({ success: true, id: orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAll('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const users = await db.getAll('users');
    const user = users.find(u => u.email === req.params.email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await db.save('users', user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const success = await db.delete('users', userId);
    if (success) {
      res.json({ success: true, id: userId });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    await db.update('users', userId, updates);
    res.json({ success: true, id: userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deliveries API
app.get('/api/deliveries', async (req, res) => {
  try {
    const deliveries = await db.getAll('deliveries');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deliveries', async (req, res) => {
  try {
    const delivery = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await db.save('deliveries', delivery);
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deliveries/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const updates = req.body;
    await db.update('deliveries', deliveryId, updates);
    res.json({ success: true, id: deliveryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all data endpoint (for development)
app.delete('/api/clear-all', async (req, res) => {
  try {
    await db.clearAll('products');
    await db.clearAll('orders');
    await db.clearAll('users');
    await db.clearAll('deliveries');
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Telegram DB integration active');
});