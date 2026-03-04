import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, MapPin, Package, Share2, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CountdownTimer } from '../components/CountdownTimer';
import { ParticipantCard } from '../components/ParticipantCard';
import { DELIVERY_TIME_SLOTS } from '../types';

interface GroupOrderPageProps {
  groupOrders: any[];
  currentUser: any;
  onPayProducts: (groupOrderId: string, userId: string) => void;
  onPayDelivery: (groupOrderId: string, userId: string) => void;
  onLeaveGroupOrder: (groupOrderId: string, userId: string) => void;
  onRemoveItemFromGroupOrder?: (groupOrderId: string, userId: string, itemIndex: number) => void;
}

const GroupOrderPage: React.FC<GroupOrderPageProps> = ({
  groupOrders,
  currentUser,
  onPayProducts,
  onPayDelivery,
  onLeaveGroupOrder,
  onRemoveItemFromGroupOrder
}) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Обработка результата платежа из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const groupOrderId = localStorage.getItem('lastGroupOrderId');
    const paymentType = localStorage.getItem('lastPaymentType');
    
    if (paymentStatus && groupOrderId && paymentType) {
      window.history.replaceState({}, '', window.location.pathname);
      
      if (paymentStatus === 'success') {
        if (paymentType === 'products') {
          onPayProducts(groupOrderId, currentUser?.id || '');
          alert('✅ Товары успешно оплачены!');
        } else if (paymentType === 'delivery') {
          onPayDelivery(groupOrderId, currentUser?.id || '');
          alert('✅ Доставка успешно оплачена!');
        }
        localStorage.removeItem('lastGroupOrderId');
        localStorage.removeItem('lastPaymentType');
        localStorage.removeItem('lastPaymentId');
      } else if (paymentStatus === 'fail') {
        alert('❌ Не получилось оплатить. Попробуйте еще раз.');
      }
    }
  }, [onPayProducts, onPayDelivery, currentUser]);

  const groupOrder = groupOrders.find(g => g.code === code);
  
  const poolCloseTime = useMemo(() => {
    if (!groupOrder?.deliveryDate || !groupOrder?.deliveryTimeSlot) {
      console.log('❌ Нет данных для расчета poolCloseTime:', { deliveryDate: groupOrder?.deliveryDate, deliveryTimeSlot: groupOrder?.deliveryTimeSlot });
      return null;
    }
    const slot = DELIVERY_TIME_SLOTS.find((s: any) => s.id === groupOrder.deliveryTimeSlot);
    if (!slot) {
      console.log('❌ Слот не найден:', groupOrder.deliveryTimeSlot);
      return null;
    }
    const result = `${groupOrder.deliveryDate}T${slot.closeTime}:00`;
    console.log('✅ poolCloseTime рассчитан:', result);
    return result;
  }, [groupOrder?.deliveryDate, groupOrder?.deliveryTimeSlot]);
  
  // Автоматически присоединяем пользователя к заказу при первом посещении
  useEffect(() => {
    if (currentUser && groupOrder && !groupOrder.participants.find((p: any) => p.userId === currentUser?.id) && groupOrder.status === 'open') {
      // Сохраняем ID заказа для добавления товаров
      localStorage.setItem('activeGroupOrderId', groupOrder.id);
    }
  }, [currentUser, groupOrder]);

  if (!groupOrder) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Совместный заказ не найден</h2>
        <button 
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          На главную
        </button>
      </div>
    );
  }

  const currentParticipant = groupOrder.participants.find((p: any) => p.userId === currentUser?.id);
  const isOrganizer = groupOrder.organizerId === currentUser?.id;
  const allProductsPaid = groupOrder.participants.every((p: any) => p.productsPaid);
  const allDeliveryPaid = groupOrder.participants.every((p: any) => p.deliveryPaid);
  const shareUrl = `${window.location.origin}/group-order/${code}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Совместный заказ на ОптБазар',
          text: `Присоединяйтесь к совместному заказу! Код: ${code}`,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Заголовок */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Users size={28} />
          <h1 style={{ margin: 0, fontSize: '24px' }}>Совместный заказ</h1>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          {code}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
          <MapPin size={16} />
          <span>{groupOrder.address}</span>
        </div>
      </div>

      {/* Таймер до закрытия пула */}
      {groupOrder.deliveryPoolId && poolCloseTime && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={20} color="#FF6B00" />
            <span style={{ fontWeight: '600' }}>До закрытия пула:</span>
          </div>
          <CountdownTimer targetTime={poolCloseTime} />
        </div>
      )}

      {/* Кнопки поделиться */}
      {groupOrder.status === 'open' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Пригласить соседей</h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={handleCopyCode}
              style={{
                flex: 1,
                padding: '12px',
                background: copied ? '#10B981' : 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Скопировано!' : 'Копировать код'}
            </button>
            
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                padding: '12px',
                background: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Share2 size={20} />
              Поделиться
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '12px',
                background: copied ? '#10B981' : '#F3F4F6',
                color: copied ? 'white' : '#374151',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Скопировано!' : 'Копировать ссылку'}
            </button>
          </div>

          <button
            onClick={() => setShowQR(!showQR)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {showQR ? 'Скрыть QR-код' : 'Показать QR-код'}
          </button>

          {showQR && (
            <div style={{
              marginTop: '16px',
              padding: '20px',
              background: 'white',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <QRCodeSVG value={shareUrl} size={200} />
            </div>
          )}
        </div>
      )}

      {/* Участники */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
          Участники ({groupOrder.participants.length})
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groupOrder.participants.map((participant: any, index: number) => (
            <ParticipantCard
              key={index}
              participant={participant}
              isOrganizer={participant.userId === groupOrder.organizerId}
              deliveryShare={groupOrder.deliveryShares?.[participant.userId]}
              isCurrentUser={participant.userId === currentUser?.id}
              onRemoveItem={participant.userId === currentUser?.id && !participant.productsPaid && onRemoveItemFromGroupOrder ? (itemIndex) => {
                if (window.confirm('Удалить этот товар?')) {
                  onRemoveItemFromGroupOrder(groupOrder.id, currentUser.id, itemIndex);
                }
              } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Информация о доставке */}
      {groupOrder.deliveryPrice && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Доставка</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B00', marginBottom: '8px' }}>
            {groupOrder.deliveryPrice}₽
          </div>
          {currentParticipant && groupOrder.deliveryShares?.[currentParticipant.userId] && (
            <div style={{ color: '#6B7280' }}>
              Ваша доля: {groupOrder.deliveryShares[currentParticipant.userId]}₽
            </div>
          )}
        </div>
      )}

      {/* Действия */}
      {currentUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Кнопка добавления товаров доступна всем (участникам и новым пользователям) */}
          {(!currentParticipant || !currentParticipant.productsPaid) && (
            <button
              onClick={() => {
                // Сохраняем ID группового заказа для добавления товаров
                localStorage.setItem('activeGroupOrderId', groupOrder.id);
                navigate('/');
              }}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px'
              }}
            >
              🛒 {currentParticipant ? 'Добавить товары' : 'Присоединиться и добавить товары'}
            </button>
          )}
          
          {currentParticipant && !currentParticipant.productsPaid && groupOrder.participants.length >= 2 && (
            <button
              onClick={async () => {
                try {
                  const { initPayment } = await import('../utils/tinkoff');
                  const shortId = `g_${groupOrder.id.slice(-8)}_${Date.now()}`;
                  const response = await initPayment(
                    shortId,
                    currentParticipant.total,
                    `Оплата товаров в совместном заказе ${groupOrder.code}`,
                    undefined,
                    'O'
                  );
                  
                  if (response.Success && response.PaymentURL) {
                    localStorage.setItem('lastPaymentId', response.PaymentId);
                    localStorage.setItem('lastGroupOrderId', groupOrder.id);
                    localStorage.setItem('lastPaymentType', 'products');
                    window.location.href = response.PaymentURL;
                  }
                } catch (error) {
                  alert('Ошибка инициализации платежа');
                }
              }}
              className="smooth-button"
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Package size={24} />
              💳 Оплатить товары ({currentParticipant.total}₽)
            </button>
          )}
          
          {currentParticipant && !currentParticipant.productsPaid && groupOrder.participants.length < 2 && (
            <div style={{
              padding: '16px',
              background: '#fff3cd',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#856404',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⏳ Ожидание участников... Минимум 2 человека для оплаты
            </div>
          )}

          {currentParticipant && currentParticipant.productsPaid && !currentParticipant.deliveryPaid && groupOrder.deliveryShares?.[currentParticipant.userId] && (
            <button
              onClick={async () => {
                try {
                  const { initPayment } = await import('../utils/tinkoff');
                  const shortId = `gd_${groupOrder.id.slice(-8)}_${Date.now()}`;
                  const response = await initPayment(
                    shortId,
                    groupOrder.deliveryShares[currentParticipant.userId],
                    `Оплата доставки в совместном заказе ${groupOrder.code}`,
                    undefined,
                    'O'
                  );
                  
                  if (response.Success && response.PaymentURL) {
                    localStorage.setItem('lastPaymentId', response.PaymentId);
                    localStorage.setItem('lastGroupOrderId', groupOrder.id);
                    localStorage.setItem('lastPaymentType', 'delivery');
                    window.location.href = response.PaymentURL;
                  }
                } catch (error) {
                  alert('Ошибка инициализации платежа');
                }
              }}
              className="smooth-button"
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              💳 Оплатить доставку ({groupOrder.deliveryShares[currentParticipant.userId]}₽)
            </button>
          )}

          {currentParticipant && !currentParticipant.productsPaid && (
            <button
              onClick={() => {
                if (window.confirm('Вы уверены, что хотите выйти из совместного заказа?')) {
                  onLeaveGroupOrder(groupOrder.id, currentUser.id);
                  navigate('/');
                }
              }}
              style={{
                padding: '16px',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              Выйти из заказа
            </button>
          )}
        </div>
      )}

      {/* Статусы */}
      {allProductsPaid && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#D1FAE5',
          borderRadius: '12px',
          color: '#065F46',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          ✅ Все участники оплатили товары
        </div>
      )}

      {allDeliveryPaid && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#D1FAE5',
          borderRadius: '12px',
          color: '#065F46',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          ✅ Все участники оплатили доставку
        </div>
      )}
    </div>
  );
};

export default GroupOrderPage;
