import React from 'react';
import { Order, User, Product } from '../types';
import { groupOrderByPavilions, getOrderPaymentSummary } from '../utils/orderUtils';
import SBPPayment from './SBPPayment';

interface PaymentByPavilionsProps {
  order: Order;
  users: User[];
  products: Product[];
  onPaymentComplete: (pavilionNumber: string) => void;
}

const PaymentByPavilions: React.FC<PaymentByPavilionsProps> = ({
  order,
  users,
  products,
  onPaymentComplete
}) => {
  const [selectedPayment, setSelectedPayment] = React.useState<string | null>(null);
  
  const pavilionGroups = groupOrderByPavilions(order, products);
  const paymentSummary = getOrderPaymentSummary(order);
  
  const handlePaymentClick = (pavilionNumber: string) => {
    setSelectedPayment(pavilionNumber);
  };
  
  const handlePaymentClose = () => {
    setSelectedPayment(null);
  };
  
  const getPaymentButtonText = (pavilionNumber: string, isPaid: boolean) => {
    if (isPaid) return '✅ Оплачено';
    return 'Оплатить СБП';
  };
  
  const getPaymentButtonStyle = (isPaid: boolean) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: isPaid ? 'default' : 'pointer',
    background: isPaid ? '#e8f5e8' : 'linear-gradient(135deg, #ff6b35, #f7931e)',
    color: isPaid ? '#2e7d32' : 'white',
    opacity: isPaid ? 0.8 : 1
  });

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Оплата заказа #{order.id.slice(-6)}
      </h3>
      
      {pavilionGroups.map(group => {
        const isPaid = order.payments?.[group.pavilionNumber]?.status === 'paid';
        const seller = users.find(u => u.id === group.sellerId);
        
        return (
          <div key={group.pavilionNumber} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            marginBottom: '8px',
            background: isPaid ? '#f8fff8' : 'white'
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                Павильон {group.pavilionNumber}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {group.items.length} товар(ов) • {seller?.name || 'Продавец'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                {group.total} ₽
              </div>
              <button
                onClick={() => !isPaid && handlePaymentClick(group.pavilionNumber)}
                style={getPaymentButtonStyle(isPaid)}
                disabled={isPaid}
              >
                {getPaymentButtonText(group.pavilionNumber, isPaid)}
              </button>
            </div>
          </div>
        );
      })}
      
      {order.deliveryPrice && order.deliveryPrice > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          marginBottom: '8px',
          background: order.payments?.delivery?.status === 'paid' ? '#f8fff8' : 'white'
        }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              Доставка
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Служба доставки
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
              {order.deliveryPrice} ₽
            </div>
            <button
              onClick={() => order.payments?.delivery?.status !== 'paid' && handlePaymentClick('delivery')}
              style={getPaymentButtonStyle(order.payments?.delivery?.status === 'paid')}
              disabled={order.payments?.delivery?.status === 'paid'}
            >
              {getPaymentButtonText('delivery', order.payments?.delivery?.status === 'paid')}
            </button>
          </div>
        </div>
      )}
      
      <div style={{
        borderTop: '2px solid #f0f0f0',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>Итого к оплате:</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Оплачено: {paymentSummary.paidAmount} ₽ из {paymentSummary.totalOrder} ₽
            </div>
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: paymentSummary.isFullyPaid ? '#4caf50' : '#ff6b35'
          }}>
            {paymentSummary.isFullyPaid ? '✅ Оплачено' : `${paymentSummary.remainingAmount} ₽`}
          </div>
        </div>
      </div>
      
      {selectedPayment && (
        <SBPPayment
          isOpen={true}
          onClose={handlePaymentClose}
          order={{
            ...order,
            total: selectedPayment === 'delivery' 
              ? order.deliveryPrice || 0
              : pavilionGroups.find(g => g.pavilionNumber === selectedPayment)?.total || 0
          }}
          seller={selectedPayment === 'delivery' 
            ? { name: 'Служба доставки', cardHolderName: 'ООО "Доставка"', cardPhone: '+7 (999) 123-45-67', bankName: 'Сбербанк' } as User
            : users.find(u => u.id === pavilionGroups.find(g => g.pavilionNumber === selectedPayment)?.sellerId) || null
          }
          onPaymentComplete={() => {
            onPaymentComplete(selectedPayment);
            handlePaymentClose();
          }}
        />
      )}
    </div>
  );
};

export default PaymentByPavilions;