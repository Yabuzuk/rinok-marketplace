import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Order, User } from '../types';

interface OrdersPageProps {
  user: User;
  orders: Order[];
}

const OrdersPage: React.FC<OrdersPageProps> = ({ user, orders }) => {
  const navigate = useNavigate();
  
  const userOrders = orders.filter(order => order.customerId === user.id);

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
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                      Заказ #{order.id.slice(-8)}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: order.status === 'pending' ? '#fff3cd' : 
                               order.status === 'confirmed' ? '#d1ecf1' : 
                               order.status === 'preparing' ? '#d4edda' : 
                               order.status === 'delivered' ? '#d4edda' : '#f8d7da',
                    color: order.status === 'pending' ? '#856404' : 
                          order.status === 'confirmed' ? '#0c5460' : 
                          order.status === 'preparing' ? '#155724' : 
                          order.status === 'delivered' ? '#155724' : '#721c24'
                  }}>
                    {order.status === 'pending' ? 'Ожидает подтверждения' :
                     order.status === 'confirmed' ? 'Подтвержден' :
                     order.status === 'preparing' ? 'Готовится' :
                     order.status === 'delivered' ? 'Доставлен' : order.status}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 0',
                      borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span>{item.productName} x {item.quantity}</span>
                      <span style={{ fontWeight: '600' }}>{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>
                  Итого: {order.total} ₽
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;