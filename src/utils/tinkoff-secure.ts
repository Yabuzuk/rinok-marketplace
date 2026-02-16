// Безопасный клиентский API для Тинькофф (без пароля)
const VERCEL_API = 'https://rinok.vercel.app/api';

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

// Инициализация платежа через backend
export const initPayment = async (
  orderId: string,
  amount: number,
  description: string,
  customerEmail?: string
): Promise<TinkoffInitResponse> => {
  try {
    const response = await fetch(`${VERCEL_API}/tinkoff-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount,
        description,
        customerEmail,
        origin: window.location.origin
      })
    });

    const data = await response.json();
    
    if (!response.ok || !data.Success) {
      throw new Error(data.error || data.Message || 'Ошибка инициализации платежа');
    }

    return data;
  } catch (error) {
    console.error('Ошибка Тинькофф API:', error);
    throw error;
  }
};

// Хелпер для создания уникального ID заказа
export const createUniqueOrderId = (orderId: string): string => {
  // Проверяем, не создавали ли мы уже ID для этого заказа
  const storageKey = `payment_${orderId}`;
  const existing = sessionStorage.getItem(storageKey);
  
  if (existing) {
    return existing;
  }
  
  const uniqueId = `${orderId}_${Date.now()}`;
  sessionStorage.setItem(storageKey, uniqueId);
  return uniqueId;
};

// Очистка после успешной оплаты
export const clearPaymentSession = (orderId: string) => {
  sessionStorage.removeItem(`payment_${orderId}`);
  localStorage.removeItem('lastPaymentId');
  localStorage.removeItem('lastOrderId');
};
