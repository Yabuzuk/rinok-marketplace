import { Product, User, Order } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'customer@example.com',
    name: 'Анна Иванова',
    role: 'customer'
  },
  {
    id: '2',
    email: 'seller@example.com',
    name: 'Магазин "Свежесть"',
    role: 'seller'
  },
  {
    id: '3',
    email: 'admin@rinok.com',
    name: 'Администратор',
    role: 'admin'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Яблоки красные',
    price: 120,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
    category: 'fruits',
    sellerId: '2',
    description: 'Свежие красные яблоки, сладкие и сочные',
    stock: 50,
    rating: 4.8,
    reviews: 124,
    minOrderQuantity: 1
  },
  {
    id: '2',
    name: 'Молоко 3.2%',
    price: 85,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
    category: 'dairy',
    sellerId: '2',
    description: 'Натуральное коровье молоко 3.2% жирности',
    stock: 30,
    rating: 4.9,
    reviews: 89,
    minOrderQuantity: 2
  },
  {
    id: '3',
    name: 'Хлеб белый',
    price: 45,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
    category: 'bakery',
    sellerId: '2',
    description: 'Свежий белый хлеб, выпечен сегодня утром',
    stock: 20,
    rating: 4.7,
    reviews: 67,
    minOrderQuantity: 1
  },
  {
    id: '4',
    name: 'Морковь',
    price: 65,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    category: 'vegetables',
    sellerId: '2',
    description: 'Свежая морковь, богатая витаминами',
    stock: 40,
    rating: 4.6,
    reviews: 45,
    minOrderQuantity: 3
  },
  {
    id: '5',
    name: 'Куриная грудка',
    price: 320,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
    category: 'meat',
    sellerId: '2',
    description: 'Свежая куриная грудка без кости',
    stock: 15,
    rating: 4.9,
    reviews: 156,
    minOrderQuantity: 1
  },
  {
    id: '6',
    name: 'Апельсиновый сок',
    price: 95,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop',
    category: 'drinks',
    sellerId: '2',
    description: '100% натуральный апельсиновый сок',
    stock: 25,
    rating: 4.5,
    reviews: 78,
    minOrderQuantity: 1
  },
  {
    id: '7',
    name: 'Бананы',
    price: 110,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
    category: 'fruits',
    sellerId: '2',
    description: 'Спелые желтые бананы',
    stock: 60,
    rating: 4.7,
    reviews: 92,
    minOrderQuantity: 5
  },
  {
    id: '8',
    name: 'Творог 5%',
    price: 125,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop',
    category: 'dairy',
    sellerId: '2',
    description: 'Натуральный творог 5% жирности',
    stock: 18,
    rating: 4.8,
    reviews: 134,
    minOrderQuantity: 1
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    customerId: '1',
    items: [
      { productId: '1', productName: 'Яблоки красные', quantity: 2, price: 120 },
      { productId: '2', productName: 'Молоко 3.2%', quantity: 1, price: 85 }
    ],
    total: 325,
    status: 'delivered',
    createdAt: new Date('2024-01-15'),
    deliveryAddress: 'г. Москва, ул. Примерная, д. 123, кв. 45'
  },
  {
    id: 'order-2',
    customerId: '1',
    items: [
      { productId: '3', productName: 'Хлеб белый', quantity: 1, price: 45 },
      { productId: '4', productName: 'Морковь', quantity: 1, price: 65 }
    ],
    total: 110,
    status: 'delivering',
    createdAt: new Date('2024-01-20'),
    deliveryAddress: 'г. Москва, ул. Примерная, д. 123, кв. 45'
  }
];