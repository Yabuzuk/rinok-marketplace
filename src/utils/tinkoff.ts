// Тинькофф Эквайринг API
const TERMINAL_KEY = '1771142972317';
const PASSWORD = 'c*FXLaGF!&4Kn^8*';
const API_URL = 'https://securepay.tinkoff.ru/v2';

// Единые реквизиты для всех платежей
export const PAYMENT_DETAILS = {
  cardNumber: '2200 7015 2530 7184',
  cardHolderName: 'Хохлов Илья Олегович',
  phone: '+7 913 949-25-70',
  phoneRaw: '79139492570',
  bankName: 'Т-Банк'
};

interface TinkoffInitResponse {
  Success: boolean;
  ErrorCode?: string;
  Message?: string;
  TerminalKey: string;
  Amount: number;
  OrderId: string;
  PaymentId: string;
  PaymentURL: string;
}

interface TinkoffStatusResponse {
  Success: boolean;
  ErrorCode?: string;
  Status: string;
  PaymentId: string;
  OrderId: string;
}

// Генерация токена для Тинькофф
const generateToken = async (params: any): Promise<string> => {
  // Исключаем сложные объекты из токена
  const { Receipt, DATA, ...tokenParams } = params;
  const allParams = { ...tokenParams, Password: PASSWORD };
  const sortedKeys = Object.keys(allParams).sort();
  const values = sortedKeys.map(key => allParams[key]).join('');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(values);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

// Инициализация платежа
export const initPayment = async (
  orderId: string,
  amount: number,
  description: string,
  customerEmail?: string,
  payType?: 'O' | 'T' // O - все способы, T - только СБП
): Promise<TinkoffInitResponse> => {
  try {
    const params: any = {
      TerminalKey: TERMINAL_KEY,
      Amount: amount * 100,
      OrderId: orderId,
      Description: description,
      SuccessURL: `${window.location.origin}/customer-dashboard?payment=success&orderId=${orderId}&closeIframe=true`,
      FailURL: `${window.location.origin}/customer-dashboard?payment=fail&orderId=${orderId}`
    };
    
    const token = await generateToken(params);
    
    const requestBody: any = {
      ...params,
      Receipt: {
        Email: customerEmail || 'noreply@rinok.ru',
        Phone: '+79139492570',
        Taxation: 'usn_income',
        Items: [{
          Name: description,
          Price: amount * 100,
          Quantity: 1.00,
          Amount: amount * 100,
          Tax: 'none',
          PaymentMethod: 'full_payment',
          PaymentObject: 'service'
        }]
      },
      Token: token
    };
    
    console.log('Tinkoff Init Request with PayType:', {
      ...requestBody,
      PayType: payType || 'not set'
    });
    
    const response = await fetch(`${API_URL}/Init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log('Tinkoff Init Response:', data);
    
    if (!data.Success) {
      throw new Error(data.Message || 'Ошибка инициализации платежа');
    }

    return data;
  } catch (error) {
    console.error('Ошибка Тинькофф API:', error);
    throw error;
  }
};

// Отмена платежа
export const cancelPayment = async (paymentId: string): Promise<any> => {
  try {
    const params = {
      TerminalKey: TERMINAL_KEY,
      PaymentId: paymentId
    };
    
    const token = await generateToken(params);
    
    const response = await fetch(`${API_URL}/Cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        Token: token
      }),
    });

    const data = await response.json();
    
    if (!data.Success) {
      throw new Error(data.Message || 'Ошибка отмены платежа');
    }

    return data;
  } catch (error) {
    console.error('Ошибка отмены платежа:', error);
    throw error;
  }
};

// Проверка статуса платежа
export const checkPaymentStatus = async (paymentId: string): Promise<TinkoffStatusResponse> => {
  try {
    const params = {
      TerminalKey: TERMINAL_KEY,
      PaymentId: paymentId
    };
    
    const token = await generateToken(params);
    
    const response = await fetch(`${API_URL}/GetState`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        Token: token
      }),
    });

    const data = await response.json();
    
    console.log('GetState response:', data);
    
    if (!data.Success) {
      console.warn('GetState не успешен:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка проверки статуса:', error);
    throw error;
  }
};

// Открыть форму оплаты
export const openPaymentForm = (paymentUrl: string) => {
  window.open(paymentUrl, '_blank', 'width=600,height=800');
};
