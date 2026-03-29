import React, { useState } from 'react';
import { Package, Settings, FileText, Calculator } from 'lucide-react';
import { Order, User as UserType } from '../types';
import ReceiptViewer from '../components/ReceiptViewer';
import EditOrderModal from '../components/EditOrderModal';
import { DeliveryPoolsTab } from '../components/DeliveryPoolsTab';
import { calculateDeliveryPrice } from '../utils/yandexDelivery';
import VisitorStatsTab from '../components/VisitorStatsTab';
import { firebaseApi } from '../utils/firebaseApi';

interface ManagerDashboardProps {
  user: UserType;
  orders: Order[];
  users?: UserType[];
  deliveryPools?: any[];
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => Promise<void>;
  onSwitchRole?: (role: 'customer' | 'seller' | 'admin' | 'courier' | 'manager') => void;
  onLogout?: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ 
  user, 
  orders, 
  users = [],
  deliveryPools = [],
  onUpdateOrderStatus,
  onUpdateOrder,
  onSwitchRole,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'pools' | 'in-progress' | 'archive' | 'settings'>('orders');

  // Слушатель для переключения вкладок
  React.useEffect(() => {
    const handleTabSwitch = (event: any) => {
      if (event.detail) {
        const tabMap: { [key: string]: string } = {
          'orders': 'orders',
          'pools': 'pools',
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
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deliveryPrices, setDeliveryPrices] = useState<Record<string, number>>({});
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [calculatingPrices, setCalculatingPrices] = useState<Record<string, boolean>>({});
  const [warehouseAddress] = useState('Москва, ул. Примерная, 1'); // Адрес склада/павильона

  // Новые заказы для подтверждения (pending)
  const pendingOrders = orders.filter(order => order.status === 'pending');
  
  // Подтвержденные заказы для отправки на оплату (confirmed)
  // Только индивидуальные - добавляем доставку
  const confirmedOrders = orders.filter(order => order.status === 'confirmed');
  const confirmedIndividual = confirmedOrders.filter(order => order.deliveryType !== 'auto_group' && order.deliveryType !== 'neighbor_group');
  
  const readyOrders = orders.filter(order => order.status === 'ready' || order.status === 'paid');
  
  // Группировка confirmed индивидуальных заказов для добавления доставки
  const groupedConfirmedOrders = confirmedIndividual.reduce((groups, order) => {
    const key = `${order.customerId}-${order.deliveryAddress}`;
    if (!groups[key]) {
      const customer = users.find(u => u.id === order.customerId);
      groups[key] = {
        id: key,
        customerId: order.customerId,
        customerName: customer?.name || 'Неизвестный покупатель',
        customerPhone: customer?.phone || '',
        deliveryAddress: order.deliveryAddress,
        orders: [],
        totalAmount: 0,
        allItems: [],
        pavilions: new Set(),
        allReceipts: [],
        type: 'confirmed'
      };
    }
    
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    const filteredItems = Array.isArray(items) ? items.filter((item: any) => item.productId !== 'delivery') : [];
    
    groups[key].orders.push(order);
    groups[key].totalAmount += filteredItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    groups[key].allItems.push(...filteredItems);
    groups[key].pavilions.add(order.pavilionNumber);
    
    return groups;
  }, {} as Record<string, any>);
  
  // Группировка ready заказов для отправки в доставку
  const groupedReadyOrders = readyOrders.reduce((groups, order) => {
    const key = `${order.customerId}-${order.deliveryAddress}`;
    if (!groups[key]) {
      const customer = users.find(u => u.id === order.customerId);
      groups[key] = {
        id: key,
        customerId: order.customerId,
        customerName: customer?.name || 'Неизвестный покупатель',
        customerPhone: customer?.phone || '',
        deliveryAddress: order.deliveryAddress,
        orders: [],
        totalAmount: 0,
        allItems: [],
        pavilions: new Set(),
        allReceipts: [],
        type: 'ready'
      };
    }
    
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    const filteredItems = Array.isArray(items) ? items.filter((item: any) => item.productId !== 'delivery') : [];
    
    groups[key].orders.push(order);
    groups[key].totalAmount += filteredItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    groups[key].allItems.push(...filteredItems);
    groups[key].pavilions.add(order.pavilionNumber);
    
    // Собираем все чеки из группы
    if (order.payments) {
      Object.entries(order.payments).forEach(([paymentKey, payment]) => {
        if (payment.receiptUrl) {
          groups[key].allReceipts.push({
            ...payment,
            pavilion: order.pavilionNumber,
            type: paymentKey === 'delivery' ? 'Доставка' : `Павильон ${order.pavilionNumber}`
          });
        }
      });
    }
    
    return groups;
  }, {} as Record<string, any>);
  
  const groupedConfirmedOrdersList = Object.values(groupedConfirmedOrders);
  const groupedReadyOrdersList = Object.values(groupedReadyOrders);
  
  console.log('=== MANAGER DASHBOARD DEBUG ===');
  console.log('All orders:', orders.length);
  console.log('Confirmed orders:', confirmedOrders.length);
  console.log('Ready orders:', readyOrders.length);
  console.log('Grouped confirmed orders:', groupedConfirmedOrdersList.length);
  console.log('Grouped ready orders:', groupedReadyOrdersList.length);
  console.log('================================');
  const inProgressOrders = orders.filter(order => order.status === 'delivering');
  const archivedOrders = orders.filter(order => order.status === 'delivered');

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'seller_editing': return 'Редактирует продавец';
      case 'customer_approval': return 'Ждет подтверждения покупателя';
      case 'manager_pricing': return 'На ценообразовании';
      case 'payment_pending': return 'Ожидает оплаты';
      case 'paid': return 'Оплачен';
      case 'collecting': return 'Собирается';
      case 'ready': return 'Готов к отправке';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
    }
  };

  const handleCalculateDelivery = async (group: any) => {
    const token = process.env.REACT_APP_YANDEX_DELIVERY_TOKEN;
    
    if (!token) {
      alert('Токен Яндекс Доставки не настроен');
      return;
    }

    setCalculatingPrices(prev => ({ ...prev, [group.id]: true }));

    try {
      const price = await calculateDeliveryPrice(
        warehouseAddress,
        group.deliveryAddress,
        token
      );
      
      setDeliveryPrices(prev => ({ ...prev, [group.id]: price }));
    } catch (error) {
      console.error('Error calculating delivery:', error);
      alert('Ошибка расчета доставки. Введите вручную.');
    } finally {
      setCalculatingPrices(prev => ({ ...prev, [group.id]: false }));
    }
  };

  const handleSendGroupToDelivery = async (group: any) => {
    const deliveryPrice = deliveryPrices[group.id] || 0;
    
    if (deliveryPrice <= 0) {
      alert('Укажите стоимость доставки');
      return;
    }

    try {
      // Обновляем все заказы в группе - добавляем доставку и отправляем на оплату
      for (const order of group.orders) {
        await onUpdateOrder?.(order.id, {
          status: 'payment_pending',
          deliveryPrice: deliveryPrice,
          managerId: user.id
        });
      }
      
      setSelectedGroup(null);
      alert('Заказы отправлены покупателю для оплаты');
    } catch (error) {
      console.error('Error sending group to payment:', error);
      alert('Ошибка отправки заказов');
    }
  };

  const handleSendToDelivery = async (group: any) => {
    try {
      // Обновляем все заказы в группе - отправляем в доставку
      for (const order of group.orders) {
        await onUpdateOrder?.(order.id, {
          status: 'delivering',
          managerId: user.id
        });
      }
      
      alert('Заказы отправлены в доставку');
    } catch (error) {
      console.error('Error sending group to delivery:', error);
      alert('Ошибка отправки заказов');
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
                {/* Новые заказы для подтверждения */}
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  📋 Новые заказы ({pendingOrders.length})
                </h2>

                {pendingOrders.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '48px', marginBottom: '32px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                    <p style={{ color: '#666' }}>Нет новых заказов</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
                    {pendingOrders.map(order => {
                      const customer = users.find(u => u.id === order.customerId);
                      return (
                        <div key={order.id} className="card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                                {customer?.name || 'Неизвестный покупатель'} - {customer?.phone || ''}
                              </h3>
                              <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Адрес: {order.deliveryAddress}
                              </p>
                              <p style={{ fontSize: '14px', color: '#666' }}>
                                Павильон: {order.pavilionNumber}
                              </p>
                            </div>
                            
                            <div style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: '#fff3e0',
                              color: '#e65100'
                            }}>
                              Новый заказ
                            </div>
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items : []; })().map((item: any, index: number) => (
                              <div key={index} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '8px 0',
                                borderBottom: index < (() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items.length : 0; })() - 1 ? '1px solid #f0f0f0' : 'none'
                              }}>
                                <span>{item.productName} x {item.quantity}</span>
                                <span style={{ fontWeight: '600' }}>{item.price * item.quantity} ₽</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ff6b35' }}>
                              Товары: {order.total} ₽
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary"
                                style={{ 
                                  fontSize: '14px', 
                                  padding: '8px 16px'
                                }}
                                onClick={() => setEditingOrder(order)}
                              >
                                ✏️ Редактировать
                              </button>
                              
                              {/* Для групповых заказов - подтверждение БЕЗ доставки */}
                              {(order.deliveryType === 'auto_group' || order.deliveryType === 'neighbor_group') && (
                                <button 
                                  className="btn btn-primary"
                                  onClick={async () => {
                                    try {
                                      await onUpdateOrder?.(order.id, {
                                        status: 'payment_pending',
                                        managerId: user.id
                                      });
                                      
                                      // Добавляем заказ в пул
                                      if (order.deliveryDate && order.deliveryTimeSlot) {
                                        const poolId = `pool_${order.deliveryDate}_${order.deliveryTimeSlot}`;
                                        const pool = deliveryPools.find(p => p.id === poolId);
                                        
                                        if (pool && !pool.orders.includes(order.id)) {
                                          const updatedPool = {
                                            ...pool,
                                            orders: [...pool.orders, order.id]
                                          };
                                          await firebaseApi.createOrUpdatePool(updatedPool);
                                        }
                                      }
                                      
                                      alert('Заказ отправлен на оплату товаров.');
                                    } catch (error) {
                                      alert('Ошибка отправки на оплату');
                                    }
                                  }}
                                  style={{ 
                                    fontSize: '14px', 
                                    padding: '8px 16px',
                                    background: '#4CAF50'
                                  }}
                                >
                                  ✅ Подтвердить и отправить на оплату товаров
                                </button>
                              )}
                              
                              {/* Для индивидуальных заказов - подтверждение С доставкой */}
                              {order.deliveryType !== 'auto_group' && order.deliveryType !== 'neighbor_group' && (
                                <>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Доставка"
                                    value={deliveryPrices[order.id] || ''}
                                    onChange={(e) => setDeliveryPrices(prev => ({
                                      ...prev,
                                      [order.id]: Number(e.target.value)
                                    }))}
                                    style={{
                                      width: '100px',
                                      padding: '8px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      fontSize: '14px'
                                    }}
                                  />
                                  <button 
                                    className="btn btn-primary"
                                    onClick={async () => {
                                      const deliveryPrice = deliveryPrices[order.id] || 0;
                                      if (deliveryPrice <= 0) {
                                        alert('Укажите стоимость доставки');
                                        return;
                                      }
                                      try {
                                        await onUpdateOrder?.(order.id, {
                                          status: 'payment_pending',
                                          deliveryPrice: deliveryPrice,
                                          managerId: user.id
                                        });
                                        alert('Заказ подтвержден и отправлен на оплату');
                                      } catch (error) {
                                        alert('Ошибка подтверждения заказа');
                                      }
                                    }}
                                    style={{ 
                                      fontSize: '14px', 
                                      padding: '8px 16px'
                                    }}
                                  >
                                    Подтвердить + Доставка
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Готовые заказы для отправки в доставку */}
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  📦 Готовы к отправке ({groupedReadyOrdersList.length})
                </h2>

                {groupedReadyOrdersList.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                    <p style={{ color: '#666' }}>Нет готовых заказов</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupedReadyOrdersList.map(group => (
                      <div key={group.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              {group.customerName} - {group.customerPhone}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                              Адрес: {group.deliveryAddress}
                            </p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              Павильоны: {Array.from(group.pavilions).join(', ')}
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
                            Готов к отправке
                          </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          {group.allItems.map((item: any, index: number) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '8px 0',
                              borderBottom: index < group.allItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <span>{item.productName} x {item.quantity}</span>
                              <span style={{ fontWeight: '600' }}>{item.price * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>

                        {/* Отображение всех чеков из группы */}
                        {group.allReceipts.length > 0 && (
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
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <FileText size={16} style={{ color: '#4caf50' }} />
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32' }}>
                                Чеки об оплате ({group.allReceipts.length})
                              </span>
                            </div>
                            {group.allReceipts.map((receipt: any, index: number) => (
                              <div key={index} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '12px', color: '#2e7d32' }}>
                                    {receipt.type}: {receipt.amount} ₽
                                  </span>
                                  {receipt.receiptUrl && (
                                    <button
                                      onClick={() => setViewingReceipt(receipt.receiptUrl)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#4caf50',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        textDecoration: 'underline',
                                        fontWeight: '500'
                                      }}
                                    >
                                      📄 Чек {index + 1}
                                    </button>
                                  )}
                                </div>
                                <div style={{ fontSize: '10px', color: '#2e7d32' }}>
                                  {receipt.status === 'paid' ? '✓ Оплачено' : '⏳ Ожидает оплаты'}
                                  {receipt.paidAt && ` • ${new Date(receipt.paidAt).toLocaleString('ru-RU')}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>
                            Итого: {group.totalAmount + (group.orders[0]?.deliveryPrice || 0)} ₽
                          </div>
                          
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleSendToDelivery(group)}
                            style={{ 
                              fontSize: '14px', 
                              padding: '8px 16px',
                              background: '#4caf50'
                            }}
                          >
                            Отправить в доставку
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pools' && (
              <DeliveryPoolsTab 
                pools={deliveryPools}
                orders={orders}
                users={users}
                onUpdateOrder={onUpdateOrder}
              />
            )}

            {activeTab === 'in-progress' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  🚚 В доставке ({inProgressOrders.length})
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
                          {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items.filter((item: any) => item.productId !== "delivery") : []; })().map((item, index, filteredItems) => (
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
                            Итого: {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items.filter((item: any) => item.productId !== "delivery") : []; })().reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)} ₽
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
                  ✅ Выполненные заказы ({archivedOrders.length})
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
                          {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items.filter((item: any) => item.productId !== "delivery") : []; })().map((item, index, filteredItems) => (
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
                            Итого: {(() => { const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []); return Array.isArray(items) ? items.filter((item: any) => item.productId !== "delivery") : []; })().reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)} ₽
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
                
                {/* Статистика посещений */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    📊 Статистика посещений
                  </h3>
                  <VisitorStatsTab />
                </div>
                
                {/* Профиль менеджера */}
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  👤 Профиль
                </h3>
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

      {/* Модальное окно подтверждения группы заказов */}
      {selectedGroup && (
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
          <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Отправка заказов на оплату
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Покупатель:</strong> {selectedGroup.customerName} - {selectedGroup.customerPhone}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Адрес доставки:</strong> {selectedGroup.deliveryAddress}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Павильоны:</strong> {Array.from(selectedGroup.pavilions).join(', ')}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Сумма товаров:</strong> {selectedGroup.totalAmount} ₽
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Стоимость доставки:</strong> {deliveryPrices[selectedGroup.id] || 0} ₽
            </div>
            
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
              <strong>Итого с доставкой:</strong> {selectedGroup.totalAmount + (deliveryPrices[selectedGroup.id] || 0)} ₽
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => handleSendGroupToDelivery(selectedGroup)}
                disabled={!deliveryPrices[selectedGroup.id] || deliveryPrices[selectedGroup.id] <= 0}
              >
                Подтвердить отправку на оплату
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedGroup(null)}
              >
                Отмена
              </button>
            </div>
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
      
      {/* Модальное окно редактирования заказа */}
      {editingOrder && onUpdateOrder && (
        <EditOrderModal
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onUpdate={onUpdateOrder}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;



