import React, { useState } from 'react';
import { Order, User } from '../types';

interface SBPPaymentProps {
  order: Order;
  seller: User | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete?: () => void;
  onPaymentConfirmed?: () => void;
}

const SBPPayment: React.FC<SBPPaymentProps> = ({
  order,
  seller,
  isOpen,
  onClose,
  onPaymentComplete,
  onPaymentConfirmed
}) => {
  const [showBankList, setShowBankList] = useState(false);
  
  if (!isOpen || !seller) return null;

  const banks = [
    { name: 'Сбербанк' },
    { name: 'Тинькофф' },
    { name: 'ВТБ' },
    { name: 'Альфа‑Банк' },
    { name: 'Райффайзен' },
    { name: 'Газпромбанк' },
    { name: 'ПСБ' },
    { name: 'Совкомбанк' }
  ];

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Создаем временное уведомление
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

  const openBank = (bankName: string) => {
    const amount = order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0);
    const phone = seller.cardPhone?.replace(/\D/g, '') || '';
    const purpose = `Заказ #${order.id.slice(-6)}`;
    
    // Создаем СБП ссылку
    const sbpLink = `https://qr.nspk.ru/proxyapp/v1/sbp/c2b/${phone}/${amount}?comment=${encodeURIComponent(purpose)}`;
    
    // Открываем СБП ссылку - система сама предложит банки
    window.open(sbpLink, '_blank');
  };

  const generateSBPLink = () => {
    const amount = order.total + (order.deliveryPrice || 0);
    const phone = seller.cardPhone?.replace(/\D/g, '') || '';
    const purpose = `Заказ #${order.id.slice(-6)}`;
    
    // Универсальная ссылка для СБП через банковские приложения
    return `https://qr.nspk.ru/proxyapp/v1/sbp/c2b/${phone}/${amount}?comment=${encodeURIComponent(purpose)}`;
  };

  const handleSBPPayment = () => {
    const amount = order.total + (order.deliveryPrice || 0);
    const phone = seller.cardPhone?.replace(/\D/g, '') || '';
    const purpose = `Заказ #${order.id.slice(-6)}`;
    
    // Стандартная ссылка СБП
    const sbpLink = `https://qr.nspk.ru/proxyapp/v1/sbp/c2b/${phone}/${amount}?comment=${encodeURIComponent(purpose)}`;
    
    // Прямой переход по ссылке
    window.location.href = sbpLink;
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
            💳
          </div>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            margin: '0 0 8px 0',
            color: '#333'
          }}>
            Оплата через СБП
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
            {order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)} ₽
            <button
              onClick={() => copyToClipboard((order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0)).toString(), 'Сумма скопирована')}
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
            К оплате
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
            <span style={{ fontWeight: '500' }}>{seller.cardHolderName || 'Не указано'}</span>
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Банк:</span>
            <span style={{ fontWeight: '500' }}>{seller.bankName || 'Не указан'}</span>
          </div>
          <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Телефон:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>{seller.cardPhone || 'Не указан'}</span>
              {seller.cardPhone && (
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
              )}
            </div>
          </div>
          
          {(!seller.cardHolderName || !seller.bankName || !seller.cardPhone) && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#856404'
            }}>
              ⚠️ Продавец не заполнил все реквизиты для оплаты. Обратитесь к продавцу.
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Отсутствует: {[!seller.cardHolderName && 'ФИО', !seller.bankName && 'Банк', !seller.cardPhone && 'Телефон'].filter(Boolean).join(', ')}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                Debug: cardHolderName='{seller.cardHolderName}', bankName='{seller.bankName}', cardPhone='{seller.cardPhone}'
              </div>
            </div>
          )}
        </div>

        {/* Кнопки оплаты */}
        <div style={{ marginBottom: '20px' }}>
          {!showBankList ? (
            <>
              <button
                onClick={() => {
                  const amount = order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0);
                  const phone = seller.cardPhone?.replace(/\D/g, '') || '';
                  const purpose = `Заказ #${order.id.slice(-6)}`;
                  const sbpLink = `https://qr.nspk.ru/proxyapp/v1/sbp/c2b/${phone}/${amount}?comment=${encodeURIComponent(purpose)}`;
                  
                  // Проверяем устройство
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                  
                  if (isMobile) {
                    // На мобильном показываем инструкцию
                    const modal = document.createElement('div');
                    modal.style.cssText = `
                      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                      background: rgba(0,0,0,0.8); display: flex; align-items: center;
                      justify-content: center; z-index: 10000; padding: 20px;
                    `;
                    modal.innerHTML = `
                      <div style="background: white; padding: 30px; border-radius: 16px; text-align: left; max-width: 400px;">
                        <h3 style="margin: 0 0 20px 0; font-size: 20px; text-align: center;">Оплата через СБП</h3>
                        
                        <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                          <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #666; font-size: 14px;">Сумма:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span style="font-weight: 600; font-size: 16px;">${amount} ₽</span>
                              <button onclick="navigator.clipboard.writeText('${amount}'); this.textContent='✓';" 
                                style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;">📋</button>
                            </div>
                          </div>
                          <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #666; font-size: 14px;">Телефон:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span style="font-weight: 600;">${phone}</span>
                              <button onclick="navigator.clipboard.writeText('${phone}'); this.textContent='✓';" 
                                style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;">📋</button>
                            </div>
                          </div>
                          <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #666; font-size: 14px;">Получатель:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span style="font-weight: 600; font-size: 13px;">${seller.cardHolderName || 'Не указан'}</span>
                              ${seller.cardHolderName ? `<button onclick="navigator.clipboard.writeText('${seller.cardHolderName}'); this.textContent='✓';" 
                                style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;">📋</button>` : ''}
                            </div>
                          </div>
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #666; font-size: 14px;">Комментарий:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span style="font-weight: 600;">${purpose}</span>
                              <button onclick="navigator.clipboard.writeText('${purpose}'); this.textContent='✓';" 
                                style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;">📋</button>
                            </div>
                          </div>
                        </div>
                        
                        <p style="margin: 15px 0; color: #666; font-size: 14px; line-height: 1.5; text-align: center;">
                          1. Нажмите "Открыть СБП"<br>
                          2. Выберите ваш банк<br>
                          3. Подтвердите платеж
                        </p>
                        <button onclick="window.location.href='${sbpLink}'; document.body.removeChild(this.parentElement.parentElement);" 
                          style="width: 100%; padding: 16px; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-bottom: 10px;">
                          💳 Открыть СБП
                        </button>
                        <button onclick="navigator.clipboard.writeText('${sbpLink}'); this.textContent='✓ Скопировано';" 
                          style="width: 100%; padding: 12px; background: #f8f9fa; color: #666; border: 1px solid #e9ecef; border-radius: 8px; cursor: pointer; font-size: 14px; margin-bottom: 10px;">
                          📋 Скопировать ссылку
                        </button>
                        <button onclick="document.body.removeChild(this.parentElement.parentElement)" 
                          style="width: 100%; padding: 12px; background: none; color: #999; border: none; cursor: pointer; font-size: 14px;">
                          Отмена
                        </button>
                      </div>
                    `;
                    document.body.appendChild(modal);
                  } else {
                    // На десктопе копируем ссылку
                    copyToClipboard(sbpLink, 'Ссылка СБП скопирована. Откройте её на телефоне.');
                  }
                }}
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
                💳 Оплатить через СБП
              </button>
              
              <button
                onClick={() => {
                  const amount = order.items.filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0) + (order.deliveryPrice || 0);
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
                    onClick={() => openBank(bank.name)}
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
          ⚠️ После оплаты нажмите кнопку "Заказ оплачен"
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              if (onPaymentComplete) onPaymentComplete();
              if (onPaymentConfirmed) onPaymentConfirmed();
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
            ✓ Заказ оплачен
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

export default SBPPayment;