import React, { useState } from 'react';
import { Truck, Clock, CheckCircle, DollarSign, User, Settings } from 'lucide-react';

import { Order, User as UserType } from '../types';

interface CourierDashboardProps {
  orders: Order[];
  courier: UserType;
  onAcceptOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onUpdateProfile?: (updates: Partial<UserType>) => void;
  onLogout?: () => void;
}

const CourierDashboard: React.FC<CourierDashboardProps> = ({
  orders,
  courier,
  onAcceptOrder,
  onUpdateOrderStatus,
  onUpdateProfile,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed' | 'profile'>('available');
  const [isEditing, setIsEditing] = useState(false);

  // Слушатель для переключения вкладок
  React.useEffect(() => {
    const handleCourierTab = (event: any) => {
      if (event.detail) {
        const tabMap: { [key: string]: string } = {
          'tasks': 'available',
          'route': 'active', 
          'deliveries': 'active',
          'schedule': 'completed',
          'profile': 'profile'
        };
        setActiveTab((tabMap[event.detail] || 'available') as 'available' | 'active' | 'completed' | 'profile');
      }
    };
    
    window.addEventListener('switchCourierTab', handleCourierTab);
    return () => window.removeEventListener('switchCourierTab', handleCourierTab);
  }, []);

  const availableOrders = orders.filter(o => o.status === 'preparing');
  
  console.log('=== COURIER ORDERS DEBUG ===');
  console.log('All orders:', orders.length);
  console.log('Available orders:', availableOrders.length);
  console.log('Orders:', orders.map(o => ({ id: o.id, status: o.status })));
  console.log('==============================');
  const activeOrders = orders.filter(o => 
    o.courierId === courier.id && o.status === 'delivering'
  );
  const completedOrders = orders.filter(o => 
    o.courierId === courier.id && o.status === 'delivered'
  );

  const todayEarnings = completedOrders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + 150, 0); // 150₽ за доставку

  const totalEarnings = completedOrders.length * 150;

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      vehicle: formData.get('vehicle') as UserType['vehicle']
    };
    onUpdateProfile?.(updates);
    setIsEditing(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '40px'
    }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '8px',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            Личный кабинет курьера
          </h1>
          <p style={{ 
            color: 'white', 
            fontSize: '16px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            Добро пожаловать, {courier.name}!
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <Truck size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {activeOrders.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Активные доставки</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <CheckCircle size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {completedOrders.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Выполнено доставок</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <DollarSign size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {todayEarnings} ₽
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Заработано сегодня</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Clock size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {totalEarnings} ₽
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Общий заработок</p>
          </div>
        </div>

        {/* Вкладки скрыты - используется нижнее меню */}
        <div style={{ marginBottom: '24px', display: 'none' }}>
        </div>

        {/* Доступные доставки */}
        {activeTab === 'available' && (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Доступные заказы
            </h2>
            {availableOrders.length > 0 ? (
              availableOrders.map(order => (
                <div key={order.id} className="card">
                  <h3>Заказ #{order.id.slice(-6)}</h3>
                  <p>Адрес: {order.deliveryAddress}</p>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Товары:</strong>
                    <div style={{ marginTop: '8px' }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '4px 0',
                          fontSize: '14px',
                          borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}>
                          <span>{item.productName} x {item.quantity}</span>
                          <span>{item.price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600' }}>Сумма: {order.total} ₽</p>
                  <button className="btn btn-primary" onClick={() => onAcceptOrder?.(order.id)}>
                    Принять заказ
                  </button>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                <p style={{ color: '#666' }}>Нет доступных заказов</p>
              </div>
            )}
          </div>
        )}

        {/* Активные доставки */}
        {activeTab === 'active' && (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Мои доставки
            </h2>
            {activeOrders.length > 0 ? (
              activeOrders.map(order => (
                <div key={order.id} className="card">
                  <h3>Заказ #{order.id.slice(-6)}</h3>
                  <p>Адрес: {order.deliveryAddress}</p>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Товары:</strong>
                    <div style={{ marginTop: '8px' }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '4px 0',
                          fontSize: '14px',
                          borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}>
                          <span>{item.productName} x {item.quantity}</span>
                          <span>{item.price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600' }}>Сумма: {order.total} ₽</p>
                  <button className="btn btn-primary" onClick={() => onUpdateOrderStatus?.(order.id, 'delivered')}>
                    Завершить доставку
                  </button>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                <p style={{ color: '#666' }}>Нет активных доставок</p>
              </div>
            )}
          </div>
        )}

        {/* Выполненные доставки */}
        {activeTab === 'completed' && (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              История доставок
            </h2>
            {completedOrders.length > 0 ? (
              completedOrders.map(order => (
                <div key={order.id} className="card">
                  <h3>Заказ #{order.id.slice(-6)}</h3>
                  <p>Адрес: {order.deliveryAddress}</p>
                  <p>Сумма: {order.total} ₽</p>
                  <p style={{ color: '#4caf50' }}>✓ Доставлен</p>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                <p style={{ color: '#666' }}>Нет выполненных доставок</p>
              </div>
            )}
          </div>
        )}

        {/* Профиль */}
        {activeTab === 'profile' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Мой профиль</h2>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings size={16} />
                {isEditing ? 'Отмена' : 'Редактировать'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Имя
                    </label>
                    <input name="name" className="input" defaultValue={courier.name} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Телефон
                    </label>
                    <input name="phone" className="input" defaultValue={courier.phone} required />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Транспорт
                  </label>
                  <select name="vehicle" className="input" defaultValue={courier.vehicle} required>
                    <option value="foot">Пешком</option>
                    <option value="bike">Велосипед</option>
                    <option value="car">Автомобиль</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Сохранить изменения
                </button>
              </form>
            ) : (
              <div>
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
                    {courier.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Имя:</strong> {courier.name}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Роль:</strong> Курьер
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Email:</strong> {courier.email}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Телефон:</strong> {courier.phone || 'Не указан'}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Транспорт:</strong> {
                    courier.vehicle === 'car' ? 'Автомобиль' :
                    courier.vehicle === 'bike' ? 'Велосипед' :
                    courier.vehicle === 'foot' ? 'Пешком' : 'Не указан'
                  }
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Рейтинг:</strong> 
                  <span style={{ 
                    color: '#4caf50',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {courier.rating ? `${courier.rating.toFixed(1)} ⭐` : 'Нет оценок'}
                  </span>
                </div>
                
                <div>
                  <strong>Статус:</strong> 
                  <span style={{ 
                    color: (courier.isActive !== false) ? '#4caf50' : '#f44336',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {(courier.isActive !== false) ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;