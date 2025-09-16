import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { CartItem, User, Order } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCreateOrder: (order: Omit<Order, 'id'>) => void;
}

const Cart: React.FC<CartProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  user,
  onUpdateQuantity,
  onCreateOrder 
}) => {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user || user.role !== 'customer') {
      alert('Войдите как покупатель для оформления заказа');
      return;
    }

    const order = {
      customerId: user.id,
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total,
      status: 'pending' as const,
      createdAt: new Date(),
      deliveryAddress: 'г. Москва, ул. Примерная, д. 123, кв. 45'
    };

    onCreateOrder(order);
    alert('Заказ успешно создан!');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: 'white',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Корзина</h2>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
            Корзина пуста
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map(item => (
              <div key={item.product.id} style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '12px'
              }}>
                <img 
                  src={item.product.image}
                  alt={item.product.name}
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {item.product.name}
                  </h4>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#ff6b35' }}>
                    {item.product.price} ₽
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e0e0e0',
                      background: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e0e0e0',
                      background: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div style={{
          padding: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Итого:</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#ff6b35' }}>
              {total} ₽
            </span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleCheckout}
            style={{ width: '100%' }}
          >
            Оформить заказ
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;