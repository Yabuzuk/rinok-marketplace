import React, { useState } from 'react';
import { Package, Settings } from 'lucide-react';
import { Order, User as UserType } from '../types';

interface ManagerDashboardProps {
  user: UserType;
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
  onSwitchRole?: (role: 'customer' | 'seller' | 'admin' | 'courier' | 'manager') => void;
  onLogout?: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ 
  user, 
  orders, 
  onUpdateOrderStatus,
  onUpdateOrder,
  onSwitchRole,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'in-progress' | 'archive' | 'settings'>('orders');

  // Слушатель для переключения вкладок
  React.useEffect(() => {
    const handleTabSwitch = (event: any) => {
      if (event.detail) {
        const tabMap: { [key: string]: string } = {
          'orders': 'orders',
          'in-progress': 'in-progress',
          'archive': 'archive', 
          'profile': 'settings'
        };
        setActiveTab(tabMap[event.detail] || event.detail);
      }
    };
    window.addEventListener('switchManagerTab', handleTabSwitch);
    return () => window.removeEventListener('switchManagerTab', handleTabSwitch);
  }, []);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

  const confirmedOrders = orders.filter(order => order.status === 'confirmed');
  const inProgressOrders = orders.filter(order => order.status === 'manager_confirmed');
  const archivedOrders = orders.filter(order => order.status === 'delivered');

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтвержден продавцом';
      case 'manager_confirmed': return 'Подтвержден менеджером';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
    }
  };

  const handleConfirmOrder = async (order: Order) => {
    if (deliveryPrice <= 0) {
      alert('Укажите стоимость доставки');
      return;
    }

    try {
      await onUpdateOrder?.(order.id, {
        status: 'manager_confirmed',
        deliveryPrice: deliveryPrice,
        managerId: user.id
      });
      
      setSelectedOrder(null);
      setDeliveryPrice(0);
      alert('Заказ подтвержден с указанием стоимости доставки');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Ошибка подтверждения заказа');
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
                  background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
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
                  <p style={{ fontSize: '12px', color: '#9c27b0', fontWeight: '500' }}>
                    Менеджер
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
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Новые заказы ({confirmedOrders.length})
                </h2>

                {confirmedOrders.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                    <p style={{ color: '#666' }}>Нет заказов для подтверждения</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {confirmedOrders.map(order => (
                      <div key={order.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              Заказ #{order.id.slice(-8)}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              Адрес: {order.deliveryAddress}
                            </p>
                          </div>
                          
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#d1ecf1',
                            color: '#0c5460'
                          }}>
                            {getStatusText(order.status)}
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
                            Сумма товаров: {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
                          </div>
                          
                          <button 
                            className="btn btn-primary"
                            style={{ fontSize: '14px', padding: '8px 16px' }}
                            onClick={() => setSelectedOrder(order)}
                          >
                            Подтвердить с доставкой
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'in-progress' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Заказы в работе ({inProgressOrders.length})
                </h2>

                {inProgressOrders.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                    <p style={{ color: '#666' }}>Нет заказов в работе</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {inProgressOrders.map(order => (
                      <div key={order.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              Заказ #{order.id.slice(-8)}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              Адрес: {order.deliveryAddress}
                            </p>
                          </div>
                          
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#e8f5e8',
                            color: '#2e7d32'
                          }}>
                            {getStatusText(order.status)}
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
                          {order.deliveryPrice && (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '8px 0',
                              borderTop: '1px solid #f0f0f0',
                              marginTop: '8px'
                            }}>
                              <span>Доставка</span>
                              <span style={{ fontWeight: '600' }}>{order.deliveryPrice} ₽</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>
                            Итого: {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)} ₽
                          </div>
                          
                          <button 
                            className="btn btn-primary"
                            style={{ fontSize: '14px', padding: '8px 16px', background: '#4caf50' }}
                            onClick={async () => {
                              try {
                                await onUpdateOrder?.(order.id, { status: 'delivered' });
                                alert('Заказ отмечен как выполненный');
                              } catch (error) {
                                alert('Ошибка обновления статуса');
                              }
                            }}
                          >
                            Заказ выполнен
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'archive' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Архив заказов ({archivedOrders.length})
                </h2>

                {archivedOrders.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                    <p style={{ color: '#666' }}>Нет выполненных заказов</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {archivedOrders.map(order => (
                      <div key={order.id} className="card" style={{ opacity: 0.8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              Заказ #{order.id.slice(-8)}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              Адрес: {order.deliveryAddress}
                            </p>
                          </div>
                          
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#e8f5e8',
                            color: '#2e7d32'
                          }}>
                            Выполнен
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
                          {order.deliveryPrice && (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '8px 0',
                              borderTop: '1px solid #f0f0f0',
                              marginTop: '8px'
                            }}>
                              <span>Доставка</span>
                              <span style={{ fontWeight: '600' }}>{order.deliveryPrice} ₽</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>
                            Итого: {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)} ₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Личный кабинет менеджера
                </h2>
                <div className="card">
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '600'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                        {user.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#9c27b0', fontWeight: '500' }}>
                        Менеджер
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ fontSize: '14px', color: '#666' }}>Электронная почта:</strong>
                      <p style={{ fontSize: '16px', marginTop: '4px' }}>{user.email}</p>
                    </div>
                    
                    {user.phone && (
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ fontSize: '14px', color: '#666' }}>Телефон:</strong>
                        <p style={{ fontSize: '16px', marginTop: '4px' }}>{user.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onLogout?.()}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #f44336',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#f44336',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Выйти из системы
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения заказа */}
      {selectedOrder && (
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
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Подтверждение заказа #{selectedOrder.id.slice(-6)}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Сумма товаров:</strong> {selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Стоимость доставки (₽):
              </label>
              <input
                type="number"
                min="0"
                value={deliveryPrice}
                onChange={(e) => setDeliveryPrice(Number(e.target.value))}
                className="input"
                placeholder="Введите стоимость доставки"
              />
            </div>
            
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
              <strong>Итого к оплате:</strong> {selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryPrice} ₽
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => handleConfirmOrder(selectedOrder)}
                disabled={deliveryPrice <= 0}
              >
                Подтвердить заказ
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedOrder(null);
                  setDeliveryPrice(0);
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;