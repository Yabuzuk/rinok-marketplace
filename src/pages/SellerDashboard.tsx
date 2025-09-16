import React, { useState } from 'react';
import { Package, Plus, BarChart3, Settings, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { Product, Order, User as UserType } from '../types';
import { api } from '../utils/api';

interface SellerDashboardProps {
  user: UserType;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onCreateOrder?: (order: Omit<Order, 'id'>) => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
  user, 
  products, 
  orders, 
  onAddProduct,
  onCreateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'settings'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const sellerProducts = products.filter(p => p.sellerId === user.id);
  const sellerOrders = orders.filter(order => 
    order.items.some(item => 
      sellerProducts.some(product => product.id === item.productId)
    )
  );

  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.total, 0);
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
        imageUrl = await api.convertImageToBase64(selectedImage);
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
            width: window.innerWidth <= 768 ? '100%' : '280px'
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
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Продавец
                  </p>
                </div>
              </div>

              <nav>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === 'products' ? '#f5f5f5' : 'transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  <Package size={18} />
                  Товары
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === 'orders' ? '#f5f5f5' : 'transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  <Package size={18} />
                  Заказы
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === 'analytics' ? '#f5f5f5' : 'transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  <BarChart3 size={18} />
                  Аналитика
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === 'settings' ? '#f5f5f5' : 'transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <Settings size={18} />
                  Настройки
                </button>
              </nav>
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
                    Мои товары
                  </h2>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddProduct(true)}
                  >
                    <Plus size={16} />
                    Добавить товар
                  </button>
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
                            <option value="dairy">Молочные</option>
                            <option value="meat">Мясо</option>
                            <option value="bakery">Хлеб</option>
                            <option value="drinks">Напитки</option>
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
                        В наличии: {product.stock} шт.
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', color: '#f44336' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Аналитика
                </h2>

                <div className="grid grid-3" style={{ marginBottom: '32px' }}>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#ff6b35', marginBottom: '8px' }}>
                      {totalRevenue.toLocaleString()} ₽
                    </h3>
                    <p style={{ color: '#666' }}>Общая выручка</p>
                  </div>
                  
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#ff6b35', marginBottom: '8px' }}>
                      {totalOrders}
                    </h3>
                    <p style={{ color: '#666' }}>Заказов</p>
                  </div>
                  
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#ff6b35', marginBottom: '8px' }}>
                      {totalProducts}
                    </h3>
                    <p style={{ color: '#666' }}>Товаров</p>
                  </div>
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