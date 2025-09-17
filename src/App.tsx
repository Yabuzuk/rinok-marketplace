import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import EmojiBackground from './components/EmojiBackground';
import Cart from './components/Cart';
import HomePage from './pages/HomePage';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourierDashboard from './pages/CourierDashboard';
import PavilionPage from './pages/PavilionPage';
import { User, Product, CartItem, Order, Delivery } from './types';

import { api } from './utils/api';
import './styles/globals.css';



const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadData();
    
    // Периодическая перезагрузка данных каждые 5 секунд
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Не перезагружаем данные при смене пользователя
  // useEffect(() => {
  //   if (currentUser && !loading) {
  //     console.log('User changed, reloading data for:', currentUser.name);
  //     loadData();
  //   }
  // }, [currentUser?.id]);



  const loadData = async () => {
    try {
      const [productsData, ordersData, usersData] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getUsers()
      ]);
      
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);
      
      // Загружаем доставки отдельно
      try {
        const deliveriesData = await api.getDeliveries();
        setDeliveries(deliveriesData || []);
        console.log('Loaded deliveries:', deliveriesData?.length || 0);
      } catch (error) {
        console.log('Deliveries API not available yet, using empty array');
        setDeliveries([]);
      }
      
      console.log('Loaded from server:', productsData?.length || 0, 'products,', usersData?.length || 0, 'users,', ordersData?.length || 0, 'orders');
      console.log('Products data:', productsData);
    } catch (error) {
      console.error('Error loading data from server:', error);
      setProducts([]);
      setOrders([]);
      setUsers([]);
      setDeliveries([]);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userType: 'customer' | 'seller' | 'admin' | 'courier', userData?: any) => {
    let user;
    if (userData) {
      if (userData.isAdmin) {
        // Логика администратора - обходим проверку базы данных
        user = userData;
        console.log('Admin login successful:', user.id);
      } else if (userData.isLogin) {
        // Логика входа - только проверка существующего пользователя
        try {
          const existingUser = await api.findUserByEmail(userData.email);
          if (existingUser) {
            if (existingUser.blocked) {
              alert('Ваш аккаунт заблокирован администратором');
              return;
            }
            user = existingUser;
            console.log('Login successful:', user.id);
          } else {
            alert('Пользователь не найден. Пожалуйста, зарегистрируйтесь.');
            return;
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('Ошибка входа. Попробуйте позже.');
          return;
        }
      } else {
        // Логика регистрации - создаем нового пользователя
        try {
          const existingUser = await api.findUserByEmail(userData.email);
          if (existingUser) {
            alert('Пользователь с таким email уже существует.');
            return;
          }
          
          user = { 
            ...userData, 
            role: userType,
            type: userType,
            id: userData.id || Date.now().toString(),
            pavilionNumber: userData.pavilionNumber || ''
          };
          
          await api.createUser(user);
          console.log('Registration successful:', user.id);
        } catch (error) {
          console.error('Registration error:', error);
          alert('Ошибка регистрации. Попробуйте позже.');
          return;
        }
      }
    } else {
      // Для тестов создаем тестового пользователя
      user = {
        id: `test_${userType}_${Date.now()}`,
        name: userType === 'customer' ? 'Тестовый покупатель' : 
              userType === 'seller' ? 'Тестовый продавец' : 'Администратор',
        email: `${userType}@test.com`,
        role: userType,
        pavilionNumber: userType === 'seller' ? `${Math.floor(Math.random() * 50)}A` : undefined
      };
    }
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { product, quantity }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await api.updateProduct(productId, updates);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      ));
      console.log('Product updated on server:', productId);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Ошибка обновления товара');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      console.log('Product deleted from server:', productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка удаления товара');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      // Перезагружаем данные чтобы обновить список пользователей
      loadData();
      console.log('User deleted from server:', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка удаления пользователя');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await api.updateUser(userId, updates);
      loadData();
      console.log('User updated:', userId, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ошибка обновления пользователя');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.updateOrder(orderId, { status });
      
      // Просто обновляем статус заказа - никаких отдельных доставок
      
      // Перезагружаем все данные
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    console.log('Adding product:', newProduct);
    
    try {
      // Номер павильона и sellerId берем из текущего пользователя
      const productWithPavilion = {
        ...newProduct,
        sellerId: String(currentUser?.id),
        pavilionNumber: currentUser?.pavilionNumber || ''
      };
      
      const product = await api.createProduct(productWithPavilion);
      setProducts(prev => [...prev, product]);
      console.log('Product saved to server:', product.id);
      
    } catch (error) {
      console.error('Server error:', error);
      alert('Ошибка сохранения в базе данных. Проверьте соединение с сервером.');
    }
  };

  const handleCreateOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      const order = await api.createOrder(orderData);
      setOrders(prev => [...prev, order]);
      
      // Перезагружаем все данные немедленно
      loadData();
      
      setCart([]);
      localStorage.removeItem('cart');
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => {
      let newCart;
      if (quantity <= 0) {
        newCart = prev.filter(item => item.product.id !== productId);
      } else {
        newCart = prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        );
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAuthClick = () => {
    if (currentUser) {
      handleLogout();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleDashboardClick = () => {
    if (currentUser) {
      const path = currentUser.role === 'customer' ? '/customer-dashboard' : 
                   currentUser.role === 'seller' ? '/seller-dashboard' : 
                   currentUser.role === 'courier' ? '/courier-dashboard' :
                   '/admin-dashboard';
      navigate(path);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="App">
        <EmojiBackground />
        <Header 
          user={currentUser}
          cartItemsCount={cartItemsCount}
          onAuthClick={handleAuthClick}
          onCartClick={() => setIsCartOpen(true)}
          onLogin={handleLogin}
          onShowAuthModal={() => setShowAuthModal(true)}
          onDashboardClick={handleDashboardClick}
          onHomeClick={handleHomeClick}
        />
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />

        <main>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
              fontSize: '18px'
            }}>
              Формируем каталог товаров...
            </div>
          ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  products={products}
                  onAddToCart={handleAddToCart}
                  users={[]}
                />
              } 
            />
            
            <Route 
              path="/pavilion/:pavilionNumber" 
              element={
                <PavilionPage 
                  products={products}
                  users={users}
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            
            <Route 
              path="/customer-dashboard" 
              element={
                currentUser?.role === 'customer' ? (
                  <CustomerDashboard 
                    user={currentUser}
                    orders={orders}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/seller-dashboard" 
              element={
                currentUser?.role === 'seller' ? (
                  <SellerDashboard 
                    user={currentUser}
                    products={products}
                    orders={orders}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onCreateOrder={handleCreateOrder}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/courier-dashboard" 
              element={
                currentUser?.role === 'courier' ? (
                  <CourierDashboard 
                    orders={orders}
                    courier={currentUser}
                    onAcceptOrder={async (orderId) => {
                      try {
                        await api.updateOrder(orderId, { courierId: currentUser.id, status: 'delivering' });
                        loadData();
                      } catch (error) {
                        console.error('Error accepting order:', error);
                      }
                    }}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateProfile={(updates) => {
                      const updatedUser = { ...currentUser, ...updates };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    }}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/admin-dashboard" 
              element={
                currentUser?.role === 'admin' ? (
                  <AdminDashboard 
                    orders={orders.map(order => ({
                      ...order,
                      customerName: 'Покупатель'
                    }))}
                    products={products}
                    users={users}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onDeleteUser={handleDeleteUser}
                    onUpdateUser={handleUpdateUser}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
          )}
        </main>

        <Cart 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          user={currentUser}
          onUpdateQuantity={handleUpdateCartQuantity}
          onCreateOrder={handleCreateOrder}
        />



        {/* Logout button */}
        {currentUser && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              Выйти
            </button>
          </div>
        )}


    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;