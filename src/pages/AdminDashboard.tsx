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
  onDeleteUser?: (userId: string) => void;
  onUpdateUser?: (userId: string, updates: Partial<UserType>) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, products, users, onUpdateProduct, onDeleteProduct, onDeleteUser, onUpdateUser, onUpdateOrderStatus, onLogout }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showCreateManager, setShowCreateManager] = useState(false);

  // Слушатель для переключения вкладок
  React.useEffect(() => {
    const handleAdminTab = (event: any) => {
      if (event.detail) {
        const tabMap: { [key: string]: string } = {
          'dashboard': 'orders',
          'users': 'users',
          'orders': 'orders',
          'settings': 'users',
          'admin': 'orders'
        };
        setActiveTab((tabMap[event.detail] || 'orders') as 'orders' | 'products' | 'users');
      }
    };
    
    window.addEventListener('switchAdminTab', handleAdminTab);
    return () => window.removeEventListener('switchAdminTab', handleAdminTab);
  }, []);

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
            color: '#2e7d32'
          }}>
            Панель администратора
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Управление заказами и мониторинг системы
            </p>
            <button 
              onClick={() => onLogout?.()}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #f44336',
                borderRadius: '8px',
                color: '#f44336',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <Package size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {orders.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Всего заказов</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <BarChart3 size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {totalRevenue.toLocaleString()} ₽
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Общая выручка</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Clock size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {todayOrders}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Заказов сегодня</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Users size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {products.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Товаров в каталоге</p>
          </div>
        </div>

        {/* Кнопка миграции */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={async () => {
              if (!window.confirm('Начать миграцию данных из Supabase в Firebase?')) return;
              
              try {
                const { supabaseApi } = await import('../utils/supabaseApi');
                const { firebaseApi } = await import('../utils/firebaseApi');
                
                alert('Миграция началась. Проверьте консоль браузера для отслеживания прогресса.');
                console.log('🚀 Начинаем миграцию данных...');
                
                // Пользователи
                const users = await supabaseApi.getUsers();
                console.log(`Найдено ${users.length} пользователей`);
                for (const user of users) {
                  try {
                    await firebaseApi.createUser(user);
                    console.log(`✅ Пользователь ${user.name} перенесен`);
                  } catch (e) {
                    console.log(`⚠️ Пользователь ${user.name} уже существует`);
                  }
                }
                
                // Товары
                const products = await supabaseApi.getProducts();
                console.log(`Найдено ${products.length} товаров`);
                for (const product of products) {
                  try {
                    await firebaseApi.createProduct(product);
                    console.log(`✅ Товар ${product.name} перенесен`);
                  } catch (e) {
                    console.log(`⚠️ Товар ${product.name} уже существует`);
                  }
                }
                
                // Заказы
                const orders = await supabaseApi.getOrders();
                console.log(`Найдено ${orders.length} заказов`);
                for (const order of orders) {
                  try {
                    await firebaseApi.createOrder(order);
                    console.log(`✅ Заказ ${order.id} перенесен`);
                  } catch (e) {
                    console.log(`⚠️ Заказ ${order.id} уже существует`);
                  }
                }
                
                alert('🎉 Миграция завершена! Обновите страницу.');
                window.location.reload();
              } catch (error) {
                console.error('Ошибка миграции:', error);
                alert('Ошибка миграции. Проверьте консоль.');
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🚀 Мигрировать данные из Supabase
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={async () => {
              if (!window.confirm('Создать тестовые данные в Firebase?')) return;
              
              try {
                const { firebaseApi } = await import('../utils/firebaseApi');
                
                console.log('🧪 Создаем тестовые данные...');
                
                // Тестовые продавцы
                const testSellers = [
                  { id: 'seller1', name: 'Иван Петров', email: 'ivan@test.com', role: 'seller' as const, pavilionNumber: '15A' },
                  { id: 'seller2', name: 'Мария Сидорова', email: 'maria@test.com', role: 'seller' as const, pavilionNumber: '22B' }
                ];
                
                for (const seller of testSellers) {
                  try {
                    await firebaseApi.createUser(seller);
                    console.log(`✅ Продавец ${seller.name} создан`);
                  } catch (e) {
                    console.log(`⚠️ Продавец ${seller.name} уже существует`);
                  }
                }
                
                // Тестовые товары с изображениями из Supabase
                const testProducts = [
                  { name: 'Яблоки красные', price: 120, category: 'fruits', description: 'Свежие красные яблоки', stock: 50, sellerId: 'seller1', pavilionNumber: '15A', image: 'https://ezaabcngjalnnweoqyhv.supabase.co/storage/v1/object/public/product-images/apples.jpg', rating: 0, reviews: 0, minOrderQuantity: 1 },
                  { name: 'Морковь', price: 80, category: 'vegetables', description: 'Сочная морковь', stock: 30, sellerId: 'seller1', pavilionNumber: '15A', image: 'https://ezaabcngjalnnweoqyhv.supabase.co/storage/v1/object/public/product-images/carrots.jpg', rating: 0, reviews: 0, minOrderQuantity: 1 },
                  { name: 'Бананы', price: 150, category: 'fruits', description: 'Спелые бананы', stock: 25, sellerId: 'seller2', pavilionNumber: '22B', image: 'https://ezaabcngjalnnweoqyhv.supabase.co/storage/v1/object/public/product-images/bananas.jpg', rating: 0, reviews: 0, minOrderQuantity: 1 },
                  { name: 'Помидоры', price: 200, category: 'vegetables', description: 'Красные помидоры', stock: 40, sellerId: 'seller2', pavilionNumber: '22B', image: 'https://ezaabcngjalnnweoqyhv.supabase.co/storage/v1/object/public/product-images/tomatoes.jpg', rating: 0, reviews: 0, minOrderQuantity: 1 },
                  { name: 'Огурцы', price: 90, category: 'vegetables', description: 'Свежие огурцы', stock: 35, sellerId: 'seller1', pavilionNumber: '15A', image: 'https://ezaabcngjalnnweoqyhv.supabase.co/storage/v1/object/public/product-images/cucumbers.jpg', rating: 0, reviews: 0, minOrderQuantity: 1 },
                  { name: 'Апельсины', price: 180, category: 'fruits', description: 'Сочные апельсины', stock: 20, sellerId: 'seller2', pavilionNumber: '22B', image: 'https://ezaabcngjalnnweoqyhv.supabase.co/storage/v1/object/public/product-images/oranges.jpg', rating: 0, reviews: 0, minOrderQuantity: 1 }
                ];
                
                for (const product of testProducts) {
                  try {
                    await firebaseApi.createProduct(product);
                    console.log(`✅ Товар ${product.name} создан`);
                  } catch (e) {
                    console.log(`⚠️ Товар ${product.name} уже существует`);
                  }
                }
                
                alert('🎉 Тестовые данные созданы! Обновите страницу.');
                window.location.reload();
              } catch (error) {
                console.error('Ошибка создания тестовых данных:', error);
                alert('Ошибка создания данных.');
              }
            }}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🧪 Создать тестовые данные с Supabase изображениями
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={async () => {
              if (!window.confirm('Удалить дубли пользователей? Это действие нельзя отменить!')) return;
              
              try {
                const { firebaseApi } = await import('../utils/firebaseApi');
                
                console.log('🧹 Начинаем очистку дублей пользователей...');
                
                // Группируем пользователей по email
                const usersByEmail = new Map();
                users.forEach(user => {
                  if (!usersByEmail.has(user.email)) {
                    usersByEmail.set(user.email, []);
                  }
                  usersByEmail.get(user.email).push(user);
                });
                
                let deletedCount = 0;
                
                // Удаляем дубли (оставляем только первого пользователя с каждым email)
                const emails = Array.from(usersByEmail.keys());
                for (const email of emails) {
                  const userList = usersByEmail.get(email);
                  if (userList && userList.length > 1) {
                    console.log(`📧 Email ${email} имеет ${userList.length} дублей`);
                    
                    // Оставляем первого, удаляем остальных
                    for (let i = 1; i < userList.length; i++) {
                      try {
                        await firebaseApi.deleteUser(userList[i].id);
                        console.log(`🗑️ Удален дубль: ${userList[i].name} (${userList[i].id})`);
                        deletedCount++;
                      } catch (error) {
                        console.error(`❌ Ошибка удаления ${userList[i].name}:`, error);
                      }
                    }
                  }
                }
                
                alert(`🎉 Очистка завершена! Удалено ${deletedCount} дублей. Обновите страницу.`);
                window.location.reload();
              } catch (error) {
                console.error('Ошибка очистки дублей:', error);
                alert('Ошибка очистки дублей.');
              }
            }}
            style={{
              background: '#ff9800',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🧹 Удалить дубли пользователей
          </button>
        </div>

        {/* Вкладки скрыты - используется нижнее меню */}
        <div style={{ marginBottom: '24px', display: 'none' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
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
          
          {activeTab === 'users' && (
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Управление пользователями
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
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
                    {order.total} ₽
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Товары ({(order.items || []).length}):
                </h4>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {(order.items || []).map((item, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      {item.productName} × {item.quantity} = {item.price * item.quantity} ₽
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {order.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-primary" 
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                      onClick={() => onUpdateOrderStatus?.(order.id, 'confirmed')}
                    >
                      <CheckCircle size={16} />
                      Подтвердить
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '14px', padding: '8px 16px', color: '#f44336' }}
                      onClick={() => onUpdateOrderStatus?.(order.id, 'cancelled')}
                    >
                      <XCircle size={16} />
                      Отменить
                    </button>
                  </>
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
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50', marginBottom: '8px' }}>
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

        {/* Управление пользователями */}
        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateManager(true)}
              >
                + Добавить менеджера
              </button>
            </div>
            
            <div className="grid grid-3">
              {users.map(user => (
                <div 
                  key={user.id} 
                  className="card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedUser(user)}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: '600',
                    margin: '0 auto 12px'
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                    {user.name || 'Неизвестный'}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textAlign: 'center' }}>
                    {user.email}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', textAlign: 'center' }}>
                    Павильон: {user.pavilionNumber || 'Не указан'}
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      padding: '8px',
                      color: '#f44336',
                      borderColor: '#f44336'
                    }}
                    onClick={() => {
                      if (window.confirm(`Вы уверены, что хотите удалить пользователя ${user.name}?`)) {
                        onDeleteUser?.(user.id);
                      }
                    }}
                    title="Удалить пользователя"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Модальное окно пользователя */}
        {selectedUser && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setSelectedUser(null)}
          >
            <div 
              style={{
                background: '#f9f5f0',
                borderRadius: '16px',
                padding: '24px',
                width: '400px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Информация о пользователе</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: '600',
                  margin: '0 auto 16px'
                }}>
                  {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Имя:</strong> {selectedUser.name || 'Не указано'}
              </div>
              
              {selectedUser.companyName && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Название компании:</strong> {selectedUser.companyName}
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Email:</strong> {selectedUser.email}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Телефон:</strong> {selectedUser.phone || 'Не указан'}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Павильон:</strong> {selectedUser.pavilionNumber || 'Не указан'}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>ИНН:</strong> {selectedUser.inn || 'Не указан'}
              </div>
              
              {selectedUser.paymentInfo && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Платежная инфо:</strong> {selectedUser.paymentInfo}
                </div>
              )}
              
              {selectedUser.bankName && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Банк:</strong> {selectedUser.bankName}
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <strong>Статус:</strong> 
                <span style={{ 
                  color: selectedUser.blocked ? '#f44336' : '#4caf50',
                  fontWeight: '600',
                  marginLeft: '8px'
                }}>
                  {selectedUser.blocked ? 'Заблокирован' : 'Активен'}
                </span>
              </div>
              
              {selectedUser.role === 'seller' && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Лавка:</strong> 
                  <span style={{ 
                    color: selectedUser.sellerActive === true ? '#4caf50' : '#f44336',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {selectedUser.sellerActive === true ? 'Работает' : 'Не работает'}
                  </span>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary"
                  style={{ 
                    flex: 1,
                    background: '#2196f3',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => {
                    setEditingUser(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  Редактировать
                </button>
                
                <button 
                  className="btn btn-secondary"
                  style={{ 
                    flex: 1,
                    background: selectedUser.blocked ? '#4caf50' : '#ff9800',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => {
                    onUpdateUser?.(selectedUser.id, { blocked: !selectedUser.blocked });
                    setSelectedUser(null);
                  }}
                >
                  {selectedUser.blocked ? 'Разблокировать' : 'Заблокировать'}
                </button>
                
                {selectedUser.role === 'seller' && (
                  <button 
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1,
                      background: selectedUser.sellerActive === true ? '#ff9800' : '#4caf50',
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={() => {
                      onUpdateUser?.(selectedUser.id, { sellerActive: selectedUser.sellerActive !== true });
                      setSelectedUser(null);
                    }}
                  >
                    {selectedUser.sellerActive === true ? 'Закрыть лавку' : 'Открыть лавку'}
                  </button>
                )}
                
                <button 
                  className="btn btn-secondary"
                  style={{ 
                    flex: 1,
                    background: '#f44336',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => {
                    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${selectedUser.name}?`)) {
                      onDeleteUser?.(selectedUser.id);
                      setSelectedUser(null);
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Модальное окно редактирования пользователя */}
        {editingUser && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setEditingUser(null)}
          >
            <div 
              style={{
                background: '#f9f5f0',
                borderRadius: '20px',
                padding: '24px',
                width: '400px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                Редактирование пользователя
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updates: any = {
                  email: formData.get('email') as string,
                  name: formData.get('name') as string
                };
                
                const password = formData.get('password') as string;
                if (password) {
                  updates.password = password;
                }
                
                onUpdateUser?.(editingUser.id, updates);
                setEditingUser(null);
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Имя
                  </label>
                  <input 
                    name="name" 
                    className="input" 
                    defaultValue={editingUser.name} 
                    required 
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Email
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    className="input" 
                    defaultValue={editingUser.email} 
                    required 
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Новый пароль (оставьте пустым, чтобы не менять)
                  </label>
                  <input 
                    name="password" 
                    type="password" 
                    className="input" 
                    placeholder="Новый пароль"
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">
                    Сохранить
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания менеджера */}
        {showCreateManager && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowCreateManager(false)}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                width: '400px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                Создать менеджера
              </h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                
                const managerData = {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  role: 'manager' as const
                };
                
                try {
                  const { supabaseApi } = await import('../utils/supabaseApi');
                  const managerId = `manager_${Date.now()}`;
                  const newManager = {
                    id: managerId,
                    ...managerData
                  };
                  await supabaseApi.createUser(newManager);
                  setShowCreateManager(false);
                  alert('Менеджер успешно создан!');
                  window.location.reload();
                } catch (error) {
                  console.error('Error creating manager:', error);
                  alert('Ошибка создания менеджера');
                }
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Имя
                  </label>
                  <input 
                    name="name" 
                    className="input" 
                    required 
                    placeholder="Введите имя менеджера"
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Email
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    className="input" 
                    required 
                    placeholder="manager@example.com"
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Телефон
                  </label>
                  <input 
                    name="phone" 
                    type="tel" 
                    className="input" 
                    required 
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">
                    Создать менеджера
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateManager(false)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;