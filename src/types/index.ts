export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
  inn?: string;
  pavilionNumber?: string;
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