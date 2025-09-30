import React, { useState } from 'react';
import { Package, Plus, BarChart3, Settings, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { Product, Order, User as UserType } from '../types';

import { uploadImage } from '../utils/supabase';

interface SellerDashboardProps {
  user: UserType;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (productId: string) => void;
  onCreateOrder?: (order: Omit<Order, 'id'>) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onUpdateUser?: (userId: string, updates: Partial<UserType>) => void;
  onSwitchRole?: (role: 'customer' | 'seller' | 'admin' | 'courier') => void;
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
  onUpdateUser,
  onSwitchRole,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'settings' | 'warehouse'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Слушатель для переключения вкладок
  React.useEffect(() => {
    const handleWarehouseTab = () => setActiveTab('warehouse');
    const handleSellerTab = (event: any) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('setWarehouseTab', handleWarehouseTab);
    window.addEventListener('switchSellerTab', handleSellerTab);
    
    return () => {
      window.removeEventListener('setWarehouseTab', handleWarehouseTab);
      window.removeEventListener('switchSellerTab', handleSellerTab);
    };
  }, []);

  // Очищаем localStorage при загрузке
  React.useEffect(() => {
    // Удаляем все товары из localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sellerProducts_')) {
        localStorage.removeItem(key);
        console.log('Removed from localStorage:', key);
      }
    });
  }, []);

  // Фильтруем товары по номеру павильона
  const sellerProducts = products.filter(p => p.pavilionNumber === user.pavilionNumber);
  
  console.log('=== SELLER DASHBOARD DEBUG ===');
  console.log('All products:', products.length);
  console.log('User pavilion:', user.pavilionNumber);
  console.log('Products by pavilion:', products.map(p => ({ 
    name: p.name, 
    pavilionNumber: p.pavilionNumber,
    match: p.pavilionNumber === user.pavilionNumber
  })));
  console.log('Seller products:', sellerProducts.length);
  console.log('==============================');
  const sellerOrders = orders.filter(order => {
    // Если pavilionNumber есть в заказе, используем его
    if (order.pavilionNumber) {
      return String(order.pavilionNumber) === String(user.pavilionNumber);
    }
    // Иначе определяем по товарам в заказе
    return order.items.some(item => {
      const product = products.find(p => p.id === item.productId);
      return product && String(product.pavilionNumber) === String(user.pavilionNumber);
    });
  });
  
  console.log('=== SELLER ORDERS DEBUG ===');
  console.log('All orders:', orders.length);
  console.log('User pavilion:', user.pavilionNumber);
  console.log('User pavilion type:', typeof user.pavilionNumber);
  console.log('Orders with pavilions:', orders.map(o => ({ id: o.id, pavilion: o.pavilionNumber, type: typeof o.pavilionNumber })));
  console.log('Filtered seller orders:', sellerOrders.length);
  console.log('============================');

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
      const orderTotal = order.items
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
        console.log('Загружаем изображение в Supabase...');
        const supabaseUrl = await uploadImage(selectedImage);
        if (supabaseUrl) {
          imageUrl = supabaseUrl;
          console.log('Получена ссылка:', imageUrl);
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
    setImagePreview(product.image);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      let imageUrl = formData.get('imageUrl') as string || editingProduct.image;
      
      if (selectedImage) {
        console.log('Обновляем изображение через Supabase...');
        const supabaseUrl = await uploadImage(selectedImage);
        if (supabaseUrl) {
          imageUrl = supabaseUrl;
          console.log('Получена новая ссылка:', imageUrl);
        } else {
          alert('Ошибка загрузки изображения');
          return;
        }
      }
      
      const updates = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        image: imageUrl,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        stock: Number(formData.get('stock')),
        minOrderQuantity: Number(formData.get('minOrderQuantity')),
        sellerId: editingProduct.sellerId,
        pavilionNumber: editingProduct.pavilionNumber
      };

      console.log('Обновляем товар:', editingProduct.id, updates);
      await onUpdateProduct?.(editingProduct.id, updates);
      setEditingProduct(null);
      setSelectedImage(null);
      setImagePreview('');
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      alert('Ошибка при обновлении товара');
    } finally {
      setUploading(false);
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
                  <select 
                    className="input"
                    style={{ fontSize: '12px', padding: '4px 8px', marginTop: '8px' }}
                    value={user.role}
                    onChange={(e) => {
                      const newRole = e.target.value as 'customer' | 'seller' | 'admin' | 'courier';
                      onSwitchRole?.(newRole);
                    }}
                  >
                    <option value="customer">Покупатель</option>
                    <option value="seller">Продавец</option>
                  </select>
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
                      onClick={() => {
                        console.log('Force reload clicked');
                        window.location.reload();
                      }}
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
                        <div></div>
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
                  <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      Редактировать товар
                    </h3>
                    <form onSubmit={handleUpdateProduct}>
                      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Название
                          </label>
                          <input name="name" className="input" defaultValue={editingProduct.name} required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Цена (₽)
                          </label>
                          <input name="price" type="number" className="input" defaultValue={editingProduct.price} required />
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Категория
                          </label>
                          <select name="category" className="input" defaultValue={editingProduct.category} required>
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
                          <input name="stock" type="number" className="input" defaultValue={editingProduct.stock} required />
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Мин. количество для заказа
                          </label>
                          <input name="minOrderQuantity" type="number" min="1" className="input" defaultValue={editingProduct.minOrderQuantity} required />
                        </div>
                        <div></div>
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
                                Загрузить новый файл
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
                          defaultValue={editingProduct.description}
                          required 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                          {uploading ? 'Обновление...' : 'Обновить товар'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingProduct(null);
                            setSelectedImage(null);
                            setImagePreview('');
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-3">
                  {sellerProducts.map(product => (
                    <div key={product.id} className="card">
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
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: order.status === 'pending' ? '#fff3cd' : 
                                       order.status === 'confirmed' ? '#d1ecf1' : 
                                       order.status === 'preparing' ? '#d4edda' : '#f8d7da',
                            color: order.status === 'pending' ? '#856404' : 
                                  order.status === 'confirmed' ? '#0c5460' : 
                                  order.status === 'preparing' ? '#155724' : '#721c24'
                          }}>
                            {order.status === 'pending' ? 'Ожидает подтверждения' :
                             order.status === 'confirmed' ? 'Подтвержден' :
                             order.status === 'preparing' ? 'Готовится' : order.status}
                          </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          {order.items.filter(item => item.productId !== 'delivery').map((item, index, filteredItems) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '8px 0',
                              borderBottom: index < filteredItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <span>{item.productName} x {item.quantity}</span>
                              <span style={{ fontWeight: '600' }}>{item.price * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>
                            Итого: {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
                          </div>
                          
                          {order.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-primary"
                                style={{ fontSize: '14px', padding: '8px 16px' }}
                                onClick={() => onUpdateOrderStatus?.(order.id, 'confirmed')}
                              >
                                Подтвердить
                              </button>
                              <button 
                                className="btn btn-secondary"
                                style={{ fontSize: '14px', padding: '8px 16px', color: '#f44336' }}
                                onClick={() => onUpdateOrderStatus?.(order.id, 'cancelled')}
                              >
                                Отменить
                              </button>
                            </div>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <button 
                              className="btn btn-primary"
                              style={{ fontSize: '14px', padding: '8px 16px' }}
                              onClick={() => onUpdateOrderStatus?.(order.id, 'preparing')}
                            >
                              Отправить в доставку
                            </button>
                          )}
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

                <div className="card">
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Общая информация о компании
                  </h3>
                  
                  <div className="grid grid-2" style={{ gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Номер склада
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
                        Название (ИП или ООО)
                      </label>
                      <input 
                        className="input" 
                        data-field="companyName"
                        defaultValue={user.companyName || user.name}
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
                        Номер карты / Мобильный банк
                      </label>
                      <input 
                        className="input" 
                        data-field="paymentInfo"
                        defaultValue={user.paymentInfo || ''}
                        placeholder="1234 5678 9012 3456"
                        disabled={!isEditingProfile}
                        style={{ 
                          backgroundColor: !isEditingProfile ? '#f5f5f5' : 'white',
                          cursor: !isEditingProfile ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Наименование банка
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
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Новый пароль (оставьте пустым, чтобы не менять)
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
                        Редактировать личные данные
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
                              alert('Настройки сохранены!');
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
    </div>
  );
};

export default SellerDashboard;