import React, { useEffect } from 'react';
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
  const [deliveryDistance, setDeliveryDistance] = React.useState<number | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = React.useState(false);
  const [cartAddressSuggestions, setCartAddressSuggestions] = React.useState<string[]>([]);
  const [showCartSuggestions, setShowCartSuggestions] = React.useState(false);
  const [addressSuggestions, setAddressSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [addressInput, setAddressInput] = React.useState('');

  
  const getAddressSuggestions = React.useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?` +
        `apikey=41a4deeb-0548-4d8e-b897-3c4a6bc08032&` +
        `text=Новосибирская область, ${encodeURIComponent(query)}&` +
        `results=5&` +
        `bbox=82.5,54.5~83.5,55.5` // Ограничиваем Новосибирской областью
      );
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.results?.map((item: any) => item.title?.text || item.text) || [];
        setAddressSuggestions(suggestions.filter((addr: string) => addr.includes('Новосибирск')));
      }
    } catch (error) {
      console.error('Ошибка получения подсказок:', error);
    }
  }, []);
  
  const calculateDeliveryDistance = React.useCallback(async (toAddress: string): Promise<number> => {
    if (!toAddress || !toAddress.toLowerCase().includes('новосибирск')) {
      return 0;
    }
    
    try {
      const geocodeResponse = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?` +
        `apikey=41a4deeb-0548-4d8e-b897-3c4a6bc08032&` +
        `text=${encodeURIComponent(toAddress)}&` +
        `results=1`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        const coords = geocodeData.results?.[0]?.position;
        
        if (coords) {
          const fromLat = 54.989347;
          const fromLon = 82.897325;
          const toLat = coords[1];
          const toLon = coords[0];
          
          const R = 6371;
          const dLat = (toLat - fromLat) * Math.PI / 180;
          const dLon = (toLon - fromLon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return Math.round(distance * 1.3);
        }
      }
    } catch (error) {
      console.error('Ошибка расчета расстояния:', error);
    }
    
    const distanceMap: Record<string, number> = {
      'центральный': 15, 'железнодорожный': 20, 'заельцовский': 25,
      'калининский': 30, 'кировский': 18, 'ленинский': 22,
      'октябрьский': 16, 'первомайский': 28, 'советский': 20, 'дзержинский': 24
    };
    
    const addressLower = toAddress.toLowerCase();
    for (const [district, distance] of Object.entries(distanceMap)) {
      if (addressLower.includes(district)) {
        return distance;
      }
    }
    
    return 20;
  }, []);
  
  React.useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user?.addresses, selectedAddress]);
  
  React.useEffect(() => {
    if (selectedAddress && isOpen) {
      setIsCalculatingDelivery(true);
      calculateDeliveryDistance(selectedAddress)
        .then(distance => {
          setDeliveryDistance(distance);
          setIsCalculatingDelivery(false);
        })
        .catch(() => {
          setDeliveryDistance(20);
          setIsCalculatingDelivery(false);
        });
    }
  }, [selectedAddress, isOpen, calculateDeliveryDistance]);
  
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const deliveryFee = 0; // Доставку добавляет менеджер
  const totalWithDelivery = total;

  const handleCheckout = async () => {
    if (!user || user.role !== 'customer') {
      alert('Войдите как покупатель для оформления заказа');
      return;
    }
    
    if (!selectedAddress || selectedAddress.trim() === '') {
      alert('Выберите адрес доставки');
      return;
    }
    
    if (deliveryDistance === 0 && selectedAddress) {
      alert('Доставка осуществляется только по Новосибирской области');
      return;
    }

    const invalidItems = items.filter(item => item.quantity < item.product.minOrderQuantity);
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => 
        `${item.product.name} (мин. ${item.product.minOrderQuantity} кг)`
      ).join(', ');
      alert(`Недостаточное количество для: ${itemNames}`);
      return;
    }

    const itemsByPavilion = items.reduce((acc, item) => {
      const pavilion = item.product.pavilionNumber;
      if (!acc[pavilion]) {
        acc[pavilion] = [];
      }
      acc[pavilion].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    const orderPromises = Object.entries(itemsByPavilion).map(async ([pavilionNumber, pavilionItems]) => {
      const pavilionTotal = pavilionItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      
      const pavilionDeliveryFee = 0; // Доставку добавляет менеджер
      
      const order = {
        customerId: user.id,
        items: [
          ...pavilionItems.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          })),
          // Доставку добавляет менеджер
        ],
        total: pavilionTotal + pavilionDeliveryFee,
        status: 'pending' as const,
        createdAt: new Date(),
        deliveryAddress: selectedAddress || 'г. Москва, ул. Примерная, д. 123, кв. 45',
        pavilionNumber
      };

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
      width: window.innerWidth <= 768 ? '100vw' : '400px',
      height: window.innerWidth <= 768 ? '100dvh' : '100vh',
      maxHeight: window.innerWidth <= 768 ? '100dvh' : '100vh',
      background: 'white',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
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
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Адрес доставки:
            </label>
            {user?.addresses && user.addresses.length > 0 ? (
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
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={selectedAddress}
                  onChange={async (e) => {
                    setSelectedAddress(e.target.value);
                    if (e.target.value.length >= 3) {
                      try {
                        const response = await fetch(
                          `https://suggest-maps.yandex.ru/v1/suggest?` +
                          `apikey=41a4deeb-0548-4d8e-b897-3c4a6bc08032&` +
                          `text=${encodeURIComponent('Новосибирск ' + e.target.value)}&` +
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
                          setCartAddressSuggestions(suggestions.slice(0, 5));
                          setShowCartSuggestions(true);
                        }
                      } catch (error) {
                        console.error('Ошибка получения подсказок:', error);
                      }
                    } else {
                      setCartAddressSuggestions([]);
                      setShowCartSuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowCartSuggestions(false), 200)}
                  placeholder="Введите адрес доставки в Новосибирске"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {showCartSuggestions && cartAddressSuggestions.length > 0 && (
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
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {cartAddressSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          borderBottom: index < cartAddressSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                        onMouseDown={() => {
                          setSelectedAddress(suggestion);
                          setShowCartSuggestions(false);
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
            )}
          </div>
          
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