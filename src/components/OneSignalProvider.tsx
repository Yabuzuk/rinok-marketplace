import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignal: any;
    oneSignalInitialized?: boolean;
  }
}

interface OneSignalConfig {
  appId: string;
  userRole?: 'customer' | 'seller' | 'admin' | 'courier' | 'manager';
  userId?: string;
}

const useOneSignal = ({ appId, userRole, userId }: OneSignalConfig) => {
  useEffect(() => {
    console.log('OneSignal initialization started...');
    
    if (typeof window !== 'undefined' && !window.oneSignalInitialized) {
      const initOneSignal = () => {
        if (window.OneSignal) {
          console.log('OneSignal SDK loaded, initializing...');
          
          window.OneSignal.push(function() {
            // Проверяем, не инициализирован ли уже
            if (!window.OneSignal.initialized) {
              console.log('OneSignal init called with appId:', appId);
              
              window.OneSignal.init({
                appId: appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false, // Отключаем автоматическую регистрацию
                autoResubscribe: true
              }).then(() => {
                console.log('OneSignal initialized successfully');
                window.oneSignalInitialized = true;
                
                // Устанавливаем теги пользователя
                if (userRole && userId) {
                  console.log('Setting user tags:', { userRole, userId });
                  window.OneSignal.setExternalUserId(userId);
                  window.OneSignal.sendTags({
                    'user_role': userRole,
                    'user_id': userId
                  });
                }
              }).catch((error: any) => {
                console.error('OneSignal initialization error:', error);
              });
            } else {
              console.log('OneSignal already initialized');
              window.oneSignalInitialized = true;
            }
          });
        } else {
          console.log('OneSignal SDK not loaded yet, retrying...');
          setTimeout(initOneSignal, 1000);
        }
      };
      
      setTimeout(initOneSignal, 2000);
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

  const subscribeUser = async () => {
    try {
      if (window.OneSignal && window.oneSignalInitialized) {
        console.log('Requesting notification permission...');
        await window.OneSignal.registerForPushNotifications();
        console.log('Successfully subscribed to notifications');
      } else {
        // Fallback - используем стандартные браузерные уведомления
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          console.log('Browser notification permission:', permission);
        }
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  };

  return { sendNotification, subscribeUser };
};

export default useOneSignal;