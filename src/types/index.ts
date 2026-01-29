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
  status: 'pending' | 'confirmed' | 'seller_editing' | 'customer_approval' | 'manager_pricing' | 'payment_pending' | 'paid' | 'collecting' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  deliveryPrice?: number;
  managerId?: string;
  createdAt: Date;
  deliveryAddress: string;
  pavilionNumber?: string;
  courierId?: string;
  // Новые поля для редактирования
  isModified?: boolean;
  modificationReason?: string;
  originalTotal?: number;
  customerApproved?: boolean;
  modifiedAt?: string;
  // Новая система оплат с чеками
  payments?: {
    [pavilionNumber: string]: PaymentInfo;
  } & {
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