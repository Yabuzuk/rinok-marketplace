import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import MongoDB from './mongoDB.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
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

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAll('users');
    res.json(users);
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Telegram DB integration active');
});