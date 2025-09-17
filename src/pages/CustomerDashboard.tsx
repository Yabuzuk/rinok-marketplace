import React, { useState } from 'react';
import { Package, MapPin, Clock, Settings } from 'lucide-react';
import { Order, User as UserType } from '../types';

interface CustomerDashboardProps {
  user: UserType;
  orders: Order[];
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, orders }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'delivering': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтвержден';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
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
                    {user.email}
                  </p>
                </div>
              </div>

              <nav>
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
                  Мои заказы
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === 'addresses' ? '#f5f5f5' : 'transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  <MapPin size={18} />
                  Адреса доставки
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === 'profile' ? '#f5f5f5' : 'transparent',
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
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  marginBottom: '24px'
                }}>
                  Мои заказы
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.filter(order => String(order.customerId) === String(user.id)).map(order => (
                    <div key={order.id} className="card">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                            Заказ #{order.id.slice(-6)}
                          </h3>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#666',
                            fontSize: '14px'
                          }}>
                            <Clock size={14} />
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>

                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: getStatusColor(order.status),
                          background: `${getStatusColor(order.status)}20`
                        }}>
                          {getStatusText(order.status)}
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                          Товаров: {order.items.length}
                        </p>
                        <p style={{ fontSize: '14px', color: '#666' }}>
                          Адрес: {order.deliveryAddress}
                        </p>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                          {order.total} ₽
                        </span>
                        <button className="btn btn-secondary">
                          Подробнее
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  marginBottom: '24px'
                }}>
                  Адреса доставки
                </h2>

                <div className="card">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                      Основной адрес
                    </h3>
                    <button className="btn btn-secondary">
                      Изменить
                    </button>
                  </div>
                  <p style={{ color: '#666' }}>
                    г. Москва, ул. Примерная, д. 123, кв. 45
                  </p>
                </div>

                <button className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Добавить новый адрес
                </button>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  marginBottom: '24px'
                }}>
                  Настройки профиля
                </h2>

                <div className="card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Имя
                      </label>
                      <input 
                        className="input"
                        defaultValue={user.name}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Email
                      </label>
                      <input 
                        className="input"
                        type="email"
                        defaultValue={user.email}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Телефон
                      </label>
                      <input 
                        className="input"
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                      Сохранить изменения
                    </button>
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

export default CustomerDashboard;