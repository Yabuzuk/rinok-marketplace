import React, { useState } from 'react';
import { Package, Plus, BarChart3, Settings, Eye, Edit, Trash2, Upload, FileText, Shield, Phone, Mail } from 'lucide-react';
import { Product, Order, User as UserType } from '../types';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../utils/supabase';
import { firebaseApi } from '../utils/firebaseApi';
import EditProductModal from '../components/EditProductModal';
import EditOrderModal from '../components/EditOrderModal';
import ReceiptViewer from '../components/ReceiptViewer';

interface SellerDashboardProps {
  user: UserType;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (productId: string) => void;
  onCreateOrder?: (order: Omit<Order, 'id'>) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => Promise<void>;
  onUpdateUser?: (userId: string, updates: Partial<UserType>) => void;
  onLogout?: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
  user, 
  products, 
  orders, 
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onCreateOrder,
  onUpdateOrderStatus,
  onUpdateOrder,
  onUpdateUser,
  onLogout
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'settings' | 'warehouse'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState<{ [key: string]: string }>({});
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Слушатель для переключения вкладок
  React.useEffect(() => {
    const handleWarehouseTab = () => setActiveTab('warehouse');
    const handleSellerTab = (event: any) => {
      if (event.detail) {
        const tabMap: { [key: string]: string } = {
          'analytics': 'analytics',
          'products': 'products',
          'orders': 'orders',
          'profile': 'settings'
        };
        const newTab = tabMap[event.detail] || event.detail;
        setActiveTab(newTab);
        
        // Обнуляем счетчик при открытии вкладки заказов
        if (newTab === 'orders') {
          localStorage.setItem(`seller_${user.pavilionNumber}_newOrders`, '0');
          setNewOrdersCount(0);
        }
      }
    };
    
    window.addEventListener('setWarehouseTab', handleWarehouseTab);
    window.addEventListener('switchSellerTab', handleSellerTab);
    
    return () => {
      window.removeEventListener('setWarehouseTab', handleWarehouseTab);
      window.removeEventListener('switchSellerTab', handleSellerTab);
    };
  }, [user.pavilionNumber]);

