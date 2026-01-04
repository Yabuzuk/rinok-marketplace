import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { sendNotification } from '../utils/notifications';

interface NotificationButtonProps {
  userRole?: 'customer' | 'seller' | 'admin' | 'courier' | 'manager'
  userId?: string
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ userRole, userId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          setIsSubscribed(true)
          console.log('✅ Уведомления разрешены')
          
          if (userId) {
            await sendNotification(
              [userId],
              'Добро пожаловать!',
              'Уведомления успешно настроены'
            )
          }
        }
      }
    } catch (error) {
      console.error('Ошибка подписки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      await sendNotification(
        [userId],
        'Тестовое уведомление',
        `Привет, ${userRole}! Это тестовое уведомление.`
      )
      console.log('✅ Тестовое уведомление отправлено')
    } catch (error) {
      console.error('Ошибка отправки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {!isSubscribed ? (
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <Bell size={16} />
          {isLoading ? 'Подключение...' : 'Включить уведомления'}
        </button>
      ) : (
        <button
          onClick={sendTestNotification}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <BellRing size={16} />
          {isLoading ? 'Отправка...' : 'Тест уведомления'}
        </button>
      )}
    </div>
  )
}

export default NotificationButton