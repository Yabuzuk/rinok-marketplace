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
  const [selectedAddress, setSelectedAddress] = React.useState<string>('');
  
  // Устанавливаем первый адрес по умолчанию
  React.useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user?.addresses, selectedAddress]);
  
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Расчет стоимости доставки
  const calculateDeliveryFee = (address: string): number => {
    if (!address || !address.toLowerCase().includes('новосибирск')) {
      return 0; // Доставка только по Новосибирской области
    }
    
    // Примерное расстояние в зависимости от района (в км)
    const distanceMap: Record<string, number> = {
      'центральный': 15,
      'железнодорожный': 20,
      'заельцовский': 25,
      'калининский': 30,
      'кировский': 18,
      'ленинский': 22,
      'октябрьский': 16,
      'первомайский': 28,
      'советский': 20,
      'дзержинский': 24
    };
    
    // Ищем район в адресе
    const addressLower = address.toLowerCase();
    for (const [district, distance] of Object.entries(distanceMap)) {
      if (addressLower.includes(district)) {
        return distance * 40; // 40 руб за км
      }
    }
    
    // По умолчанию 20 км если район не определен
    return 20 * 40;
  };
  
  const deliveryFee = calculateDeliveryFee(selectedAddress);
  const totalWithDelivery = total + deliveryFee;

  const handleCheckout = async () => {
    if (!user || user.role !== 'customer') {
      alert('Войдите как покупатель для оформления заказа');
      return;
    }
    
    // Проверяем возможность доставки
    if (deliveryFee === 0 && selectedAddress && !selectedAddress.toLowerCase().includes('новосибирск')) {
      alert('Доставка осуществляется только по Новосибирской области');
      return;
    }

    // Проверяем минимальное количество для каждого товара
    const invalidItems = items.filter(item => item.quantity < item.product.minOrderQuantity);
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => 
        `${item.product.name} (мин. ${item.product.minOrderQuantity} кг)`
      ).join(', ');
      alert(`Недостаточное количество для: ${itemNames}`);
      return;
    }

    // Группируем товары по павильонам
    const itemsByPavilion = items.reduce((acc, item) => {
      const pavilion = item.product.pavilionNumber;
      if (!acc[pavilion]) {
        acc[pavilion] = [];
      }
      acc[pavilion].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    // Создаем отдельный заказ для каждого павильона
    const orderPromises = Object.entries(itemsByPavilion).map(async ([pavilionNumber, pavilionItems]) => {
      const pavilionTotal = pavilionItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      
      const pavilionDeliveryFee = calculateDeliveryFee(selectedAddress || '');
      
      const order = {
        customerId: user.id,
        items: [
          ...pavilionItems.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          })),
          ...(pavilionDeliveryFee > 0 ? [{
            productId: 'delivery',
            productName: 'Доставка',
            quantity: 1,
            price: pavilionDeliveryFee
          }] : [])
        ],
        total: pavilionTotal + pavilionDeliveryFee,
        status: 'pending' as const,
        createdAt: new Date(),
        deliveryAddress: selectedAddress || 'г. Москва, ул. Примерная, д. 123, кв. 45',
        pavilionNumber
      };
      
      console.log('Creating order for pavilion:', pavilionNumber, 'type:', typeof pavilionNumber);

      return await onCreateOrder(order);
    });

    await Promise.all(orderPromises);

    alert('Заказы успешно созданы!');
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
            {items.map(item => {
              const isInsufficientQuantity = item.quantity < item.product.minOrderQuantity;
              return (
              <div key={item.product.id} style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                border: `1px solid ${isInsufficientQuantity ? '#f44336' : '#f0f0f0'}`,
                borderRadius: '12px',
                background: isInsufficientQuantity ? 'rgba(244, 67, 54, 0.05)' : 'white'
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
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
                    {item.product.price} ₽
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: isInsufficientQuantity ? '#f44336' : '#666',
                    fontWeight: isInsufficientQuantity ? '600' : 'normal'
                  }}>
                    Мин. заказ: {item.product.minOrderQuantity} кг
                    {isInsufficientQuantity && ' ⚠️'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - (item.product.minOrderQuantity || 1))}
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
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      if (newQuantity >= 1) {
                        onUpdateQuantity(item.product.id, newQuantity);
                      }
                    }}
                    style={{
                      width: '50px',
                      textAlign: 'center',
                      fontWeight: '600',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      padding: '4px'
                    }}
                  />
                  <button 
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + (item.product.minOrderQuantity || 1))}
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
            );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div style={{
          padding: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          {/* Выбор адреса доставки */}
          {user?.addresses && user.addresses.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Адрес доставки:
              </label>
              <select 
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {user.addresses.map((address, index) => (
                  <option key={index} value={address}>
                    {address}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>Товары:</span>
              <span style={{ fontSize: '16px' }}>{total} ₽</span>
            </div>
            
            {deliveryFee > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>Доставка:</span>
                <span style={{ fontSize: '16px' }}>{deliveryFee} ₽</span>
              </div>
            )}
            
            {deliveryFee === 0 && selectedAddress && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                color: '#f44336'
              }}>
                <span style={{ fontSize: '14px' }}>Доставка только по Новосибирской области</span>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Итого:</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
                {totalWithDelivery} ₽
              </span>
            </div>
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