export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin' | 'courier' | 'manager';
  roles?: ('customer' | 'seller' | 'admin' | 'courier' | 'manager')[];
  avatar?: string;
  inn?: string;
  pavilionNumber?: string;
  blocked?: boolean;
  phone?: string;
  vehicle?: 'car' | 'bike' | 'foot';
  rating?: number;
  isActive?: boolean;
  sellerActive?: boolean;
  addresses?: string[];
  companyName?: string;
  paymentInfo?: string;
  bankName?: string;
  password?: string;
  // Новые поля для оплаты
  cardHolderName?: string;
  cardPhone?: string;
  // Реквизиты для оплаты
  bankCard?: string;
  cardHolder?: string;
  sbpPhone?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sellerId: string;
  pavilionNumber: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
  minOrderQuantity: number;
  internalCode?: string; // Служебный номер для продавца
}

export interface PaymentInfo {
  status: 'pending' | 'paid';
  amount: number;
  receiptUrl?: string;
  receiptFileName?: string;
  paidAt?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'seller_editing' | 'customer_approval' | 'manager_pricing' | 'payment_pending' | 'paid' | 'products_paid' | 'delivery_pending' | 'collecting' | 'ready' | 'in_delivery' | 'delivering' | 'delivered' | 'cancelled';
  deliveryPrice?: number;
  managerId?: string;
  createdAt: Date;
  deliveryAddress: string;
  pavilionNumber?: string;
  courierId?: string;
  // Новые поля для групповой доставки
  deliveryType?: DeliveryType;
  groupOrderId?: string;
  deliveryPoolId?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  deliveryPaymentDeadline?: string;
  // Новые поля для редактирования
  isModified?: boolean;
  modificationReason?: string;
  originalTotal?: number;
  customerApproved?: boolean;
  modifiedAt?: string;
  // Новая система оплат с чеками (двухэтапная)
  payments?: {
    [pavilionNumber: string]: PaymentInfo;
  } & {
    products?: PaymentInfo;
    delivery?: PaymentInfo;
  };
  // Статус сборки по павильонам
  collectingStatus?: {
    [pavilionNumber: string]: 'pending' | 'ready';
  };
  // Группировка по павильонам
  pavilionGroups?: PavilionGroup[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  internalCode?: string; // Служебный номер товара
}

export interface ExtendedOrder extends Order {
  customerName: string;
}

export interface PavilionGroup {
  pavilionNumber: string;
  items: OrderItem[];
  total: number;
  sellerId?: string;
  paymentStatus: 'pending' | 'paid';
  collectionStatus: 'pending' | 'ready';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  courierId?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: string;
  actualTime?: string;
  deliveryFee: number;
  customerPhone: string;
  notes?: string;
}

// ============================================
// НОВЫЕ ТИПЫ ДЛЯ ГРУППОВЫХ ЗАКАЗОВ
// ============================================

// Типы доставки
export type DeliveryType = 'individual' | 'auto_group' | 'neighbor_group';

// Временные слоты доставки
export const DELIVERY_TIME_SLOTS = [
  { id: '11-13', label: '11:00-13:00', closeTime: '12:30' },
  { id: '13-15', label: '13:00-15:00', closeTime: '14:30' },
  { id: '15-17', label: '15:00-17:00', closeTime: '16:30' }
] as const;

// Даты доставки
export type DeliveryDate = 'today' | 'tomorrow' | 'dayAfterTomorrow';

// Пул доставки
export interface DeliveryPool {
  id: string; // 'pool_2024-01-15_13-15'
  date: string; // '2024-01-15'
  timeSlot: string; // '13-15'
  closeTime: string; // '2024-01-15T14:30:00'
  status: 'open' | 'closed';
  orders: string[]; // массив ID заказов
  groupOrders: string[]; // массив ID совместных заказов
}

// Участник совместного заказа
export interface GroupOrderParticipant {
  userId: string;
  userName: string;
  userEmail?: string;
  items: OrderItem[];
  productsTotal: number;
  productsPaid: boolean;
  productsPaidAt?: string;
  deliveryShare: number;
  deliveryPaid: boolean;
  deliveryPaidAt?: string;
  deliveryPaymentDeadline?: string;
}

// Совместный заказ
export interface GroupOrder {
  id: string;
  code: string; // 'SOSEDI-A7K9'
  organizerId: string;
  organizerName: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryPoolId: string;
  status: 'waiting_participants' | 'products_paid' | 'delivery_calculated' | 'paid' | 'ready' | 'in_delivery' | 'delivered' | 'cancelled';
  participants: GroupOrderParticipant[];
  deliveryCost?: number;
  deliveryCostCalculatedAt?: string;
  createdAt: string;
  closedAt?: string;
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Получить доступные даты доставки
export const getAvailableDeliveryDates = (): { value: DeliveryDate; label: string; date: string }[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  return [
    { value: 'today', label: 'Сегодня', date: today.toISOString().split('T')[0] },
    { value: 'tomorrow', label: 'Завтра', date: tomorrow.toISOString().split('T')[0] },
    { value: 'dayAfterTomorrow', label: 'Послезавтра', date: dayAfter.toISOString().split('T')[0] }
  ];
};

// Проверить доступность временного слота
export const isTimeSlotAvailable = (date: string, timeSlotId: string): boolean => {
  const slot = DELIVERY_TIME_SLOTS.find(s => s.id === timeSlotId);
  if (!slot) return false;

  const now = new Date();
  const closeDateTime = new Date(`${date}T${slot.closeTime}:00`);
  
  return now < closeDateTime;
};

// Создать ID пула
export const createPoolId = (date: string, timeSlotId: string): string => {
  return `pool_${date}_${timeSlotId}`;
};