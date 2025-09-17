import React, { useState } from 'react';
import { Package, Users, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Order, Product, User as UserType } from '../types';

interface OrderWithCustomer extends Order {
  customerName: string;
}

interface AdminDashboardProps {
  orders: OrderWithCustomer[];
  products: Product[];
  users: UserType[];
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (productId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, products, users, onUpdateProduct, onDeleteProduct }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const getStatusColor = (status: OrderWithCustomer['status']) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'delivering': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: OrderWithCustomer['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'confirmed': return 'Подтвержден';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      onDeleteProduct?.(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      stock: Number(formData.get('stock'))
    };

    onUpdateProduct?.(editingProduct.id, updates);
    setEditingProduct(null);
  };

  return (
    <div style={{ paddingTop: '24px', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '8px',
            color: '#3c2415'
          }}>
            Панель администратора
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Управление заказами и мониторинг системы
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <Package size={32} color="#8b4513" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#8b4513', marginBottom: '4px' }}>
              {orders.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Всего заказов</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <BarChart3 size={32} color="#8b4513" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#8b4513', marginBottom: '4px' }}>
              {totalRevenue.toLocaleString()} ₽
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Общая выручка</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Clock size={32} color="#8b4513" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#8b4513', marginBottom: '4px' }}>
              {todayOrders}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Заказов сегодня</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Users size={32} color="#8b4513" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#8b4513', marginBottom: '4px' }}>
              {products.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Товаров в каталоге</p>
          </div>
        </div>

        {/* Вкладки */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Заказы
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={activeTab === 'products' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Товары
            </button>
          </div>

          {activeTab === 'orders' && (
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Все заказы
            </h2>
          )}
          
          {activeTab === 'products' && (
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Управление товарами
            </h2>
          )}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'Все' },
                { key: 'pending', label: 'Ожидают' },
                { key: 'confirmed', label: 'Подтверждены' },
                { key: 'delivered', label: 'Доставлены' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={filter === item.key ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Список заказов */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                    Заказ #{order.id.slice(-8)}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    <Clock size={14} />
                    {new Date(order.createdAt).toLocaleString('ru-RU')}
                  </div>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Клиент: {order.customerName}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Адрес: {order.deliveryAddress}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: getStatusColor(order.status),
                    background: `${getStatusColor(order.status)}20`,
                    marginBottom: '8px'
                  }}>
                    {getStatusText(order.status)}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b4513' }}>
                    {order.total} ₽
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Товары ({order.items.length}):
                </h4>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      {item.productName} × {item.quantity} = {item.price * item.quantity} ₽
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {order.status === 'pending' && (
                  <>
                    <button className="btn btn-primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                      <CheckCircle size={16} />
                      Подтвердить
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px 16px', color: '#f44336' }}>
                      <XCircle size={16} />
                      Отменить
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button className="btn btn-primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                    Отправить в доставку
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#666'
            }}>
              <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Заказов не найдено</p>
            </div>
          )}
          </div>
        )}

        {/* Управление товарами */}
        {activeTab === 'products' && (
          <div>
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
                    <button type="submit" className="btn btn-primary">
                      Обновить товар
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditingProduct(null)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-3">
              {products.map(product => {
                const seller = users.find(u => u.id === product.sellerId);
                return (
                  <div key={product.id} className="card">
                    <div style={{
                      width: '100%',
                      height: '120px',
                      background: '#f9f5f0',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '42px',
                      overflow: 'hidden'
                    }}>
                      {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML = '📦';
                            }
                          }}
                        />
                      ) : (
                        product.image || '📦'
                      )}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#8b4513', marginBottom: '8px' }}>
                      {product.price} ₽
                    </p>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Продавец: {seller?.name || 'Неизвестный'}
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
                        ✏️
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '8px', color: '#f44336' }}
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;