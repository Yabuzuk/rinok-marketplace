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

  // Отдельный эффект для перезагрузки при смене пользователя
  useEffect(() => {
    if (currentUser && !loading) {
      console.log('User changed, reloading data for:', currentUser.name);
      loadData();
    }
  }, [currentUser?.id]);

  const loadLocalProducts = () => {
    console.log('Loading local products...');
    let allProducts = [...mockProducts];
    
    // Загружаем локальные товары для всех продавцов
    const sellerIds = mockUsers.filter(u => u.role === 'seller').map(u => u.id);
    sellerIds.forEach(sellerId => {
      const savedProducts = localStorage.getItem(`sellerProducts_${sellerId}`);
      if (savedProducts) {
        try {
          const sellerProducts = JSON.parse(savedProducts);
          console.log(`Loading ${sellerProducts.length} products for seller ${sellerId}`);
          sellerProducts.forEach((product: Product) => {
            if (!allProducts.find(p => p.id === product.id)) {
              allProducts.push(product);
            }
          });
        } catch (e) {
          console.error(`Error loading products for seller ${sellerId}:`, e);
        }
      }
    });
    
    return allProducts;
  };

  const loadData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        api.getProducts(),
        api.getOrders()
      ]);
      
      // Объединяем с локальными товарами
      const localProducts = loadLocalProducts();
      const allProducts = [...productsData];
      
      localProducts.forEach(product => {
        if (!allProducts.find(p => p.id === product.id)) {
          allProducts.push(product);
        }
      });
      
      setProducts(allProducts);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data from server, using local data:', error);
      
      // Fallback: используем только локальные данные
      const allProducts = loadLocalProducts();
      setProducts(allProducts);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userType: 'customer' | 'seller' | 'admin', userData?: any) => {
    let user;
    if (userData) {
      user = { 
        ...userData, 
        role: userType,
        type: userType
      };
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

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updatedProducts = prev.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      );
      
      // Обновляем localStorage для всех продавцов
      const allSellerIds = mockUsers.filter(u => u.role === 'seller').map(u => String(u.id));
      allSellerIds.forEach(sellerId => {
        const sellerProducts = updatedProducts.filter(p => String(p.sellerId) === sellerId);
        if (sellerProducts.length > 0) {
          localStorage.setItem(`sellerProducts_${sellerId}`, JSON.stringify(sellerProducts));
        }
      });
      
      return updatedProducts;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const updatedProducts = prev.filter(p => p.id !== productId);
      
      // Обновляем localStorage для всех продавцов
      const allSellerIds = mockUsers.filter(u => u.role === 'seller').map(u => String(u.id));
      allSellerIds.forEach(sellerId => {
        const sellerProducts = updatedProducts.filter(p => String(p.sellerId) === sellerId);
        localStorage.setItem(`sellerProducts_${sellerId}`, JSON.stringify(sellerProducts));
      });
      
      return updatedProducts;
    });
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    console.log('Adding product:', newProduct);
    
    try {
      // Сжимаем base64 изображение если оно слишком большое
      let processedProduct = { ...newProduct };
      if (newProduct.image && newProduct.image.startsWith('data:') && newProduct.image.length > 100000) {
        console.log('Image too large, using placeholder');
        processedProduct.image = '📷'; // Используем эмодзи вместо больших изображений
      }
      
      const product = await api.createProduct(processedProduct);
      const updatedProducts = [...products, product];
      setProducts(updatedProducts);
      
      // Сохраняем товары продавца в localStorage
      if (currentUser?.id) {
        // Загружаем существующие товары
        const existingProducts = localStorage.getItem(`sellerProducts_${currentUser.id}`);
        let allSellerProducts = [];
        if (existingProducts) {
          try {
            allSellerProducts = JSON.parse(existingProducts);
          } catch (e) {
            allSellerProducts = [];
          }
        }
        
        // Добавляем новый товар, если его еще нет
        const exists = allSellerProducts.find((p: any) => p.id === product.id);
        if (!exists) {
          allSellerProducts.push(product);
        }
        
        localStorage.setItem(`sellerProducts_${currentUser.id}`, JSON.stringify(allSellerProducts));
        console.log('Saved to localStorage:', allSellerProducts.length, 'products');
      }
    } catch (error) {
      console.error('Server error, saving locally:', error);
      
      // Fallback: сохраняем локально
      let processedProduct = { ...newProduct };
      if (newProduct.image && newProduct.image.startsWith('data:') && newProduct.image.length > 100000) {
        processedProduct.image = '📷';
      }
      
      const productWithId = {
        ...processedProduct,
        id: `local_${Date.now()}`,
        sellerId: String(currentUser?.id || 'unknown')
      };
      
      const updatedProducts = [...products, productWithId];
      setProducts(updatedProducts);
      
      if (currentUser?.id) {
        // Загружаем существующие товары
        const existingProducts = localStorage.getItem(`sellerProducts_${currentUser.id}`);
        let allSellerProducts = [];
        if (existingProducts) {
          try {
            allSellerProducts = JSON.parse(existingProducts);
          } catch (e) {
            allSellerProducts = [];
          }
        }
        
        // Добавляем новый товар, если его еще нет
        const exists = allSellerProducts.find((p: any) => p.id === productWithId.id);
        if (!exists) {
          allSellerProducts.push(productWithId);
        }
        
        localStorage.setItem(`sellerProducts_${currentUser.id}`, JSON.stringify(allSellerProducts));
        console.log('Saved locally:', allSellerProducts.length, 'products');
      }
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