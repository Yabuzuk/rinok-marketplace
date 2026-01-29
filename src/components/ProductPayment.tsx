import React, { useState } from 'react';
import { Order, User } from '../types';

interface ProductPaymentProps {
  order: Order;
  seller: User;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

const ProductPayment: React.FC<ProductPaymentProps> = ({
  order,
  seller,
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

  const openBank = (scheme: string) => {
    const amount = order.total;
    const phone = seller.cardPhone?.replace(/\D/g, '') || '';
    const purpose = `Заказ #${order.id.slice(-6)}`;
    
    // Пытаемся открыть приложение банка
    window.location.href = scheme;
    
    // Fallback через 1.5 секунды
    setTimeout(() => {
      const sbpLink = `https://qr.nspk.ru/proxyapp/v1/sbp/c2b/${phone}/${amount}?comment=${encodeURIComponent(purpose)}`;
      window.open(sbpLink, '_blank');
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            backgroundColor: '#4caf50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>
            🛒
          </div>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            margin: '0 0 8px 0',
            color: '#333'
          }}>
            Оплата товаров
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
          marginBottom: '24px',
          position: 'relative'
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
            {order.total} ₽
            <button
              onClick={() => copyToClipboard(order.total.toString(), 'Сумма скопирована')}
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
            К оплате за товары
          </div>
        </div>

        {/* Информация о получателе */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Номер заказа:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>#{order.id.slice(-6)}</span>
              <button
                onClick={() => copyToClipboard(order.id.slice(-6), 'Номер заказа скопирован')}
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
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Получатель:</span>
            <span style={{ fontWeight: '500' }}>{seller.cardHolderName}</span>
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Банк:</span>
            <span style={{ fontWeight: '500' }}>{seller.bankName}</span>
          </div>
          <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Телефон:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>{seller.cardPhone}</span>
              <button
                onClick={() => copyToClipboard(seller.cardPhone?.replace(/\D/g, '') || '', 'Номер телефона скопирован')}
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
                  backgroundColor: '#4caf50',
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
              >
                💳 Выбрать банк для оплаты
              </button>
              
              <button
                onClick={() => {
                  const amount = order.total;
                  const phone = seller.cardPhone?.replace(/\D/g, '') || '';
                  const purpose = `Заказ #${order.id.slice(-6)}`;
                  const sbpLink = `https://qr.nspk.ru/proxyapp/v1/sbp/c2b/${phone}/${amount}?comment=${encodeURIComponent(purpose)}`;
                  copyToClipboard(sbpLink, 'Ссылка СБП скопирована');
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
          ⚠️ После оплаты товаров нажмите кнопку "Товары оплачены"
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onPaymentConfirmed}
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
            ✓ Товары оплачены
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

export default ProductPayment;