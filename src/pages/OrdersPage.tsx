import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock } from 'lucide-react';
import { Order, User } from '../types';

interface OrdersPageProps {
  user: User;
  orders: Order[];
  onCancelOrder?: (orderId: string) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ user, orders, onCancelOrder }) => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const userOrders = orders.filter(order => order.customerId === user.id);
  
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
      case 'confirmed': return 'Подтвержден продавцом';
      case 'manager_confirmed': return 'Подтвержден менеджером';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#4caf50'
            }}
          >
            <ArrowLeft size={20} />
            Назад
          </button>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>
          Мои заказы
        </h1>

        {userOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
            <p style={{ color: '#666' }}>У вас пока нет заказов</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userOrders.map(order => (
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
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>
                      {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              <span>Итого:</span>
              <span>{selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (selectedOrder.deliveryPrice || 0)} ₽</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedOrder.status === 'manager_confirmed' && (
                <form 
                  action="https://securepay.tinkoff.ru/html/payForm/initialize" 
                  method="POST"
                  style={{ width: '100%' }}
                >
                  <input type="hidden" name="TerminalKey" value="ВАШ_TERMINAL_KEY" />
                  <input type="hidden" name="Amount" value={(selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (selectedOrder.deliveryPrice || 0)) * 100} />
                  <input type="hidden" name="OrderId" value={selectedOrder.id} />
                  <input type="hidden" name="Description" value={`Оплата заказа #${selectedOrder.id.slice(-6)}`} />
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Оплатить картой ({selectedOrder.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (selectedOrder.deliveryPrice || 0)} ₽)
                  </button>
                </form>
              )}
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed' || selectedOrder.status === 'manager_confirmed') && (
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
    </div>
  );
};

export default OrdersPage;