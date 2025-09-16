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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        api.getProducts(),
        api.getOrders()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userType: 'customer' | 'seller' | 'admin', userData?: any) => {
    if (userData) {
      setCurrentUser({ 
        ...userData, 
        role: userType,
        type: userType // Убеждаемся что оба поля установлены
      });
    } else {
      const user = mockUsers.find(u => u.role === userType);
      if (user) {
        setCurrentUser(user);
      }
    }
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const product = await api.createProduct(newProduct);
      setProducts(prev => [...prev, product]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleCreateOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      const order = await api.createOrder(orderData);
      setOrders(prev => [...prev, order]);
      setCart([]);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
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