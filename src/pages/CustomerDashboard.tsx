import React, { useState } from 'react';
import { Package, MapPin, Clock, Settings } from 'lucide-react';
import { Order, User as UserType } from '../types';
import PaymentModal from '../components/PaymentModal';

interface CustomerDashboardProps {
  user: UserType;
  orders: Order[];
  users?: UserType[];
  onUpdateProfile?: (updates: Partial<UserType>) => void;
  onLogout?: () => void;
  onCancelOrder?: (orderId: string) => void;
  onApproveOrderChanges?: (orderId: string) => Promise<void>;
  onRejectOrderChanges?: (orderId: string) => Promise<void>;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => Promise<void>;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, orders, users, onUpdateProfile, onLogout, onCancelOrder, onApproveOrderChanges, onRejectOrderChanges, onUpdateOrder }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingAddress, setEditingAddress] = useState('');
  const [editingSuggestions, setEditingSuggestions] = useState<string[]>([]);
  const [showEditingSuggestions, setShowEditingSuggestions] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    order: Order;
    seller?: UserType;
    amount: number;
    type: 'products' | 'delivery';
    pavilionNumber?: string;
  } | null>(null);

  
  const getAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return [];
    }
    
    try {
      const response = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?` +
        `apikey=41a4deeb-0548-4d8e-b897-3c4a6bc08032&` +
        `text=${encodeURIComponent('Новосибирск ' + query)}&` +
        `results=5&` +
        `type=house`
      );
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.results?.map((item: any) => {
          const title = item.title?.text || item.text || '';
          const subtitle = item.subtitle?.text || '';
          return subtitle ? `${title}, ${subtitle}` : title;
        }) || [];
        const finalSuggestions = suggestions.slice(0, 5);
        setAddressSuggestions(finalSuggestions);
        return finalSuggestions;
      }
    } catch (error) {
      console.error('Ошибка получения подсказок:', error);
    }
    return [];
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'seller_editing': return '#2196f3';
      case 'customer_approval': return '#9c27b0';
      case 'manager_pricing': return '#607d8b';
      case 'payment_pending': return '#f44336';
      case 'paid': return '#4caf50';
      case 'collecting': return '#ff5722';
      case 'ready': return '#795548';
      case 'delivering': return '#ff9800';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'seller_editing': return 'Редактирует продавец';
      case 'customer_approval': return 'Требуется ваше подтверждение';
      case 'manager_pricing': return 'Менеджер добавляет стоимость доставки';
      case 'payment_pending': return 'Ожидает оплаты';
      case 'paid': return 'Оплачен, собирается';
      case 'collecting': return 'Собирается';
      case 'ready': return 'Готов к отправке';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
    }
  };

  // Группировка товаров по павильонам
  const groupItemsByPavilion = (order: Order) => {
    const groups: { [pavilionNumber: string]: { items: any[], total: number, seller?: UserType } } = {};
    
    order.items.filter(item => item.productId !== 'delivery').forEach(item => {
      // Находим продукт чтобы получить номер павильона
      const product = users?.find(u => u.role === 'seller');
      const pavilionNumber = order.pavilionNumber || 'unknown';
      
      if (!groups[pavilionNumber]) {
        groups[pavilionNumber] = {
          items: [],
          total: 0,
          seller: users?.find(u => u.role === 'seller' && u.pavilionNumber === pavilionNumber)
        };
      }
      
      groups[pavilionNumber].items.push(item);
      groups[pavilionNumber].total += item.price * item.quantity;
    });
    
    return groups;
  };

  // Проверка статуса оплаты для павильона
  const getPaymentStatus = (order: Order, pavilionNumber: string) => {
    return order.payments?.[pavilionNumber]?.status || 'pending';
  };

  // Проверка статуса оплаты доставки
  const getDeliveryPaymentStatus = (order: Order) => {
    return order.payments?.delivery?.status || 'pending';
  };

  // Проверка полной оплаты заказа
  const isFullyPaid = (order: Order) => {
    const pavilionGroups = groupItemsByPavilion(order);
    const allProductsPaid = Object.keys(pavilionGroups).every(pavilion => 
      getPaymentStatus(order, pavilion) === 'paid'
    );
    const deliveryPaid = !order.deliveryPrice || getDeliveryPaymentStatus(order) === 'paid';
    return allProductsPaid && deliveryPaid;
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
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Покупатель
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
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  <Settings size={18} />
                  Настройки
                </button>

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
                  {orders.filter(order => order.customerId === user.id).map(order => (
                    <div key={order.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                            Заказ #{order.id.slice(-6)}
                            {order.isModified && !order.customerApproved && order.status === 'customer_approval' && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                background: '#fff3cd',
                                color: '#856404',
                                fontSize: '10px',
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ
                              </span>
                            )}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                          <p style={{ fontSize: '14px', color: '#666' }}>
                            Товаров: {order.items.filter(item => item.productId !== 'delivery').length}
                          </p>
                          {order.deliveryPrice && (
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              Доставка: {order.deliveryPrice} ₽
                            </p>
                          )}
                          {order.isModified && order.modificationReason && (
                            <p style={{ fontSize: '12px', color: '#856404', marginTop: '4px' }}>
                              Причина изменения: {order.modificationReason}
                            </p>
                          )}
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: getStatusColor(order.status),
                            background: `${getStatusColor(order.status)}20`,
                            marginBottom: '8px'
                          }}>
                            {getStatusText(order.status)}
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50', marginBottom: '8px' }}>
                            {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
                          </div>
                          {order.deliveryPrice && order.deliveryPrice > 0 && (
                            <div style={{ fontSize: '14px', color: '#ff9800', marginBottom: '8px' }}>
                              + доставка {order.deliveryPrice} ₽
                            </div>
                          )}
                          
                          {/* Кнопки действий */}
                          {order.isModified && !order.customerApproved && order.status === 'customer_approval' && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                              <button 
                                className="btn btn-primary"
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApproveOrderChanges?.(order.id).catch(() => alert('Ошибка подтверждения'));
                                }}
                              >
                                ✅ Подтвердить
                              </button>
                              <button 
                                className="btn btn-secondary"
                                style={{ 
                                  fontSize: '11px', 
                                  padding: '4px 8px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Отклонить изменения? Заказ будет отменен.')) {
                                    onRejectOrderChanges?.(order.id).catch(() => alert('Ошибка отклонения'));
                                  }
                                }}
                              >
                                ❌ Отклонить
                              </button>
                            </div>
                          )}
                          
                          {order.status === 'payment_pending' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                              {(() => {
                                const pavilionGroups = groupItemsByPavilion(order);
                                return Object.entries(pavilionGroups).map(([pavilionNumber, group]) => {
                                  const paymentStatus = getPaymentStatus(order, pavilionNumber);
                                  if (paymentStatus === 'paid') {
                                    return (
                                      <div key={pavilionNumber} style={{
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        background: '#e8f5e8',
                                        color: '#2e7d32',
                                        borderRadius: '4px',
                                        textAlign: 'center'
                                      }}>
                                        Павильон {pavilionNumber}: Оплачено ✓
                                      </div>
                                    );
                                  }
                                  return (
                                    <button 
                                      key={pavilionNumber}
                                      className="btn btn-primary"
                                      style={{ fontSize: '11px', padding: '4px 8px' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentModal({ 
                                          order, 
                                          seller: group.seller, 
                                          amount: group.total, 
                                          type: 'products',
                                          pavilionNumber 
                                        });
                                      }}
                                    >
                                      💳 Оплатить пав. {pavilionNumber} ({group.total} ₽)
                                    </button>
                                  );
                                });
                              })()}
                              {order.deliveryPrice && order.deliveryPrice > 0 && (() => {
                                const deliveryStatus = getDeliveryPaymentStatus(order);
                                if (deliveryStatus === 'paid') {
                                  return (
                                    <div style={{
                                      fontSize: '11px',
                                      padding: '4px 8px',
                                      background: '#fff3e0',
                                      color: '#ef6c00',
                                      borderRadius: '4px',
                                      textAlign: 'center'
                                    }}>
                                      Доставка: Оплачено ✓
                                    </div>
                                  );
                                }
                                return (
                                  <button 
                                    className="btn btn-secondary"
                                    style={{ 
                                      fontSize: '11px', 
                                      padding: '4px 8px',
                                      backgroundColor: '#ff9800',
                                      color: 'white',
                                      border: 'none'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPaymentModal({ order, amount: order.deliveryPrice!, type: 'delivery' });
                                    }}
                                  >
                                    🚚 Оплатить доставку ({order.deliveryPrice} ₽)
                                  </button>
                                );
                              })()}
                            </div>
                          )}
                          

                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {orders.filter(order => order.customerId === user.id).length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '48px',
                      color: '#666'
                    }}>
                      <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>У вас пока нет заказов</p>
                    </div>
                  )}
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
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowAddressModal(true)}
                    >
                      Управление
                    </button>
                  </div>
                  <div>
                    {(user.addresses || ['г. Москва, ул. Примерная, д. 123, кв. 45']).map((address, index) => (
                      <p key={index} style={{ color: '#666', marginBottom: '8px' }}>
                        {address}
                      </p>
                    ))}
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '16px' }}
                  onClick={() => setShowAddAddress(true)}
                >
                  Добавить новый адрес
                </button>
                
                {showAddAddress && (
                  <div className="card" style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Новый адрес
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newAddress = addressInput;
                      
                      if (newAddress.trim()) {
                        const currentAddresses = user.addresses || ['г. Москва, ул. Примерная, д. 123, кв. 45'];
                        const updatedAddresses = [...currentAddresses, newAddress.trim()];
                        
                        onUpdateProfile?.({ addresses: updatedAddresses });
                        alert('Адрес добавлен!');
                        setShowAddAddress(false);
                        setAddressInput('');
                        setAddressSuggestions([]);
                      }
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                          Адрес
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            name="address"
                            className="input"
                            placeholder="Начните вводить адрес в Новосибирске..."
                            value={addressInput}
                            onChange={(e) => {
                              setAddressInput(e.target.value);
                              getAddressSuggestions(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            required
                          />
                          {showSuggestions && addressSuggestions.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: 'white',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                              {addressSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  style={{
                                    padding: '12px',
                                    cursor: 'pointer',
                                    borderBottom: index < addressSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
                                  }}
                                  onMouseDown={() => {
                                    setAddressInput(suggestion);
                                    setShowSuggestions(false);
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary">
                          Сохранить
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddAddress(false)}
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                )}
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
                        defaultValue={user.phone || ''}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Новый пароль (оставьте пустым, чтобы не менять)
                      </label>
                      <input 
                        className="input"
                        type="password"
                        placeholder="Новый пароль"
                      />
                    </div>

                    <button 
                      className="btn btn-primary" 
                      style={{ alignSelf: 'flex-start' }}
      onClick={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget.closest('div');
                        const inputs = form?.querySelectorAll('input');
                        const nameInput = inputs?.[0] as HTMLInputElement;
                        const emailInput = inputs?.[1] as HTMLInputElement;
                        const phoneInput = inputs?.[2] as HTMLInputElement;
                        const passwordInput = inputs?.[3] as HTMLInputElement;
                        
                        const updates: any = {
                          name: nameInput?.value || user.name,
                          email: emailInput?.value || user.email,
                          phone: phoneInput?.value || ''
                        };
                        
                        if (passwordInput?.value) {
                          updates.password = passwordInput.value;
                        }
                        
                        onUpdateProfile?.(updates);
                        alert('Профиль обновлен!');
                      }}
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Модальное окно с подробностями заказа */}
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
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
                Заказ #{selectedOrder.id.slice(-6)}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Статус:</strong> {getStatusText(selectedOrder.status)}
            </div>
            
            {selectedOrder.isModified && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}>
                <div style={{ fontWeight: '600', color: '#856404', marginBottom: '8px' }}>
                  ⚠️ Заказ был изменен продавцом
                </div>
                <div style={{ fontSize: '14px', color: '#856404', marginBottom: '8px' }}>
                  Причина: {selectedOrder.modificationReason}
                </div>
                {selectedOrder.originalTotal && (
                  <div style={{ fontSize: '14px', color: '#856404' }}>
                    Первоначальная сумма: {selectedOrder.originalTotal} ₽
                  </div>
                )}
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Дата заказа:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU')}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Адрес доставки:</strong> {selectedOrder.deliveryAddress}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Товары:</strong>
              <div style={{ marginTop: '8px' }}>
                {selectedOrder.items.filter(item => item.productId !== 'delivery').map((item, index, filteredItems) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0',
                    borderBottom: index < filteredItems.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <span>{item.productName} x {item.quantity}</span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                ))}
                {selectedOrder.deliveryPrice && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0',
                    borderTop: '1px solid #eee',
                    marginTop: '8px',
                    fontWeight: '500'
                  }}>
                    <span>Доставка</span>
                    <span>{selectedOrder.deliveryPrice} ₽</span>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '2px solid #eee',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              <span>Товары:</span>
              <span>{selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽</span>
            </div>
            
            {selectedOrder.deliveryPrice && selectedOrder.deliveryPrice > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#ff9800'
              }}>
                <span>Доставка:</span>
                <span>{selectedOrder.deliveryPrice} ₽</span>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '2px solid #eee',
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <span>Итого:</span>
              <span>{selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (selectedOrder.deliveryPrice || 0)} ₽</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedOrder.isModified && !selectedOrder.customerApproved && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={async () => {
                      try {
                        await onApproveOrderChanges?.(selectedOrder.id);
                        setSelectedOrder(null);
                      } catch (error) {
                        alert('Ошибка подтверждения изменений');
                      }
                    }}
                  >
                    ✅ Подтвердить изменения
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1,
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={async () => {
                      if (window.confirm('Вы уверены, что хотите отклонить изменения? Заказ будет отменен.')) {
                        try {
                          await onRejectOrderChanges?.(selectedOrder.id);
                          setSelectedOrder(null);
                        } catch (error) {
                          alert('Ошибка отклонения изменений');
                        }
                      }
                    }}
                  >
                    ❌ Отклонить изменения
                  </button>
                </div>
              )}
              {selectedOrder.status === 'payment_pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      // Оплата товаров
                      const seller = users?.find(u => u.role === 'seller' && u.pavilionNumber === selectedOrder.pavilionNumber);
                      const amount = selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0);
                      setPaymentModal({ order: selectedOrder, seller, amount, type: 'products' });
                    }}
                  >
                    💳 Оплатить товары ({selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽)
                  </button>
                  {selectedOrder.deliveryPrice && selectedOrder.deliveryPrice > 0 && (
                    <button 
                      className="btn btn-secondary"
                      style={{ 
                        width: '100%',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none'
                      }}
                      onClick={() => {
                        // Оплата доставки
                        setPaymentModal({ order: selectedOrder, amount: selectedOrder.deliveryPrice!, type: 'delivery' });
                      }}
                    >
                      🚚 Оплатить доставку ({selectedOrder.deliveryPrice} ₽)
                    </button>
                  )}
                </div>
              )}
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'seller_editing' || selectedOrder.status === 'customer_approval' || selectedOrder.status === 'manager_pricing') && (
                <button 
                  className="btn btn-secondary"
                  style={{ 
                    width: '100%',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => {
                    if (window.confirm('Вы уверены, что хотите отменить заказ?')) {
                      onCancelOrder?.(selectedOrder.id);
                      setSelectedOrder(null);
                    }
                  }}
                >
                  Отменить заказ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно управления адресами */}
      {showAddressModal && (
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
          <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
                Управление адресами
              </h3>
              <button 
                onClick={() => {
                  setShowAddressModal(false);
                  setEditingIndex(null);
                  setEditingAddress('');
                }}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(user.addresses || []).map((address, index) => (
                <div key={index} style={{
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: '#f9f9f9'
                }}>
                  {editingIndex === index ? (
                    <div>
                      <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <input
                          type="text"
                          value={editingAddress}
                          onChange={(e) => {
                            setEditingAddress(e.target.value);
                            getAddressSuggestions(e.target.value).then((suggestions) => {
                              setEditingSuggestions(suggestions);
                              setShowEditingSuggestions(true);
                            });
                          }}
                          onBlur={() => setTimeout(() => setShowEditingSuggestions(false), 200)}
                          placeholder="Начните вводить адрес в Новосибирске..."
                          className="input"
                        />
                        {showEditingSuggestions && editingSuggestions.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1001,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {editingSuggestions.map((suggestion, suggestionIndex) => (
                              <div
                                key={suggestionIndex}
                                style={{
                                  padding: '12px',
                                  cursor: 'pointer',
                                  borderBottom: suggestionIndex < editingSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
                                }}
                                onMouseDown={() => {
                                  setEditingAddress(suggestion);
                                  setShowEditingSuggestions(false);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            if (editingAddress.trim()) {
                              const updatedAddresses = [...(user.addresses || [])];
                              updatedAddresses[index] = editingAddress.trim();
                              onUpdateProfile?.({ addresses: updatedAddresses });
                              setEditingIndex(null);
                              setEditingAddress('');
                              setShowEditingSuggestions(false);
                            }
                          }}
                        >
                          Сохранить
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingIndex(null);
                            setEditingAddress('');
                            setShowEditingSuggestions(false);
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: '12px', fontSize: '16px' }}>
                        {address}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingAddress(address);
                          }}
                        >
                          Изменить
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => {
                            const updatedAddresses = (user.addresses || []).filter((_, i) => i !== index);
                            onUpdateProfile?.({ addresses: updatedAddresses });
                          }}
                          style={{ backgroundColor: '#f44336', color: 'white' }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно оплаты */}
      {paymentModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentModal(null)}
          order={paymentModal.order}
          seller={paymentModal.seller}
          amount={paymentModal.amount}
          type={paymentModal.type}
          pavilionNumber={paymentModal.pavilionNumber}
          onPaymentConfirmed={async (receiptUrl) => {
            try {
              const order = paymentModal.order;
              const { type, pavilionNumber } = paymentModal;
              
              // Обновляем статус оплаты
              const payments = { ...order.payments };
              
              if (type === 'delivery') {
                payments.delivery = {
                  status: 'paid',
                  amount: paymentModal.amount,
                  receiptUrl,
                  paidAt: new Date().toISOString()
                };
              } else if (pavilionNumber) {
                payments[pavilionNumber] = {
                  status: 'paid',
                  amount: paymentModal.amount,
                  receiptUrl,
                  paidAt: new Date().toISOString()
                };
              }
              
              // Проверяем, все ли оплачено
              const pavilionGroups = groupItemsByPavilion(order);
              const allProductsPaid = Object.keys(pavilionGroups).every(pavilion => 
                payments[pavilion]?.status === 'paid'
              );
              const deliveryPaid = !order.deliveryPrice || payments.delivery?.status === 'paid';
              
              const updates: Partial<Order> = {
                payments,
                status: (allProductsPaid && deliveryPaid) ? 'paid' : 'payment_pending'
              };
              
              await onUpdateOrder?.(order.id, updates);
              
              alert(`Оплата ${type === 'products' ? `товаров павильона ${pavilionNumber}` : 'доставки'} подтверждена!`);
              setPaymentModal(null);
            } catch (error) {
              console.error('Ошибка обновления оплаты:', error);
              alert('Ошибка обновления статуса оплаты');
            }
          }}
        />
      )}
      

    </div>
  );
};

export default CustomerDashboard;