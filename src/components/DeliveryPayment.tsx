import React, { useState } from 'react';

interface DeliveryPaymentProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

const DeliveryPayment: React.FC<DeliveryPaymentProps> = ({ 
  amount, 
  isOpen, 
  onClose, 
  onPaymentConfirmed 
}) => {
  const [showBankList, setShowBankList] = useState(false);
  
  if (!isOpen) return null;

  const banks = [
    { name: 'Сбербанк', scheme: 'sberbankonline://' },
    { name: 'Тинькофф', scheme: 'tinkoffbank://' },
    { name: 'ВТБ', scheme: 'vtb24mobile://' },
    { name: 'Альфа‑Банк', scheme: 'alfabank://' },
    { name: 'Райффайзен', scheme: 'raiffeisenbank://' },
    { name: 'Газпромбанк', scheme: 'gpbank://' },
    { name: 'ПСБ', scheme: 'psbank://' },
    { name: 'Совкомбанк', scheme: 'sovcombank://' }
  ];

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
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

  const openBank = (scheme: string) => {
    const phone = '79142528674';
    const bankId = '100000000004';
    
    // Пытаемся открыть приложение банка
    window.location.href = scheme;
    
    // Fallback через 1.5 секунды
    setTimeout(() => {
      const sbpUrl = `https://qr.nspk.ru/AD10006M8KH234K7DLK6?type=02&bank=${bankId}&sum=${amount}&cur=RUB&phone=${phone}&name=Баулин%20Александр%20Валерьевич`;
      window.open(sbpUrl, '_blank');
    }, 1500);
  };

  const generateSBPLink = () => {
    // СБП ссылка для оплаты доставки
    // Получатель: Баулин Александр Валерьевич
    // Телефон: +79142528674
    // Банк: Сбербанк
    const phone = '79142528674';
    const bankId = '100000000004'; // Сбербанк
    const sbpUrl = `https://qr.nspk.ru/AD10006M8KH234K7DLK6?type=02&bank=${bankId}&sum=${amount}&cur=RUB&phone=${phone}&name=Баулин%20Александр%20Валерьевич`;
    return sbpUrl;
  };

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
        padding: '32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        position: 'relative'
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
            color: '#999',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#ff9800',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>
            🚚
          </div>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            margin: '0 0 8px 0',
            color: '#333'
          }}>
            Оплата доставки
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: 0
          }}>
            Доставка заказа
          </p>
        </div>
        
        {/* Сумма */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#ff9800',
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
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              📋
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            К оплате за доставку
          </div>
        </div>

        {/* Информация о получателе */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Получатель:</span>
            <span style={{ fontWeight: '500' }}>Баулин Александр Валерьевич</span>
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Банк:</span>
            <span style={{ fontWeight: '500' }}>Сбербанк</span>
          </div>
          <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Телефон:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>+7 914 252-86-74</span>
              <button
                onClick={() => copyToClipboard('+79142528674', 'Номер телефона скопирован')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Кнопки оплаты */}
        <div style={{ marginBottom: '20px' }}>
          {!showBankList ? (
            <>
              <button
                onClick={() => setShowBankList(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f57c00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff9800'}
              >
                💳 Выбрать банк для оплаты
              </button>
              
              <button
                onClick={() => {
                  const phone = '79142528674';
                  const bankId = '100000000004';
                  const sbpUrl = `https://qr.nspk.ru/AD10006M8KH234K7DLK6?type=02&bank=${bankId}&sum=${amount}&cur=RUB&phone=${phone}&name=Баулин%20Александр%20Валерьевич`;
                  copyToClipboard(sbpUrl, 'Ссылка СБП скопирована');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              >
                📋 Скопировать ссылку СБП
              </button>
            </>
          ) : (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Выберите ваш банк</h4>
                <button
                  onClick={() => setShowBankList(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666',
                    padding: '4px 8px'
                  }}
                >
                  ← Назад
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {banks.map((bank) => (
                  <button
                    key={bank.name}
                    onClick={() => openBank(bank.scheme)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      marginBottom: '8px',
                      fontSize: '16px',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    🏦 {bank.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Подсказка */}
        <div style={{ 
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#856404',
          textAlign: 'center'
        }}>
          ⚠️ После оплаты нажмите кнопку "Доставка оплачена"
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              onPaymentConfirmed();
              onClose();
            }}
            style={{
              flex: 1,
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
            ✓ Доставка оплачена
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
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
  );
};

export default DeliveryPayment;