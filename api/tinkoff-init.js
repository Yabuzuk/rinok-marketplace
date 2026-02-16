import crypto from 'crypto';

const TERMINAL_KEY = '1771142972317';
const PASSWORD = 'c*FXLaGF!&4Kn^8*';
const API_URL = 'https://securepay.tinkoff.ru/v2';

function generateToken(params) {
  const { Receipt, DATA, ...tokenParams } = params;
  const allParams = { ...tokenParams, Password: PASSWORD };
  const sortedKeys = Object.keys(allParams).sort();
  const values = sortedKeys.map(key => allParams[key]).join('');
  
  return crypto.createHash('sha256').update(values).digest('hex');
}

export default async function handler(req, res) {
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
    const { orderId, amount, description, customerEmail, origin } = req.body;
    
    if (!orderId || !amount || !description || !origin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const params = {
      TerminalKey: TERMINAL_KEY,
      Amount: Math.round(amount * 100),
      OrderId: orderId,
      Description: description,
      SuccessURL: `${origin}/customer-dashboard?payment=success&orderId=${orderId}`,
      FailURL: `${origin}/customer-dashboard?payment=fail&orderId=${orderId}`
    };
    
    const token = generateToken(params);
    
    const requestBody = {
      ...params,
      Receipt: {
        Email: customerEmail || 'noreply@rinok.ru',
        Phone: '+79139492570',
        Taxation: 'usn_income',
        Items: [{
          Name: description,
          Price: Math.round(amount * 100),
          Quantity: 1.00,
          Amount: Math.round(amount * 100),
          Tax: 'none',
          PaymentMethod: 'full_payment',
          PaymentObject: 'service'
        }]
      },
      Token: token
    };
    
    const response = await fetch(`${API_URL}/Init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (!data.Success) {
      return res.status(400).json({ error: data.Message || 'Payment init failed' });
    }
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Init payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}