  // Очищаем localStorage при загрузке
  React.useEffect(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sellerProducts_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Фильтруем товары по номеру павильона
  const sellerProducts = products.filter(p => p.pavilionNumber === user.pavilionNumber);
  
  const sellerOrders = orders.filter(order => {
    // Если pavilionNumber есть в заказе, используем его
    if (order.pavilionNumber) {
      return String(order.pavilionNumber) === String(user.pavilionNumber);
    }
    // Иначе определяем по товарам в заказе
    return (() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items : []; })(); return Array.isArray(items) ? items : []; })().some(item => {
      const product = products.find(p => p.id === item.productId);
      return product && String(product.pavilionNumber) === String(user.pavilionNumber);
    }) || false;
  });

  // Отслеживаем новые и обновленные заказы
  React.useEffect(() => {
    const storageKey = `seller_${user.pavilionNumber}_orders`;
    const countKey = `seller_${user.pavilionNumber}_newOrders`;
    
    const savedOrders = localStorage.getItem(storageKey);
    const savedOrdersData = savedOrders ? JSON.parse(savedOrders) : {};
    
    let newCount = 0;
    
    sellerOrders.forEach(order => {
      const savedOrder = savedOrdersData[order.id];
      
      if (!savedOrder) {
        // Новый заказ
        newCount++;
      } else if (savedOrder.status !== order.status) {
        // Статус изменился
        newCount++;
      }
    });
    
    console.log('🔔 Счетчик заказов:', { 
      pavilion: user.pavilionNumber, 
      newCount, 
      totalOrders: sellerOrders.length,
      activeTab 
    });
    
    // Обновляем счетчик только если не на вкладке заказов
    if (activeTab !== 'orders') {
      localStorage.setItem(countKey, newCount.toString());
      setNewOrdersCount(newCount);
      (window as any).sellerNewOrdersCount = newCount;
    } else {
      // Если на вкладке заказов, обнуляем и сохраняем текущее состояние
      localStorage.setItem(countKey, '0');
      setNewOrdersCount(0);
      (window as any).sellerNewOrdersCount = 0;
      
      // Сохраняем текущее состояние заказов
      const currentOrdersData: any = {};
      sellerOrders.forEach(order => {
        currentOrdersData[order.id] = {
          status: order.status,
          createdAt: order.createdAt
        };
      });
      localStorage.setItem(storageKey, JSON.stringify(currentOrdersData));
    }
  }, [sellerOrders, user.pavilionNumber, activeTab]);

  // Загружаем счетчик при монтировании
  React.useEffect(() => {
    const countKey = `seller_${user.pavilionNumber}_newOrders`;
    const savedCount = localStorage.getItem(countKey);
    if (savedCount && activeTab !== 'orders') {
      setNewOrdersCount(parseInt(savedCount, 10));
    }
  }, [user.pavilionNumber, activeTab]);

  // Передаем счетчик в window для BottomNavigation
  React.useEffect(() => {
    (window as any).sellerNewOrdersCount = newOrdersCount;
  }, [newOrdersCount]);
  // Расчет выручки за текущий месяц
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyRevenue = sellerOrders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => {
      const orderTotal = (() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items : []; })()
        .filter(item => item.productId !== 'delivery')
        .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
      return sum + orderTotal;
    }, 0);
  
  const platformCommission = monthlyRevenue * 0.05; // 5% комиссия
  const totalProducts = sellerProducts.length;
  const totalOrders = sellerOrders.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      let imageUrl = formData.get('imageUrl') as string;
      
      if (selectedImage) {
        const supabaseUrl = await uploadImage(selectedImage);
        if (supabaseUrl) {
          imageUrl = supabaseUrl;
        } else {
          alert('Ошибка загрузки изображения');
          return;
        }
      }
      
      const newProduct = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        image: imageUrl,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        stock: Number(formData.get('stock')),
        minOrderQuantity: Number(formData.get('minOrderQuantity')),
        internalCode: formData.get('internalCode') as string || undefined,
        sellerId: user.id,
        pavilionNumber: user.pavilionNumber || '',
        rating: 0,
        reviews: 0
      };

      await onAddProduct(newProduct);
      

      
      setShowAddProduct(false);
      setSelectedImage(null);
      setImagePreview('');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      alert('Ошибка при добавлении товара');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && String(product.pavilionNumber) !== String(user.pavilionNumber)) {
      alert('Вы можете удалять только товары своего павильона');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      onDeleteProduct?.(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await onUpdateProduct?.(productId, updates);
      setEditingProduct(null);
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      setEditingProduct(null);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: Order['status']) => {
    setLoadingOrders(prev => ({ ...prev, [orderId]: status }));
    try {
      await onUpdateOrderStatus?.(orderId, status);
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error);
    } finally {
      setLoadingOrders(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  return (
    <div style={{ paddingTop: '24px' }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          gap: '32px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
        }}>
          {/* Sidebar */}
          <div style={{ 
            width: window.innerWidth <= 768 ? '100%' : '280px',
            display: activeTab === 'settings' ? 'block' : 'none'
          }}>
            <div className="card">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                    {user.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Продавец - Павильон {user.pavilionNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onLogout?.()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#f44336'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Выйти
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            {activeTab === 'products' && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
                    Мои товары ({sellerProducts.length})
                  </h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.location.reload()}
                      style={{ fontSize: '14px' }}
                    >
                      🔄 Обновить
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddProduct(true)}
                    >
                      <Plus size={16} />
                      Добавить товар
                    </button>
                  </div>
                </div>

                {showAddProduct && (
                  <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      Добавить новый товар
                    </h3>
                    <form onSubmit={handleAddProduct}>
                      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Название
                          </label>
                          <input name="name" className="input" required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Цена (₽)
                          </label>
                          <input name="price" type="number" className="input" required />
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Категория
                          </label>
                          <select name="category" className="input" required>
                            <option value="">Выберите категорию</option>
                            <option value="fruits">Фрукты</option>
                            <option value="vegetables">Овощи</option>
                            <option value="greens">Зелень</option>
                            <option value="berries">Ягоды</option>
                            <option value="nuts">Орехи</option>
                            <option value="spices">Специи</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Количество
                          </label>
                          <input name="stock" type="number" className="input" required />
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Мин. количество для заказа
                          </label>
                          <input name="minOrderQuantity" type="number" min="1" className="input" defaultValue="1" required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Служебный номер (необязательно)
                          </label>
                          <input name="internalCode" className="input" placeholder="Например: A-123" />
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                          Изображение товара
                        </label>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                background: '#f9f5f0',
                                border: '2px dashed #d4c4b0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#8b4513'
                              }}>
                                <Upload size={16} />
                                Загрузить файл
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={handleImageSelect}
                                  style={{ display: 'none' }}
                                />
                              </label>
                            </div>
                            
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>или</div>
                            
                            <input 
                              name="imageUrl" 
                              type="url" 
                              className="input" 
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          
                          {imagePreview && (
                            <div style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #d4c4b0'
                            }}>
                              <img 
                                src={imagePreview} 
                                alt="Предпросмотр"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                          Описание
                        </label>
                        <textarea 
                          name="description" 
                          className="input" 
                          rows={3}
                          style={{ resize: 'vertical' }}
                          required 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                          {uploading ? 'Загрузка...' : 'Добавить товар'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddProduct(false)}
                        >
                          Отмена
                        </button>
                      </div>
                      
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                        Пример URL изображения: https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop
                      </div>
                    </form>
                  </div>
                )}

                {editingProduct && (
                  <EditProductModal
                    product={editingProduct}
                    isOpen={!!editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onUpdate={handleUpdateProduct}
                  />
                )}

                {(() => null)()}
                {editingOrder && onUpdateOrder && (
                  <EditOrderModal
                    order={editingOrder}
                    isOpen={!!editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onUpdate={onUpdateOrder}
                  />
                )}
                
                {editingOrder && !onUpdateOrder && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}>
                    <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                      <h3>Ошибка</h3>
                      <p>Функция обновления заказа не передана</p>
                      <button onClick={() => setEditingOrder(null)} className="btn btn-secondary">Закрыть</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-3">
                  {sellerProducts.map(product => (
                    <div key={product.id} className="card">
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '12px'
                          }}
                        />
                        {product.internalCode && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backdropFilter: 'blur(4px)'
                          }}>
                            {product.internalCode}
                          </div>
                        )}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        {product.name}
                      </h3>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#ff6b35', marginBottom: '12px' }}>
                        {product.price} ₽
                      </p>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        В наличии: {product.stock} кг
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1, padding: '8px' }}
                          onClick={() => handleEditProduct(product)}
                          title="Редактировать"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1, padding: '8px', color: '#f44336' }}
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Заказы павильона {user.pavilionNumber}
                </h2>

                {/* Информационное сообщение */}
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  background: '#e3f2fd',
                  borderRadius: '8px',
                  border: '1px solid #2196f3',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>ℹ️</div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1976d2' }}>
                      Управление заказами передано менеджеру
                    </div>
                    <div style={{ fontSize: '14px', color: '#0d47a1' }}>
                      Менеджер подтверждает заказы и управляет доставкой. Вы можете только просматривать заказы и чеки об оплате.
                    </div>
                  </div>
                </div>

                {sellerOrders.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                    <p style={{ color: '#666' }}>Нет заказов</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sellerOrders.map(order => (
                      <div key={order.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              Заказ #{order.id.slice(-8)}
                              {order.isModified && (
                                <span style={{
                                  marginLeft: '8px',
                                  padding: '2px 6px',
                                  background: '#fff3cd',
                                  color: '#856404',
                                  fontSize: '10px',
                                  borderRadius: '4px',
                                  fontWeight: '500'
                                }}>
                                  ИЗМЕНЕН
                                </span>
                              )}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            {order.isModified && order.modificationReason && (
                              <p style={{ fontSize: '12px', color: '#856404', marginTop: '4px' }}>
                                Причина: {order.modificationReason}
                              </p>
                            )}
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: order.status === 'pending' ? '#fff3cd' : 
                                       order.status === 'confirmed' ? '#d1ecf1' : 
                                       order.status === 'payment_pending' ? '#ffe0e0' :
                                       order.status === 'paid' ? '#d4edda' :
                                       order.status === 'ready' ? '#d4edda' :
                                       order.status === 'delivering' ? '#e1f5fe' : 
                                       order.status === 'delivered' ? '#d4edda' : '#f8d7da',
                            color: order.status === 'pending' ? '#856404' : 
                                  order.status === 'confirmed' ? '#0c5460' : 
                                  order.status === 'payment_pending' ? '#c62828' :
                                  order.status === 'paid' ? '#155724' :
                                  order.status === 'ready' ? '#155724' :
                                  order.status === 'delivering' ? '#01579b' : 
                                  order.status === 'delivered' ? '#155724' : '#721c24'
                          }}>
                            {order.status === 'pending' ? 'Ожидает подтверждения' :
                             order.status === 'confirmed' ? 'Подтвержден' :
                             order.status === 'payment_pending' ? 'Ожидает оплаты' :
                             order.status === 'paid' ? 'Оплачен' :
                             order.status === 'ready' ? 'Собран' :
                             order.status === 'delivering' ? 'В доставке' : 
                             order.status === 'delivered' ? 'Доставлен' : 
                             order.status === 'cancelled' ? 'Отменен' : 'Неизвестный статус'}
                          </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items : []; })().filter(item => item.productId !== 'delivery').map((item, index, filteredItems) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '8px 0',
                              borderBottom: index < filteredItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div>{item.productName} x {item.quantity}</div>
                                {item.internalCode && (
                                  <div style={{ 
                                    fontSize: '24px', 
                                    color: '#666',
                                    marginTop: '2px',
                                    fontWeight: '600'
                                  }}>
                                    № {item.internalCode}
                                  </div>
                                )}
                              </div>
                              <span style={{ fontWeight: '600' }}>{item.price * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>

                        {/* Отображение чека об оплате */}
                        {order.payments?.[user.pavilionNumber || '']?.receiptUrl && (
                          <div style={{
                            marginBottom: '16px',
                            padding: '12px',
                            background: '#e8f5e8',
                            borderRadius: '8px',
                            border: '1px solid #4caf50'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              marginBottom: '8px'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px'
                              }}>
                                <FileText size={16} style={{ color: '#4caf50' }} />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32' }}>
                                  Чек об оплате
                                </span>
                              </div>
                              <button
                                onClick={() => setViewingReceipt(order.payments![user.pavilionNumber!].receiptUrl!)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#4caf50',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  textDecoration: 'underline',
                                  fontWeight: '500'
                                }}
                              >
                                📄 Просмотреть чек
                              </button>
                            </div>
                            <div style={{ fontSize: '12px', color: '#2e7d32' }}>
                              Оплачено: {order.payments[user.pavilionNumber!].paidAt ? 
                                new Date(order.payments[user.pavilionNumber!].paidAt!).toLocaleString('ru-RU') : 
                                'Дата не указана'
                              }
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
                              Итого: {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items : []; })().filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
                            </div>
                            {/* Статус оплаты */}
                            {order.payments?.[user.pavilionNumber || ''] && (
                              <div style={{
                                fontSize: '14px',
                                color: order.payments[user.pavilionNumber!].status === 'paid' ? '#4caf50' : '#ff9800',
                                fontWeight: '600'
                              }}>
                                {order.payments[user.pavilionNumber!].status === 'paid' ? '✓ Оплачено' : '⏳ Ожидает оплаты'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Аналитика
                </h2>

                <div className="grid grid-2" style={{ marginBottom: '32px' }}>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#4caf50', marginBottom: '8px' }}>
                      {monthlyRevenue.toLocaleString()} ₽
                    </h3>
                    <p style={{ color: '#666' }}>Выручка за месяц</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#ff9800', marginBottom: '8px' }}>
                      {platformCommission.toLocaleString()} ₽
                    </h3>
                    <p style={{ color: '#666' }}>Комиссия площадки (5%)</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      От выручки за месяц
                    </p>
                  </div>
                  
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#2196f3', marginBottom: '8px' }}>
                      {totalOrders}
                    </h3>
                    <p style={{ color: '#666' }}>Заказов</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      Всего за время
                    </p>
                  </div>
                  
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#9c27b0', marginBottom: '8px' }}>
                      {totalProducts}
                    </h3>
                    <p style={{ color: '#666' }}>Товаров</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      В каталоге
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Настройки продавца
                </h2>

                {/* Основная информация */}
                <div className="card">
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Основная информация
                  </h3>
                  
                  <div className="grid grid-2" style={{ gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        ФИО
                      </label>
                      <input 
                        className="input" 
                        data-field="name"
                        defaultValue={user.name || ''}
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Email
                      </label>
                      <input 
                        className="input" 
                        data-field="email"
                        type="email"
                        defaultValue={user.email || ''}
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Телефон
                      </label>
                      <input 
                        className="input" 
                        data-field="phone"
                        defaultValue={user.phone || ''}
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        ИНН
                      </label>
                      <input 
                        className="input" 
                        data-field="inn"
                        defaultValue={user.inn || ''}
                        placeholder="123456789012"
                        maxLength={12}
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Номер павильона
                      </label>
                      <input 
                        className="input" 
                        data-field="pavilionNumber"
                        defaultValue={user.pavilionNumber || ''}
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Новый пароль (оставьте пустым)
                      </label>
                      <input 
                        className="input" 
                        data-field="password"
                        type="password"
                        placeholder="Новый пароль"
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Платежные реквизиты */}
                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Платежные реквизиты
                  </h3>
                  
                  <div className="grid grid-2" style={{ gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        ФИО держателя карты
                      </label>
                      <input 
                        className="input" 
                        data-field="cardHolderName"
                        defaultValue={user.cardHolderName || ''}
                        placeholder="Иванов Иван Иванович"
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Номер карты
                      </label>
                      <input 
                        className="input" 
                        data-field="bankCard"
                        defaultValue={user.bankCard || ''}
                        placeholder="2202 2020 1234 5678"
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Телефон карты
                      </label>
                      <input 
                        className="input" 
                        data-field="cardPhone"
                        defaultValue={user.cardPhone || ''}
                        placeholder="+7 (999) 123-45-67"
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Банк
                      </label>
                      <input 
                        className="input" 
                        data-field="bankName"
                        defaultValue={user.bankName || ''}
                        placeholder="Сбербанк"
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="card" style={{ marginTop: '24px' }}>
                  
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Статус аккаунта
                    </label>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: user.blocked ? '#ffebee' : '#e8f5e8',
                      color: user.blocked ? '#c62828' : '#2e7d32',
                      fontWeight: '500'
                    }}>
                      {user.blocked ? 'Заблокирован' : 'Активен'}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    {!isEditingProfile ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        Редактировать профиль
                      </button>
                    ) : (
                      <>
                        <button 
                          className="btn btn-primary"
                          onClick={async () => {
                            const inputs = document.querySelectorAll('input[data-field]');
                            const updates: any = {};
                            
                            inputs.forEach((input: any) => {
                              const field = input.getAttribute('data-field');
                              if (field) {
                                if (field === 'password' && !input.value) {
                                  return; // Не обновляем пароль, если поле пустое
                                }
                                updates[field] = input.value || '';
                              }
                            });
                            
                            try {
                              await onUpdateUser?.(user.id, updates);
                              setIsEditingProfile(false);
                              alert('Профиль сохранен!');
                            } catch (error) {
                              console.error('Ошибка:', error);
                              alert('Ошибка сохранения!');
                            }
                          }}
                        >
                          Сохранить
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Отмена
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Юридическая информация */}
                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2e7d32' }}>
                    📄 Правовая информация
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                    <button
                      onClick={() => navigate('/legal?tab=terms')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <FileText size={20} style={{ color: '#4caf50' }} />
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Пользовательское соглашение</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Основные правила работы</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => navigate('/legal?tab=offer')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <FileText size={20} style={{ color: '#ff9800' }} />
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Договор-оферта</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Условия сотрудничества</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => navigate('/legal?tab=product-rules')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Package size={20} style={{ color: '#2196f3' }} />
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Правила размещения</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Требования к товарам</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => navigate('/legal?tab=privacy')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Shield size={20} style={{ color: '#9c27b0' }} />
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Политика конфиденциальности</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Обработка данных</div>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Контакты поддержки */}
                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2e7d32' }}>
                    📞 Контакты поддержки
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <Mail size={20} style={{ color: '#4caf50' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Email</div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>amixvn@gmail.com</div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <Phone size={20} style={{ color: '#2196f3' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Телефон</div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>+7 913 949 2570</div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: '20px' }}>📍</div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Адрес</div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>г. Новосибирск</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: '#e8f5e8',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#2e7d32'
                  }}>
                    ℹ️ По вопросам работы на платформе, оплаты комиссии и технических проблем обращайтесь по указанным контактам.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Склад - Остатки товаров
                </h2>

                <div className="card">
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                    gap: '16px',
                    padding: '12px 16px',
                    borderBottom: '2px solid #f0f0f0',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <div>Название</div>
                    <div>Остаток</div>
                    <div>Мин. кол-во</div>
                    <div>Действия</div>
                  </div>
                  
                  {sellerProducts.map(product => (
                    <div key={product.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      gap: '16px',
                      padding: '16px',
                      borderBottom: '1px solid #f0f0f0',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {product.category === 'fruits' ? 'Фрукты' :
                           product.category === 'vegetables' ? 'Овощи' :
                           product.category === 'greens' ? 'Зелень' :
                           product.category === 'berries' ? 'Ягоды' :
                           product.category === 'nuts' ? 'Орехи' :
                           product.category === 'spices' ? 'Специи' :
                           product.category}
                        </div>
                      </div>
                      
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: product.stock < (product.minOrderQuantity || 1) ? '#f44336' : '#4caf50'
                      }}>
                        {product.stock} кг
                      </div>
                      
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {product.minOrderQuantity || 1} кг
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stock}
                          style={{
                            width: '80px',
                            padding: '4px 8px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          onBlur={(e) => {
                            const newStock = Number(e.target.value);
                            if (newStock !== product.stock) {
                              onUpdateProduct?.(product.id, { stock: newStock });
                            }
                          }}
                        />
                        <span style={{ fontSize: '12px', color: '#666' }}>кг</span>
                      </div>
                    </div>
                  ))}
                  
                  {sellerProducts.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '48px',
                      color: '#666'
                    }}>
                      Нет товаров на складе
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Модальные окна */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}
      
      {(() => {
        console.log('Rendering EditOrderModal check:', { editingOrder: !!editingOrder, onUpdateOrder: !!onUpdateOrder });
        return null;
      })()}
      {editingOrder && onUpdateOrder && (
        <EditOrderModal
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => {
            console.log('Closing EditOrderModal');
            setEditingOrder(null);
          }}
          onUpdate={onUpdateOrder}
        />
      )}
      
      {editingOrder && !onUpdateOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3>Ошибка</h3>
            <p>Функция обновления заказа не передана</p>
            <button onClick={() => setEditingOrder(null)} className="btn btn-secondary">Закрыть</button>
          </div>
        </div>
      )}
      
      {/* Просмотр чека */}
      {viewingReceipt && (
        <ReceiptViewer
          receiptUrl={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboard;

