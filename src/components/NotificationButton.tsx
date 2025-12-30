import React from 'react';
import { Bell } from 'lucide-react';

const NotificationButton: React.FC = () => {
  const requestNotificationPermission = () => {
    if (window.OneSignal) {
      window.OneSignal.push(function() {
        window.OneSignal.showSlidedownPrompt();
      });
    } else {
      // Fallback для браузеров без OneSignal
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('ОптБазар', {
              body: 'Уведомления включены!',
              icon: '/icon-192x192.png'
            });
          }
        });
      }
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