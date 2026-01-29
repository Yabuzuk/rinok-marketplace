import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import InstallPWA from './components/InstallPWA';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NotificationButton from './components/NotificationButton';
import useOneSignal from './components/OneSignalProvider';

import CookieConsent from './components/CookieConsent';
import DisclaimerModal from './components/DisclaimerModal';
import Cart from './components/Cart';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './pages/HomePage';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourierDashboard from './pages/CourierDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import PavilionPage from './pages/PavilionPage';
import LegalPage from './pages/LegalPage';
import { User, Product, CartItem, Order, Delivery } from './types';


import { initOneSignal, subscribeUser, sendNotification } from './services/onesignal';
import { sendNotification as sendNotificationUtil } from './utils/notifications';

import { firebaseApi } from './utils/firebaseApi';
import './styles/tailwind.css';



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
    
    // Инициализация OneSignal
    initOneSignal();
    
    // Периодическая перезагрузка данных каждые 10 секунд для мобильных
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // Периодическая перезагрузка данных каждые 30 секунд
    const interval = setInterval(() => {
      if (skipNextReload) {
        setSkipNextReload(false);
        return;
      }
      loadData();
    }, 30000); // 30 секунд для экономии квоты
    
    return () => clearInterval(interval);
  }, []);

  // Подписка пользователя на уведомления при входе
  useEffect(() => {
    if (currentUser?.id && currentUser?.role) {
      // Автоматически запрашиваем разрешение на уведомления
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Подписываем пользователя на OneSignal
      if (window.subscribeUserToNotifications) {
        window.subscribeUserToNotifications(currentUser.id, currentUser.role);
      }
      
      // Старая подписка (для совместимости)
      subscribeUser(currentUser.id);
    }
  }, [currentUser]);



  const loadData = async () => {
    try {
      const [productsData, ordersData, usersData] = await Promise.all([
        firebaseApi.getProducts(),
        firebaseApi.getOrders(),
        firebaseApi.getUsers()
      ]);
      
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);
      
      setDeliveries([]);
    } catch (error) {
      console.error('Error loading data from server:', error);
      setProducts([]);
      setOrders([]);
      setUsers([]);
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
        // Логика входа - ищем пользователя по email и роли
        try {
          // Ищем пользователя с конкретной ролью
          const existingUser = users.find(u => u.email === userData.email && u.role === userType);
          
          if (existingUser) {
            if (existingUser.blocked) {
              alert('Ваш аккаунт заблокирован администратором');
              return;
            }
            user = existingUser;
            console.log('Login successful:', user.id);
          } else {
            // Проверяем, есть ли пользователь с таким email, но другой ролью
            const userWithEmail = users.find(u => u.email === userData.email);
            if (userWithEmail) {
              alert(`Пользователь с таким email зарегистрирован как ${userWithEmail.role === 'customer' ? 'покупатель' : userWithEmail.role === 'seller' ? 'продавец' : userWithEmail.role}. Зарегистрируйтесь как ${userType === 'customer' ? 'покупатель' : userType === 'seller' ? 'продавец' : userType} или войдите с правильной ролью.`);
            } else {
              alert('Пользователь не найден. Пожалуйста, зарегистрируйтесь.');
            }
            return;
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('Ошибка входа. Попробуйте позже.');
          return;
        }
      } else {
        // Логика регистрации - создаем нового пользователя или добавляем роль
        try {
          const existingUser = await firebaseApi.findUserByEmail(userData.email);
          
          if (existingUser) {
            // Проверяем, есть ли уже такая роль у пользователя
            if (existingUser.role === userType) {
              alert(`Вы уже зарегистрированы как ${userType === 'customer' ? 'покупатель' : userType === 'seller' ? 'продавец' : userType}.`);
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
            
            // Создаем новую запись с другой ролью
            user = { 
              ...userData, 
              role: userType as 'admin' | 'customer' | 'seller' | 'courier' | 'manager',
              id: `${existingUser.id}_${userType}`,
              name: existingUser.name,
              email: existingUser.email,
              pavilionNumber: userData.pavilionNumber || ''
            };
          } else {
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
            
            // Создаем нового пользователя
            user = { 
              ...userData, 
              role: userType as 'admin' | 'customer' | 'seller' | 'courier' | 'manager',
              id: userData.id || Date.now().toString(),
              pavilionNumber: userData.pavilionNumber || ''
            };
          }
          
          await firebaseApi.createUser(user);
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
        role: userType as 'admin' | 'customer' | 'seller' | 'courier' | 'manager',
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
      await firebaseApi.updateProduct(productId, updates);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...updates, id: productId } : p
      ));
      setSkipNextReload(true);
      console.log('Product updated on server:', productId, 'Response:', updates);
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.message && error.message.includes('не найден')) {
        alert('Товар не найден в базе данных. Возможно, он был удален. Обновляем список товаров...');
        // Удаляем товар из локального состояния
        setProducts(prev => prev.filter(p => p.id !== productId));
        // Перезагружаем данные для синхронизации
        loadData();
      } else {
        alert('Ошибка обновления товара');
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await firebaseApi.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      console.log('Product deleted from server:', productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка удаления товара');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await firebaseApi.deleteUser(userId);
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
      // Проверяем уникальность номера павильона только если он изменился
      if (updates.pavilionNumber) {
        const currentUser = users.find(u => u.id === userId);
        const currentPavilion = currentUser?.pavilionNumber;
        
        // Проверяем только если номер павильона действительно изменился
        if (updates.pavilionNumber !== currentPavilion) {
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
      }
      
      await firebaseApi.updateUser(userId, updates);
      
      // Обновляем текущего пользователя если это он
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      loadData();
      console.log('User updated:', userId, updates);
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.message && error.message.includes('не найден')) {
        alert('Пользователь не найден в базе данных. Возможно, он был удален. Обновляем данные...');
        // Перезагружаем данные для синхронизации
        loadData();
        // Если это текущий пользователь, выходим из системы
        if (currentUser && currentUser.id === userId) {
          handleLogout();
        }
      } else {
        alert('Ошибка обновления пользователя');
      }
    }
  };



  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await firebaseApi.updateOrder(orderId, { status });
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const recipients = [];
        let message = '';
        let title = 'ОптБазар';
        
        // Определяем получателей и сообщения по схеме
        switch (status) {
          case 'confirmed':
            // 2Б: Продавец подтвердил без изменений
            if (order.customerId) {
              recipients.push(order.customerId);
              message = `Заказ №${order.id.slice(-6)} подтвержден продавцом`;
            }
            // Менеджер получает уведомление
            const managers = users.filter(u => u.role === 'manager');
            managers.forEach(manager => {
              recipients.push(manager.id);
              if (!message) message = `Заказ №${order.id.slice(-6)} подтвержден, готов к обработке`;
            });
            break;
            
          case 'payment_pending':
            // 3: Менеджер добавил доставку
            if (order.customerId) {
              recipients.push(order.customerId);
              message = `К заказу №${order.id.slice(-6)} добавлена доставка. Требуется оплата`;
            }
            break;
            
          case 'paid':
            // 4: Покупатель оплатил
            const seller = users.find(u => u.role === 'seller' && u.pavilionNumber === order.pavilionNumber);
            if (seller) {
              recipients.push(seller.id);
            }
            const paidManagers = users.filter(u => u.role === 'manager');
            paidManagers.forEach(manager => recipients.push(manager.id));
            message = `Заказ №${order.id.slice(-6)} оплачен покупателем`;
            break;
            
          case 'ready':
            // 5: Продавец собрал заказ
            const readyManagers = users.filter(u => u.role === 'manager');
            readyManagers.forEach(manager => {
              recipients.push(manager.id);
            });
            message = `Заказ №${order.id.slice(-6)} собран продавцом, готов к отправке`;
            break;
            
          case 'delivering':
            // 6: Менеджер отправил в доставку
            if (order.customerId) {
              recipients.push(order.customerId);
              message = `Заказ №${order.id.slice(-6)} передан в доставку`;
            }
            break;
        }
        
        // Отправляем уведомления
        if (recipients.length > 0 && message) {
          try {
            await sendNotificationUtil(recipients, title, message);
            console.log('✅ Push-уведомления отправлены:', recipients.length, 'получателей');
          } catch (notificationError) {
            console.error('❌ Ошибка отправки уведомлений:', notificationError);
          }
        }
      }
      
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
      
      const product = await firebaseApi.createProduct(productWithPavilion);
      setProducts(prev => [...prev, product]);
      console.log('Product saved to server:', product.id);
      
    } catch (error) {
      console.error('Server error:', error);
      alert('Ошибка сохранения в базе данных. Проверьте соединение с сервером.');
    }
  };

  const handleCreateOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      const order = await firebaseApi.createOrder(orderData);
      setOrders(prev => [...prev, order]);
      
      // Отправляем push-уведомление продавцу
      if (orderData.pavilionNumber) {
        const seller = users.find(u => u.role === 'seller' && u.pavilionNumber === orderData.pavilionNumber);
        
        if (seller) {
          try {
            await sendNotificationUtil([seller.id], 'ОптБазар - Новый заказ!', `Поступил новый заказ на сумму ${orderData.total}₽`);
            console.log('✅ Push-уведомление отправлено продавцу');
          } catch (notificationError) {
            console.error('❌ Ошибка отправки уведомления продавцу:', notificationError);
          }
        }
      }
      
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
    <div className="App bg-slate-50 min-h-screen antialiased">

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

        <main className="pb-20">
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
                currentUser?.role === 'customer' ? (
                  <Navigate to="/customer-dashboard" replace />
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
                    users={users}
                    onUpdateProfile={async (updates) => {
                      try {
                        await firebaseApi.updateUser(currentUser.id, updates);
                        const updatedUser = { ...currentUser, ...updates };
                        setCurrentUser(updatedUser);
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                      } catch (error) {
                        console.error('Error updating user profile:', error);
                        alert('Ошибка сохранения адреса');
                      }
                    }}
                    onLogout={() => setCurrentUser(null)}
                    onCancelOrder={async (orderId) => {
                      try {
                        await firebaseApi.updateOrder(orderId, { status: 'cancelled' });
                        loadData();
                        alert('Заказ отменен');
                      } catch (error) {
                        console.error('Error cancelling order:', error);
                        alert('Ошибка отмены заказа');
                      }
                    }}
                    onApproveOrderChanges={async (orderId) => {
                      try {
                        await firebaseApi.updateOrder(orderId, { 
                          customerApproved: true,
                          status: 'confirmed'
                        });
                        
                        // 2А: Покупатель подтвердил изменения
                        const order = orders.find(o => o.id === orderId);
                        if (order) {
                          const recipients = [];
                          
                          // Продавец получает уведомление
                          const seller = users.find(u => u.role === 'seller' && u.pavilionNumber === order.pavilionNumber);
                          if (seller) {
                            recipients.push(seller.id);
                          }
                          
                          // Менеджер получает уведомление
                          const managers = users.filter(u => u.role === 'manager');
                          managers.forEach(manager => recipients.push(manager.id));
                          
                          if (recipients.length > 0) {
                            try {
                              if (seller) {
                                await sendNotificationUtil(
                                  [seller.id], 
                                  'ОптБазар', 
                                  `Покупатель подтвердил изменения заказа №${order.id.slice(-6)}`
                                );
                              }
                              await sendNotificationUtil(
                                managers.map(m => m.id), 
                                'ОптБазар', 
                                `Заказ №${order.id.slice(-6)} подтвержден покупателем, готов к обработке`
                              );
                            } catch (notificationError) {
                              console.error('❌ Ошибка отправки уведомлений:', notificationError);
                            }
                          }
                        }
                        
                        loadData();
                        alert('Изменения подтверждены');
                      } catch (error) {
                        console.error('Error approving order changes:', error);
                        alert('Ошибка подтверждения изменений');
                      }
                    }}
                    onRejectOrderChanges={async (orderId) => {
                      try {
                        await firebaseApi.updateOrder(orderId, { status: 'cancelled' });
                        loadData();
                        alert('Изменения отклонены, заказ отменен');
                      } catch (error) {
                        console.error('Error rejecting order changes:', error);
                        alert('Ошибка отклонения изменений');
                      }
                    }}
                    onUpdateOrder={async (orderId, updates) => {
                      try {
                        await firebaseApi.updateOrder(orderId, updates);
                        loadData();
                      } catch (error) {
                        console.error('Error updating order:', error);
                        throw error;
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
                    onUpdateOrder={async (orderId, updates) => {
                      try {
                        await firebaseApi.updateOrder(orderId, updates);
                        
                        // Если заказ был изменен, отправляем уведомление покупателю
                        if (updates.isModified && updates.status === 'customer_approval') {
                          const order = orders.find(o => o.id === orderId);
                          if (order && order.customerId) {
                            try {
                              await sendNotificationUtil(
                                [order.customerId], 
                                'ОптБазар', 
                                `Заказ №${order.id.slice(-6)} изменен продавцом. Требуется подтверждение`
                              );
                              console.log('✅ Уведомление о редактировании отправлено покупателю');
                            } catch (notificationError) {
                              console.error('❌ Ошибка отправки уведомления:', notificationError);
                            }
                          }
                        }
                        
                        loadData();
                      } catch (error) {
                        console.error('Error updating order:', error);
                        throw error;
                      }
                    }}
                    onUpdateUser={handleUpdateUser}
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
                        await firebaseApi.updateOrder(orderId, { courierId: currentUser.id, status: 'delivering' });
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
                    users={users}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateOrder={async (orderId, updates) => {
                      try {
                        console.log('Updating order:', orderId, 'with updates:', updates);
                        await firebaseApi.updateOrder(orderId, updates);
                        loadData();
                      } catch (error) {
                        console.error('Error updating order:', error);
                        console.error('Full error details:', error);
                      }
                    }}
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


        <CookieConsent />
        <DisclaimerModal />

        <Cart 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          user={currentUser}
          onUpdateQuantity={handleUpdateCartQuantity}
          onCreateOrder={handleCreateOrder}
        />

        <PWAInstallPrompt />
        
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
            if (currentUser?.role === 'customer') {
              handleDashboardClick('orders');
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
          onLogout={handleLogout}
          products={products}
          onProductSelect={(product) => {
            handleAddToCart(product, 1);
            setIsCartOpen(true);
          }}
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