import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import Cart from './components/Cart';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './pages/HomePage';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourierDashboard from './pages/CourierDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import PavilionPage from './pages/PavilionPage';
import OrdersPage from './pages/OrdersPage';
import LegalPage from './pages/LegalPage';
import { User, Product, CartItem, Order, Delivery } from './types';


import { supabaseApi } from './utils/supabaseApi';
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
  const [skipNextReload, setSkipNextReload] = useState(false);

  useEffect(() => {
    loadData();
    
    // Периодическая перезагрузка данных каждые 5 секунд
    const interval = setInterval(() => {
      if (skipNextReload) {
        setSkipNextReload(false);
        return;
      }
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
        supabaseApi.getProducts(),
        supabaseApi.getOrders(),
        supabaseApi.getUsers()
      ]);
      
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);
      
      setDeliveries([]);
      
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

  const handleLogin = async (userType: 'customer' | 'seller' | 'admin' | 'courier' | 'manager', userData?: any) => {
    let user;
    if (userData) {
      if (userData.isAdmin) {
        // Логика администратора - обходим проверку базы данных
        user = userData;
        console.log('Admin login successful:', user.id);
      } else if (userData.isLogin) {
        // Логика входа - только проверка существующего пользователя
        try {
          const existingUser = await supabaseApi.findUserByEmail(userData.email);
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
          const existingUser = await supabaseApi.findUserByEmail(userData.email);
          if (existingUser) {
            alert('Пользователь с таким email уже существует.');
            return;
          }
          
          // Проверяем уникальность номера павильона для продавцов
          if (userType === 'seller' && userData.pavilionNumber) {
            const existingPavilion = users.find(u => 
              u.pavilionNumber === userData.pavilionNumber && u.role === 'seller'
            );
            if (existingPavilion) {
              alert(`Павильон ${userData.pavilionNumber} уже занят другим продавцом.`);
              return;
            }
          }
          
          user = { 
            ...userData, 
            role: userType,
            id: userData.id || Date.now().toString(),
            pavilionNumber: userData.pavilionNumber || ''
          };
          
          await supabaseApi.createUser(user);
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
    const minQuantity = product.minOrderQuantity || 1;
    const addQuantity = Math.max(quantity, minQuantity);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + addQuantity }
            : item
        );
      } else {
        newCart = [...prevCart, { product, quantity: addQuantity }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await supabaseApi.updateProduct(productId, updates);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...updates, id: productId } : p
      ));
      setSkipNextReload(true); // Пропускаем следующую автоперезагрузку
      console.log('Product updated on server:', productId, 'Response:', updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Ошибка обновления товара');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await supabaseApi.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      console.log('Product deleted from server:', productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка удаления товара');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await supabaseApi.deleteUser(userId);
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
      // Проверяем уникальность номера павильона
      if (updates.pavilionNumber) {
        const existingPavilion = users.find(u => 
          u.pavilionNumber === updates.pavilionNumber && 
          u.role === 'seller' && 
          u.id !== userId
        );
        if (existingPavilion) {
          alert(`Павильон ${updates.pavilionNumber} уже занят другим продавцом.`);
          return;
        }
      }
      
      await supabaseApi.updateUser(userId, updates);
      
      // Обновляем текущего пользователя если это он
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      loadData();
      console.log('User updated:', userId, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ошибка обновления пользователя');
    }
  };

  const handleSwitchRole = (newRole: 'customer' | 'seller' | 'admin' | 'courier' | 'manager') => {
    if (!currentUser) return;
    
    // Добавляем новую роль в список ролей
    const currentRoles = currentUser.roles || [currentUser.role];
    const updatedRoles = currentRoles.includes(newRole) ? currentRoles : [...currentRoles, newRole];
    
    const updatedUser = { 
      ...currentUser, 
      role: newRole,
      roles: updatedRoles
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Обновляем в базе
    handleUpdateUser(currentUser.id, { role: newRole, roles: updatedRoles });
    
    // Если переключаемся на продавца, обновляем запись в базе
    if (newRole === 'seller') {
      handleUpdateUser(currentUser.id, { 
        role: 'seller', 
        roles: updatedRoles,
        sellerActive: true 
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await supabaseApi.updateOrder(orderId, { status });
      
      // Просто обновляем статус заказа - никаких отдельных доставок
      
      // Перезагружаем все данные
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    console.log('Adding product:', newProduct);
    
    // Проверяем наличие номера павильона
    if (!currentUser?.pavilionNumber) {
      alert('Для добавления товаров необходимо указать номер павильона в настройках');
      return;
    }
    
    try {
      // Номер павильона и sellerId берем из текущего пользователя
      const productWithPavilion = {
        ...newProduct,
        sellerId: currentUser?.id || '',
        pavilionNumber: currentUser?.pavilionNumber
      };
      
      console.log('Creating product with sellerId:', currentUser?.id, 'pavilionNumber:', currentUser?.pavilionNumber);
      
      const product = await supabaseApi.createProduct(productWithPavilion);
      setProducts(prev => [...prev, product]);
      console.log('Product saved to server:', product.id);
      
    } catch (error) {
      console.error('Server error:', error);
      alert('Ошибка сохранения в базе данных. Проверьте соединение с сервером.');
    }
  };

  const handleCreateOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      const order = await supabaseApi.createOrder(orderData);
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
      const item = prev.find(item => item.product.id === productId);
      const minQuantity = item?.product.minOrderQuantity || 1;
      
      let newCart;
      if (quantity <= 0) {
        newCart = prev.filter(item => item.product.id !== productId);
      } else {
        // Округляем до кратного минимальному количеству
        const adjustedQuantity = Math.max(Math.ceil(quantity / minQuantity) * minQuantity, minQuantity);
        newCart = prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: adjustedQuantity }
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

  const handleDashboardClick = (tab?: string) => {
    if (currentUser) {
      const path = currentUser.role === 'customer' ? '/customer-dashboard' : 
                   currentUser.role === 'seller' ? '/seller-dashboard' : 
                   currentUser.role === 'courier' ? '/courier-dashboard' :
                   currentUser.role === 'manager' ? '/manager-dashboard' :
                   '/admin-dashboard';
      navigate(path);
      
      // Переключаем вкладки для разных ролей
      if (tab) {
        setTimeout(() => {
          const eventName = `switch${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}Tab`;
          window.dispatchEvent(new CustomEvent(eventName, { detail: tab }));
        }, 100);
      }
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="App" style={{ background: '#F6F9FC', minHeight: '100vh' }}>

        <Header 
          user={currentUser}
          cartItemsCount={cartItemsCount}
          onAuthClick={handleAuthClick}
          onCartClick={() => setIsCartOpen(true)}
          onLogin={handleLogin}
          onShowAuthModal={() => setShowAuthModal(true)}
          onDashboardClick={handleDashboardClick}
          onHomeClick={handleHomeClick}
          products={products}
          onProductSelect={(product) => {
            handleAddToCart(product, 1);
            setIsCartOpen(true);
          }}
        />
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />

        <main style={{ paddingBottom: '80px' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                animation: 'bounce 2s infinite'
              }}>
                📦
              </div>
              <div style={{
                width: '200px',
                height: '20px',
                background: '#8B4513',
                borderRadius: '10px',
                position: 'relative',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  fontSize: '24px',
                  animation: 'slideIn 3s infinite'
                }}>🍎</div>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '60px',
                  fontSize: '24px',
                  animation: 'slideIn 3s infinite 0.5s'
                }}>🥕</div>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '100px',
                  fontSize: '24px',
                  animation: 'slideIn 3s infinite 1s'
                }}>🥬</div>
              </div>
              <div style={{
                marginTop: '20px',
                fontSize: '16px',
                color: '#666'
              }}>
                Формируем каталог товаров...
              </div>
              <style>{`
                @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                  40% { transform: translateY(-10px); }
                  60% { transform: translateY(-5px); }
                }
                @keyframes slideIn {
                  0% { opacity: 0; transform: translateX(-20px); }
                  50% { opacity: 1; transform: translateX(0); }
                  100% { opacity: 1; transform: translateX(0); }
                }
              `}</style>
            </div>
          ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  products={products}
                  onAddToCart={handleAddToCart}
                  users={users}
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
              path="/orders" 
              element={
                currentUser ? (
                  <OrdersPage 
                    user={currentUser}
                    orders={orders}
                    onCancelOrder={async (orderId) => {
                      try {
                        await supabaseApi.updateOrder(orderId, { status: 'cancelled' });
                        loadData();
                        alert('Заказ отменен');
                      } catch (error) {
                        console.error('Error cancelling order:', error);
                        alert('Ошибка отмены заказа');
                      }
                    }}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/customer-dashboard" 
              element={
                currentUser?.role === 'customer' ? (
                  <CustomerDashboard 
                    user={currentUser}
                    orders={orders}
                    onUpdateProfile={async (updates) => {
                      try {
                        await supabaseApi.updateUser(currentUser.id, updates);
                        const updatedUser = { ...currentUser, ...updates };
                        setCurrentUser(updatedUser);
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                      } catch (error) {
                        console.error('Error updating user profile:', error);
                        alert('Ошибка сохранения адреса');
                      }
                    }}
                    onSwitchRole={handleSwitchRole}
                    onLogout={() => setCurrentUser(null)}
                    onCancelOrder={async (orderId) => {
                      try {
                        await supabaseApi.updateOrder(orderId, { status: 'cancelled' });
                        loadData();
                        alert('Заказ отменен');
                      } catch (error) {
                        console.error('Error cancelling order:', error);
                        alert('Ошибка отмены заказа');
                      }
                    }}
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
                    onUpdateUser={handleUpdateUser}
                    onSwitchRole={handleSwitchRole}
                    onLogout={() => setCurrentUser(null)}
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
                        await supabaseApi.updateOrder(orderId, { courierId: currentUser.id, status: 'delivering' });
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
                    onSwitchRole={handleSwitchRole}
                    onLogout={() => setCurrentUser(null)}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/manager-dashboard" 
              element={
                currentUser?.role === 'manager' ? (
                  <ManagerDashboard 
                    user={currentUser}
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateOrder={async (orderId, updates) => {
                      try {
                        console.log('Updating order:', orderId, 'with updates:', updates);
                        await supabaseApi.updateOrder(orderId, updates);
                        loadData();
                      } catch (error) {
                        console.error('Error updating order:', error);
                        console.error('Full error details:', error);
                      }
                    }}
                    onSwitchRole={handleSwitchRole}
                    onLogout={() => setCurrentUser(null)}
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
                    onLogout={() => setCurrentUser(null)}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route path="/legal" element={<LegalPage />} />
          </Routes>
          )}
        </main>

        <Footer />
        <CookieConsent />

        <Cart 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          user={currentUser}
          onUpdateQuantity={handleUpdateCartQuantity}
          onCreateOrder={handleCreateOrder}
        />

        <BottomNavigation
          user={currentUser}
          cartItemsCount={cartItemsCount}
          onHomeClick={handleHomeClick}
          onSearchClick={() => {
            if (currentUser) {
              // Фокус на поле поиска в хедере
              const searchInput = document.querySelector('input[placeholder="Найти товары"]') as HTMLInputElement;
              searchInput?.focus();
            }
          }}
          onCartClick={() => setIsCartOpen(true)}
          onDashboardClick={handleDashboardClick}
          onOrdersClick={() => {
            if (currentUser) {
              navigate('/orders');
            }
          }}
          onWarehouseClick={() => {
            if (currentUser?.role === 'seller') {
              navigate('/seller-dashboard');
              // Устанавливаем вкладку склад через URL параметр
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('setWarehouseTab'));
              }, 100);
            }
          }}
          onPavilionSelect={(pavilionNumber) => navigate(`/pavilion/${pavilionNumber}`)}
          pavilions={Array.from(new Set(products.filter(p => p.pavilionNumber).map(p => p.pavilionNumber))).sort()}
          onAuthClick={() => setShowAuthModal(true)}
        />
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