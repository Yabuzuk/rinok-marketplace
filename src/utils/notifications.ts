// Простая функция для отправки уведомлений через OneSignal
export const sendNotificationToUser = async (userId: string, title: string, message: string) => {
  // Используем OneSignal SDK для отправки уведомления
  if (window.OneSignal) {
    window.OneSignal.push(function() {
      // Отправляем уведомление пользователю с определенным тегом
      window.OneSignal.sendTag('user_id', userId);
      
      // Показываем локальное уведомление всем подписанным пользователям
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon-192x192.png',
          tag: userId // Уникальный тег для каждого пользователя
        });
      }
      
      console.log('Notification sent to user:', userId, title, message);
    });
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