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
import { User, Product, CartItem, Order } from './types';
import { mockUsers, mockProducts } from './utils/mockData';
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
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadData();
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
      
      setProducts(productsData);
      setOrders(ordersData);
      
      // Объединяем пользователей с сервера и моковых данных
      const allUsers = [...mockUsers];
      usersData.forEach(serverUser => {
        if (!allUsers.find(u => u.id === serverUser.id)) {
          allUsers.push(serverUser);
        }
      });
      
      console.log('Loaded from server:', productsData.length, 'products,', usersData.length, 'users');
    } catch (error) {
      console.error('Error loading data from server:', error);
      setProducts(mockProducts);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userType: 'customer' | 'seller' | 'admin', userData?: any) => {
    let user;
    if (userData) {
      user = { 
        ...userData, 
        role: userType,
        type: userType,
        id: userData.id || Date.now().toString(),
        pavilionNumber: userData.pavilionNumber || ''
      };
      
      // Сохраняем нового пользователя на сервер
      try {
        await api.createUser(user);
        console.log('User saved to server:', user.id);
      } catch (error) {
        console.error('Error saving user:', error);
      }
    } else {
      user = mockUsers.find(u => u.role === userType);
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

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    console.log('Adding product:', newProduct);
    
    try {
      // Добавляем номер павильона продавца
      const seller = mockUsers.find(u => u.id === currentUser?.id);
      const productWithPavilion = {
        ...newProduct,
        sellerId: String(currentUser?.id),
        pavilionNumber: seller?.pavilionNumber || ''
      };
      
      const product = await api.createProduct(productWithPavilion);
      setProducts(prev => [...prev, product]);
      console.log('Product saved to server:', product.id);
      
    } catch (error) {
      console.error('Server error:', error);
      alert('Ошибка сохранения на сервере. Попробуйте позже.');
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
      handleLogin('customer');
    }
  };

  const handleDashboardClick = () => {
    if (currentUser) {
      const path = currentUser.role === 'customer' ? '/customer-dashboard' : 
                   currentUser.role === 'seller' ? '/seller-dashboard' : 
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
              Загрузка данных из Telegram...
            </div>
          ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  products={products}
                  onAddToCart={handleAddToCart}
                  users={mockUsers}
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
              path="/admin-dashboard" 
              element={
                currentUser?.role === 'admin' ? (
                  <AdminDashboard 
                    orders={orders.map(order => ({
                      ...order,
                      customerName: mockUsers.find(u => u.id === order.customerId)?.name || 'Неизвестный'
                    }))}
                    products={products}
                    users={mockUsers}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
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