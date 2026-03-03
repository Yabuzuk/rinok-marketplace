import React, { useEffect } from 'react';
import { X, Plus, Minus, User, Users, RefreshCw } from 'lucide-react';
import { CartItem, User as UserType, Order, DeliveryType } from '../types';
import { DeliveryDateSelector } from './DeliveryDateSelector';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserType | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCreateOrder: (order: Omit<Order, 'id'>) => void;
  onCreateGroupOrder?: (data: any) => any;
}

const Cart: React.FC<CartProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  user,
  onUpdateQuantity,
  onCreateOrder,
  onCreateGroupOrder
}) => {
  const [selectedAddress, setSelectedAddress] = React.useState<string>('');
  const [deliveryDistance, setDeliveryDistance] = React.useState<number | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = React.useState(false);
  const [cartAddressSuggestions, setCartAddressSuggestions] = React.useState<string[]>([]);
  const [showCartSuggestions, setShowCartSuggestions] = React.useState(false);
  const [addressSuggestions, setAddressSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [addressInput, setAddressInput] = React.useState('');
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);
  
  // Новые состояния для выбора типа доставки
  const [deliveryType, setDeliveryType] = React.useState<DeliveryType>('individual');
  const [deliveryDate, setDeliveryDate] = React.useState<any>(null);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = React.useState<string | null>(null);

  // Обработчик изменения даты - сохраняем весь объект
  const handleDateChange = (dateValue: any) => {
    const { getAvailableDeliveryDates } = require('../types');
    const dates = getAvailableDeliveryDates();
    const dateObj = dates.find((d: any) => d.value === dateValue);
    setDeliveryDate(dateObj);
  };

  // Синхронизация корзины с пропсами
  React.useEffect(() => {
    // Обновляем локальное состояние только если items изменились
  }, [items]);

  
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
    if (isCreatingOrder) return;
    
    if (!user || user.role !== 'customer') {
      alert('Войдите как покупатель для оформления заказа');
      return;
    }
    
    // Проверяем активный групповой заказ
    const activeGroupOrderId = localStorage.getItem('activeGroupOrderId');
    if (activeGroupOrderId && onCreateGroupOrder) {
      try {
        // Добавляем товары к участнику
        const groupOrder = await onCreateGroupOrder({
          groupOrderId: activeGroupOrderId,
          userId: user.id,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          })),
          total
        });
        
        items.forEach(item => onUpdateQuantity(item.product.id, 0));
        localStorage.removeItem('activeGroupOrderId');
        onClose();
        
        // Используем код заказа для перехода
        if (groupOrder && groupOrder.code) {
          window.location.href = `/group-order/${groupOrder.code}`;
        } else {
          alert('Товары добавлены в совместный заказ!');
        }
        return;
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Совместный заказ не найден. Возможно, он был удален.');
        localStorage.removeItem('activeGroupOrderId');
        return;
      }
    }
    
    if (!selectedAddress || selectedAddress.trim() === '') {
      alert('Выберите адрес доставки');
      return;
    }
    
    // Для групповой доставки требуется выбор даты и времени
    if (deliveryType === 'auto_group') {
      if (!deliveryDate || !deliveryTimeSlot) {
        alert('Для групповой доставки выберите дату и время');
        return;
      }
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

    setIsCreatingOrder(true);
    
    try {
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
        
        // ВСЕ заказы идут на проверку менеджеру (наличие товара, цена)
        const orderStatus = 'pending';
        
        const order = {
          customerId: user.id,
          items: [
            ...pavilionItems.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              internalCode: item.product.internalCode
            })),
            // Доставку добавляет менеджер
          ],
          total: pavilionTotal + pavilionDeliveryFee,
          status: orderStatus as 'pending',
          createdAt: new Date(),
          deliveryAddress: selectedAddress || 'г. Москва, ул. Примерная, д. 123, кв. 45',
          pavilionNumber,
          // Новые поля для групповой доставки
          deliveryType: deliveryType,
          deliveryDate: deliveryDate?.date,
          deliveryTimeSlot: deliveryTimeSlot || undefined
        };
        
        console.log('Creating order for pavilion:', pavilionNumber, order);
        const createdOrder = await onCreateOrder(order);
        console.log('Order created successfully');
        return createdOrder;
      });

      const results = await Promise.all(orderPromises);
      console.log('All orders created:', results);
      
      alert('Заказы успешно созданы!');
      onClose();
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка при создании заказа. Попробуйте еще раз.');
    } finally {
      setIsCreatingOrder(false);
    }
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
          {/* Выбор типа доставки */}
          <DeliveryDateSelector
            selectedDate={deliveryDate?.value}
            selectedTimeSlot={deliveryTimeSlot}
            selectedDeliveryType={deliveryType}
            onDateChange={handleDateChange}
            onTimeSlotChange={setDeliveryTimeSlot}
            onDeliveryTypeChange={setDeliveryType}
          />
          
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
            disabled={isCreatingOrder}
            style={{ 
              width: '100%',
              opacity: isCreatingOrder ? 0.7 : 1,
              cursor: isCreatingOrder ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {isCreatingOrder ? (
              <>
                <span style={{ marginRight: '8px' }}>⏳</span>
                Оформляем заказ...
              </>
            ) : (
              'Оформить заказ'
            )}
          </button>
          
          {onCreateGroupOrder && deliveryType === 'neighbor_group' && (
            <button
              onClick={async () => {
                if (!user || user.role !== 'customer') {
                  alert('Войдите как покупатель для создания совместного заказа');
                  return;
                }
                if (!selectedAddress) {
                  alert('Выберите адрес доставки');
                  return;
                }
                if (!deliveryDate || !deliveryTimeSlot) {
                  alert('Выберите дату и время доставки');
                  return;
                }
                
                try {
                  console.log('Creating group order with:', { deliveryDate, deliveryTimeSlot });
                  const groupOrder = await onCreateGroupOrder({
                    items: items.map(item => ({
                      productId: item.product.id,
                      productName: item.product.name,
                      quantity: item.quantity,
                      price: item.product.price
                    })),
                    total,
                    address: selectedAddress,
                    deliveryDate: deliveryDate?.date || deliveryDate,
                    deliveryTimeSlot,
                    deliveryPoolId: `pool_${deliveryDate?.date || deliveryDate}_${deliveryTimeSlot}`
                  });
                  console.log('Group order created:', groupOrder);
                  
                  // Очищаем корзину через родительский компонент
                  items.forEach(item => onUpdateQuantity(item.product.id, 0));
                  
                  // Закрываем корзину и переходим на страницу заказа
                  onClose();
                  setTimeout(() => {
                    window.location.href = `/group-order/${groupOrder.code}`;
                  }, 100);
                } catch (error) {
                  console.error('Ошибка создания заказа:', error);
                  alert('Ошибка создания заказа. Попробуйте еще раз.');
                }
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              👥 Создать совместный заказ
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;