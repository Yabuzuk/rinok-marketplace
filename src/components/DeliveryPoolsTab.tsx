import React, { useState } from 'react';
import { CountdownTimer } from './CountdownTimer';
import { formatPoolName, getPoolStatusText } from '../utils/poolUtils';

interface DeliveryPoolsTabProps {
  pools: any[];
  orders: any[];
  users: any[];
  onUpdateOrder?: (orderId: string, updates: any) => Promise<void>;
}

export const DeliveryPoolsTab: React.FC<DeliveryPoolsTabProps> = ({ pools, orders, users, onUpdateOrder }) => {
  const [deliveryCosts, setDeliveryCosts] = useState<Record<string, number>>({});
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  // Группируем пулы по датам
  const poolsByDate = pools.reduce((acc, pool) => {
    if (!acc[pool.date]) {
      acc[pool.date] = [];
    }
    acc[pool.date].push(pool);
    return acc;
  }, {} as Record<string, any[]>);

  const getOrderDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    
    const customer = users.find(u => u.id === order.customerId);
    return {
      order,
      customerName: customer?.name || 'Неизвестный',
      customerPhone: customer?.phone || ''
    };
  };

  if (pools.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
        <p style={{ color: '#666' }}>Нет активных пулов доставки</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
        Пулы доставки
      </h2>

      {Object.entries(poolsByDate).map(([date, datePools]: [string, any]) => (
        <div key={date} style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#666' }}>
            {new Date(date).toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h3>

          {datePools.map((pool: any) => {
            const poolOrders = pool.orders
              .map((orderId: string) => getOrderDetails(orderId))
              .filter((details: any) => details !== null);

            return (
              <div key={pool.id} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {formatPoolName(pool)}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      Заказов в пуле: {poolOrders.length}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    {pool.status === 'open' ? (
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: '#4caf50',
                          marginBottom: '4px'
                        }}>
                          ⏰ Активный пул
                        </div>
                        <CountdownTimer 
                          targetTime={pool.closeTime}
                          showIcon={false}
                        />
                      </div>
                    ) : (
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: '#f5f5f5',
                        color: '#666'
                      }}>
                        🔒 Закрыт
                      </div>
                    )}
                  </div>
                </div>

                {poolOrders.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: '16px' }}>
                    Нет заказов в этом пуле
                  </p>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {poolOrders.map((details: any) => (
                        <div 
                          key={details.order.id}
                          style={{
                            padding: '12px',
                            background: '#f9f9f9',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {details.customerName} - {details.customerPhone}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                {details.order.deliveryAddress}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: '700', color: '#4caf50' }}>
                                {details.order.total} ₽
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                Заказ #{details.order.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Форма расчета доставки для закрытых пулов */}
                    {pool.status === 'closed' && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: '#fff3e0',
                        borderRadius: '8px',
                        border: '1px solid #ff9800'
                      }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#e65100' }}>
                          💰 Расчет доставки
                        </h5>
                        
                        <div style={{
                          marginBottom: '12px',
                          padding: '12px',
                          background: '#e3f2fd',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#1565c0'
                        }}>
                          💡 Стоимость доставки автоматически распределится пропорционально стоимости товаров в каждом заказе
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                            Общая стоимость доставки для всего пула:
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Введите стоимость"
                            value={deliveryCosts[pool.id] || ''}
                            onChange={(e) => setDeliveryCosts(prev => ({
                              ...prev,
                              [pool.id]: Number(e.target.value)
                            }))}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        {deliveryCosts[pool.id] > 0 && (
                          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#666' }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Автоматическое распределение:</div>
                            {poolOrders.map((details: any) => {
                              const totalOrdersAmount = poolOrders.reduce((sum: number, d: any) => sum + d.order.total, 0);
                              const share = Math.round((details.order.total / totalOrdersAmount) * deliveryCosts[pool.id]);
                              const percentage = Math.round((details.order.total / totalOrdersAmount) * 100);
                              return (
                                <div key={details.order.id} style={{ marginBottom: '4px' }}>
                                  • Заказ #{details.order.id.slice(-6)}: {share} ₽ ({percentage}%)
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        <button
                          className="btn btn-primary"
                          onClick={async () => {
                            if (!deliveryCosts[pool.id] || deliveryCosts[pool.id] <= 0) {
                              alert('Укажите общую стоимость доставки для пула');
                              return;
                            }
                            
                            try {
                              const totalOrdersAmount = poolOrders.reduce((sum: number, d: any) => sum + d.order.total, 0);
                              
                              // Устанавливаем дедлайн оплаты (25 минут от текущего момента)
                              const deadline = new Date();
                              deadline.setMinutes(deadline.getMinutes() + 25);
                              
                              const customerIds: string[] = [];
                              
                              // Автоматически распределяем доставку пропорционально
                              for (const details of poolOrders) {
                                const share = Math.round((details.order.total / totalOrdersAmount) * deliveryCosts[pool.id]);
                                await onUpdateOrder?.(details.order.id, {
                                  deliveryPrice: share,
                                  status: 'delivery_pending',
                                  deliveryPaymentDeadline: deadline.toISOString()
                                });
                                
                                if (details.order.customerId) {
                                  customerIds.push(details.order.customerId);
                                }
                              }
                              
                              // Уведомляем всех участников о расчете доставки
                              if (customerIds.length > 0) {
                                const { sendNotification } = await import('../utils/notifications');
                                await sendNotification(
                                  customerIds,
                                  'ОптБазар',
                                  `📦 Доставка рассчитана! Оплатите в течение 25 минут`
                                ).catch(console.error);
                              }
                              
                              alert('Доставка автоматически распределена и счета выставлены!');
                            } catch (error) {
                              alert('Ошибка выставления счетов');
                            }
                          }}
                          style={{ width: '100%', fontSize: '14px' }}
                        >
                          💰 Рассчитать и выставить счета за доставку
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
