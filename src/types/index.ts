export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin' | 'courier';
  avatar?: string;
  inn?: string;
  pavilionNumber?: string;
  blocked?: boolean;
  phone?: string;
  vehicle?: 'car' | 'bike' | 'foot';
  rating?: number;
  isActive?: boolean;
  addresses?: string[];
  companyName?: string;
  paymentInfo?: string;
  bankName?: string;
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

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: Date;
  deliveryAddress: string;
  pavilionNumber?: string;
  courierId?: string;
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