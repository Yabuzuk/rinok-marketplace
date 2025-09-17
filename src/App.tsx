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
    // Добавляем демо-доставки
    setDeliveries([
      {
        id: '1',
        orderId: 'order_001',
        status: 'pending',
        pickupAddress: 'Павильон 15А, Центральный рынок',
        deliveryAddress: 'ул. Ленина, 25, кв. 10',
        estimatedTime: '30-45 мин',
        deliveryFee: 150,
        customerPhone: '+7 (999) 123-45-67',
        notes: 'Домофон не работает, звонить по телефону'
      },
      {
        id: '2',
        orderId: 'order_002',
        status: 'pending',
        pickupAddress: 'Павильон 8Б, Центральный рынок',
        deliveryAddress: 'пр. Мира, 15, офис 205',
        estimatedTime: '20-30 мин',
        deliveryFee: 120,
        customerPhone: '+7 (999) 987-65-43'
      },
      {
        id: '3',
        orderId: 'order_003',
        courierId: '4',
        status: 'delivered',
        pickupAddress: 'Павильон 3В, Центральный рынок',
        deliveryAddress: 'ул. Садовая, 8, кв. 15',
        estimatedTime: '25-35 мин',
        actualTime: new Date().toISOString(),
        deliveryFee: 180,
        customerPhone: '+7 (999) 555-12-34'
      }
    ]);
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
      
      console.log('Loaded from server:', productsData?.length || 0, 'products,', usersData?.length || 0, 'users,', ordersData?.length || 0, 'orders');
      console.log('Users data:', usersData);
    } catch (error) {
      console.error('Error loading data from server:', error);
      // Только пустые массивы, никаких моковых данных
      setProducts([]);
      setOrders([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userType: 'customer' | 'seller' | 'admin', userData?: any) => {
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
                    deliveries={deliveries}
                    courier={currentUser}
                    onAcceptDelivery={(deliveryId) => {
                      setDeliveries(prev => prev.map(d => 
                        d.id === deliveryId ? { ...d, courierId: currentUser.id, status: 'assigned' } : d
                      ));
                    }}
                    onUpdateDeliveryStatus={(deliveryId, status) => {
                      setDeliveries(prev => prev.map(d => 
                        d.id === deliveryId ? { ...d, status } : d
                      ));
                    }}
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



        {/* Demo and Logout buttons */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000
        }}>
          {!currentUser && (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => handleLogin('customer', { id: '1', name: 'Покупатель', email: 'customer@example.com', role: 'customer' })}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                🛍️ Войти как покупатель
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleLogin('seller', { id: '2', name: 'Продавец', email: 'seller@example.com', role: 'seller', pavilionNumber: '15' })}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                🏢 Войти как продавец
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleLogin('courier', { id: '4', name: 'Курьер', email: 'courier@example.com', role: 'courier', phone: '+7 (999) 123-45-67', vehicle: 'car', rating: 4.8, isActive: true })}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                🚚 Войти как курьер
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleLogin('admin', { id: '3', name: 'Администратор', email: 'admin@example.com', role: 'admin' })}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                ⚙️ Войти как админ
              </button>
            </>
          )}
          
          {currentUser && (
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              Выйти
            </button>
          )}
        </div>


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