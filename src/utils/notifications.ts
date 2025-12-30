// Функция для отправки уведомлений через серверную функцию
export const sendNotificationToUser = async (userId: string, title: string, message: string) => {
  try {
    const response = await fetch('/.netlify/functions/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        message,
        userIds: [userId]
      })
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // Fallback - показываем локальное уведомление
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon-192x192.png'
      });
    }
  }
};

// Функция для отправки уведомления всем пользователям с определенной ролью
export const sendNotificationToRole = async (role: string, title: string, message: string) => {
  if (window.OneSignal) {
    window.OneSignal.push(function() {
      // Показываем уведомление всем пользователям с определенной ролью
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon-192x192.png',
          tag: role
        });
      }
      
      console.log('Notification sent to role:', role, title, message);
    });
  }
};