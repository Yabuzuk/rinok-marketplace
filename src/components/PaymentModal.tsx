import React, { useState } from 'react';
import { Order, User } from '../types';
import ReceiptUpload from './ReceiptUpload';
import { uploadImage } from '../utils/supabase';
import { initPayment, PAYMENT_DETAILS } from '../utils/tinkoff';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  seller?: User;
  amount: number;
  type: 'full';
  onPaymentConfirmed: (receiptUrl?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  seller,
  amount,
  type,
  onPaymentConfirmed
}) => {
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');

  // Слушаем сообщения от iframe для закрытия после оплаты
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Проверяем, что сообщение от Тинькофф
      if (event.origin.includes('tinkoff') || event.origin.includes('tbank')) {
        // Если в URL есть payment=success, закрываем iframe
        if (event.data && typeof event.data === 'string' && event.data.includes('payment=success')) {
          setPaymentUrl('');
          onPaymentConfirmed();
          onClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPaymentConfirmed, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 2000);
    });
  };

  const handleReceiptUpload = async (file: File): Promise<string> => {
    try {
      const url = await uploadImage(file);
      if (url) {
        setReceiptUrl(url);
        return url;
      }
      throw new Error('Не удалось загрузить файл');
    } catch (error) {
      console.error('Ошибка загрузки чека:', error);
      throw error;
    }
  };

  const handleTinkoffPayment = async (method: 'card' | 'sbp') => {
    console.log('Payment method selected:', method);
    
    setIsProcessing(true);
    try {
      const uniqueOrderId = `${order.id}_${Date.now()}`;
      const payTypeParam = method === 'sbp' ? 'T' : 'O';
      console.log('Calling initPayment with payType:', payTypeParam);
      
      const response = await initPayment(
        uniqueOrderId,
        amount,
        `Оплата заказа №${order.id.slice(-6)}`,
        undefined,
        payTypeParam
      );

      if (response.Success && response.PaymentURL) {
        if (method === 'sbp') {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = response.PaymentURL;
          } else {
            window.open(response.PaymentURL, '_blank');
          }
          setIsProcessing(false);
        } else {
          setPaymentUrl(response.PaymentURL);
          setIsProcessing(false);
        }
      }
    } catch (error) {
      alert('Ошибка инициализации платежа. Попробуйте позже.');
      setIsProcessing(false);
    }
  };

  const paymentData = seller;
  const title = 'Оплата заказа';
  const icon = '💳';

  // Если есть URL платежной формы, показываем iframe
  if (paymentUrl) {
    return (
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
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          maxWidth: '500px',
          width: '100%',
          height: '80vh',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <button
            onClick={() => {
              setPaymentUrl('');
              setIsProcessing(false);
              onClose();
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              zIndex: 1
            }}
          >
            ×
          </button>
          
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: '0',
            color: '#333',
            textAlign: 'center'
          }}>
            Оплата заказа #{order.id.slice(-6)}
          </h3>
          
          <iframe
            src={paymentUrl}
            style={{
              width: '100%',
              flex: 1,
              border: 'none',
              borderRadius: '8px'
            }}
            title="Форма оплаты"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {!paymentUrl && (
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          ×
        </button>
        
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            {icon}
          </div>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            margin: '0 0 8px 0',
            color: '#333'
          }}>
            {title}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: 0
          }}>
            Заказ #{order.id.slice(-6)}
          </p>
        </div>
        
        {/* Сумма */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#4caf50',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {amount} ₽
            <button
              onClick={() => copyToClipboard(amount.toString(), 'Сумма скопирована')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px'
              }}
            >
              📋
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            К оплате
          </div>
        </div>

        {/* Реквизиты */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Реквизиты для оплаты:
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Номер заказа */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Номер заказа:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>#{order.id.slice(-6)}</span>
                <button
                  onClick={() => copyToClipboard(order.id.slice(-6), 'Номер заказа скопирован')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                >
                  📋
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Получатель:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>
                  {PAYMENT_DETAILS.cardHolderName}
                </span>
                <button
                  onClick={() => copyToClipboard(PAYMENT_DETAILS.cardHolderName, 'ФИО скопировано')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                >
                  📋
                </button>
              </div>
            </div>

            {/* Номер карты */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Номер карты:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                  {PAYMENT_DETAILS.cardNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(PAYMENT_DETAILS.cardNumber.replace(/\s/g, ''), 'Номер карты скопирован')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                >
                  📋
                </button>
              </div>
            </div>

            {/* Телефон */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Телефон:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                  {PAYMENT_DETAILS.phone}
                </span>
                <button
                  onClick={() => copyToClipboard(PAYMENT_DETAILS.phone, 'Телефон скопирован')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                >
                  📋
                </button>
              </div>
            </div>

            {/* Банк */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Банк:</span>
              <span style={{ fontWeight: '600' }}>
                {PAYMENT_DETAILS.bankName}
              </span>
            </div>
          </div>
        </div>

        {/* Загрузка чека */}
        {showReceiptUpload && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Прикрепите чек об оплате:
            </h4>
            <ReceiptUpload
              onUpload={handleReceiptUpload}
              currentReceipt={receiptUrl}
              onRemove={() => setReceiptUrl('')}
            />
          </div>
        )}

        {/* Предупреждение */}
        <div style={{ 
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#856404',
          textAlign: 'center'
        }}>
          ⚠️ После оплаты нажмите кнопку "Оплачено" и прикрепите чек
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => handleTinkoffPayment('card')}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '16px',
              background: isProcessing ? '#ccc' : 'linear-gradient(135deg, #FFDD2D 0%, #FFA800 100%)',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(255, 168, 0, 0.4)'
            }}
          >
            {isProcessing ? '⏳ Обработка...' : '💳 Оплатить картой'}
          </button>
          
          <button
            onClick={() => handleTinkoffPayment('sbp')}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '16px',
              background: isProcessing ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
            }}
          >
            {isProcessing ? '⏳ Обработка...' : '🏦 Оплатить через СБП'}
          </button>
          
          <div style={{
            padding: '12px',
            background: '#f0f7ff',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#0066cc',
            textAlign: 'center'
          }}>
            ℹ️ Оплата через Тинькофф: картой или СБП
          </div>
          
          {!showReceiptUpload ? (
            <button
              onClick={() => setShowReceiptUpload(true)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✓ Оплатил другим способом
            </button>
          ) : (
            <button
              onClick={() => {
                onPaymentConfirmed(receiptUrl);
                onClose();
              }}
              disabled={!receiptUrl}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: receiptUrl ? '#28a745' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: receiptUrl ? 'pointer' : 'not-allowed'
              }}
            >
              ✓ Подтвердить оплату с чеком
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#f8f9fa',
              color: '#6c757d',
              border: '1px solid #e9ecef',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default PaymentModal;