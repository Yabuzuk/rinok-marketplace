import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Инициализация Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = getFirestore();

// Тинькофф данные
const TERMINAL_KEY = '1771142972317';
const PASSWORD = 'c*FXLaGF!&4Kn^8*';

// Проверка токена от Тинькофф
function verifyToken(params) {
  const { Token, ...otherParams } = params;
  const allParams = { ...otherParams, Password: PASSWORD };
  const sortedKeys = Object.keys(allParams).sort();
  const values = sortedKeys.map(key => allParams[key]).join('');
  
  const hash = crypto
    .createHash('sha256')
    .update(values)
    .digest('hex');
  
  return hash === Token;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    
    console.log('Tinkoff webhook received:', {
      TerminalKey: data.TerminalKey,
      OrderId: data.OrderId,
      Status: data.Status,
      PaymentId: data.PaymentId
    });
    
    // Проверяем токен
    if (!verifyToken(data)) {
      console.error('Invalid token');
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Проверяем терминал
    if (data.TerminalKey !== TERMINAL_KEY) {
      console.error('Invalid terminal');
      return res.status(400).json({ error: 'Invalid terminal' });
    }
    
    // Извлекаем ID заказа (убираем timestamp)
    const orderId = data.OrderId.split('_')[0];
    
    console.log('Processing order:', orderId, 'Status:', data.Status);
    
    // Обновляем статус заказа в Firestore
    if (data.Status === 'CONFIRMED') {
      await db.collection('orders').doc(orderId).update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        paymentId: data.PaymentId,
        tinkoffStatus: data.Status
      });
      
      console.log('✅ Order updated:', orderId);
    } else if (data.Status === 'REJECTED' || data.Status === 'CANCELED') {
      await db.collection('orders').doc(orderId).update({
        tinkoffStatus: data.Status
      });
      
      console.log('⚠️ Payment failed:', orderId, data.Status);
    }
    
    // Тинькофф ожидает ответ "OK"
    return res.status(200).send('OK');
    
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
