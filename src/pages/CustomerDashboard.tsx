import React, { useState } from 'react';
import { Package, MapPin, Clock, Settings } from 'lucide-react';
import { Order, User as UserType } from '../types';

interface CustomerDashboardProps {
  user: UserType;
  orders: Order[];
  onUpdateProfile?: (updates: Partial<UserType>) => void;
  onSwitchRole?: (role: 'customer' | 'seller' | 'admin' | 'courier') => void;
  onLogout?: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, orders, onUpdateProfile, onSwitchRole, onLogout }) => {
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
                    Покупатель
                  </p>
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
                    <option value="courier">Курьер</option>
                  </select>
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
                  {(() => {
                    const customerOrders = orders.filter(order => String(order.customerId) === String(user.id));
                    console.log('=== CUSTOMER ORDERS DEBUG ===');
                    console.log('All orders:', orders.length);
                    console.log('User ID:', user.id, 'type:', typeof user.id);
                    console.log('Customer orders:', customerOrders.length);
                    console.log('Orders by customer ID:', orders.map(o => ({ id: o.id, customerId: o.customerId, type: typeof o.customerId })));
                    console.log('==============================');
                    return customerOrders;
                  })().map(order => (
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
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setSelectedOrder(order)}
                        >
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
                        
                        const updates = {
                          name: nameInput?.value || user.name,
                          email: emailInput?.value || user.email,
                          phone: phoneInput?.value || ''
                        };
                        
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
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Дата заказа:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU')}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Адрес доставки:</strong> {selectedOrder.deliveryAddress}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Товары:</strong>
              <div style={{ marginTop: '8px' }}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0',
                    borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <span>{item.productName} x {item.quantity}</span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '2px solid #eee',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              <span>Итого:</span>
              <span>{selectedOrder.total} ₽</span>
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
    </div>
  );
};

export default CustomerDashboard;