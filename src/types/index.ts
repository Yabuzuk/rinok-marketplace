export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller';
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sellerId: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
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
  quantity: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}