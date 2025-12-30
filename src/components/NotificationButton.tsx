import React from 'react';
import { Bell } from 'lucide-react';

const NotificationButton: React.FC = () => {
  const requestNotificationPermission = async () => {
    console.log('Requesting notification permission...');
    
    // Проверяем поддержку уведомлений
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления');
      return;
    }

    // Проверяем текущее разрешение
    if (Notification.permission === 'granted') {
      alert('Уведомления уже включены!');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('Уведомления заблокированы. Разрешите их в настройках браузера.');
      return;
    }

    // Запрашиваем разрешение
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Показываем тестовое уведомление
        new Notification('ОптБазар', {
          body: 'Уведомления успешно включены!',
          icon: '/icon-192x192.png'
        });
        
        // Пытаемся инициализировать OneSignal
        if (window.OneSignal) {
          window.OneSignal.push(function() {
            window.OneSignal.registerForPushNotifications();
          });
        }
      } else {
        alert('Разрешение на уведомления не получено');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Ошибка при запросе разрешения на уведомления');
    }
  };

  return (
    <button
      onClick={requestNotificationPermission}
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        background: 'linear-gradient(135deg, #4caf50, #45a049)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
        zIndex: 1000
      }}
      title="Включить уведомления"
    >
      <Bell size={24} />
    </button>
  );
};

export default NotificationButton;