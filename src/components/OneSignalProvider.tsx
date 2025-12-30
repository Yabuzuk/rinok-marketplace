import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignal: any;
  }
}

interface OneSignalConfig {
  appId: string;
  userRole?: 'customer' | 'seller' | 'admin';
  userId?: string;
}

const useOneSignal = ({ appId, userRole, userId }: OneSignalConfig) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.OneSignal) {
      window.OneSignal = window.OneSignal || [];
      
      window.OneSignal.push(function() {
        window.OneSignal.init({
          appId: appId,
          safari_web_id: 'web.onesignal.auto.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });

        // Устанавливаем теги пользователя
        if (userRole && userId) {
          window.OneSignal.sendTags({
            'user_role': userRole,
            'user_id': userId
          });
        }
      });
    }
  }, [appId, userRole, userId]);

  const sendNotification = async (message: string, heading: string, userIds?: string[]) => {
    if (window.OneSignal) {
      const notificationData = {
        contents: { 'ru': message, 'en': message },
        headings: { 'ru': heading, 'en': heading },
        include_external_user_ids: userIds || [],
        web_url: window.location.origin,
        chrome_web_icon: '/icon-192x192.png',
        firefox_icon: '/icon-192x192.png'
      };

      try {
        // Здесь нужно использовать REST API OneSignal
        console.log('Отправка уведомления:', notificationData);
      } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
      }
    }
  };

  const subscribeUser = () => {
    if (window.OneSignal) {
      window.OneSignal.push(function() {
        window.OneSignal.showSlidedownPrompt();
      });
    }
  };

  return { sendNotification, subscribeUser };
};

export default useOneSignal;