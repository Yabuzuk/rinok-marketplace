import React, { useState, useEffect } from 'react';
import { X, Download, Bell } from 'lucide-react';
import usePWA from '../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isInstallable, installApp } = usePWA();

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
    
    if (!hasSeenPrompt && isInstallable) {
      // Показываем через 3 секунды после загрузки
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = () => {
    installApp();
    setIsVisible(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px'
          }}>
            📱
          </div>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#333',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Установите приложение ОптБазар
          </h3>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            Для полной функциональности и получения уведомлений о заказах
          </p>
        </div>

        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#333'
          }}>
            <Bell size={16} color="#4caf50" />
            Push-уведомления о заказах
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#333'
          }}>
            <Download size={16} color="#4caf50" />
            Работа без интернета
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#333'
          }}>
            📱
            Быстрый доступ с рабочего стола
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Позже
          </button>
          <button
            onClick={handleInstall}
            style={{
              flex: 2,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Установить
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;