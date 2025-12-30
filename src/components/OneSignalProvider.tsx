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
      // Ждем загрузки OneSignal SDK
      const initOneSignal = () => {
        if (window.OneSignal) {
          console.log('OneSignal SDK loaded, checking if already initialized...');
          
          window.OneSignal = window.OneSignal || [];
          
          window.OneSignal.push(function() {
            console.log('OneSignal init called with appId:', appId);
            
            window.OneSignal.init({
              appId: appId,
              allowLocalhostAsSecureOrigin: true,
              autoRegister: true,
              autoResubscribe: true,
              promptOptions: {
                slidedown: {
                  enabled: true,
                  autoPrompt: true,
                  timeDelay: 5,
                  pageViews: 1
                }
              }
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
          });
        } else {
          console.log('OneSignal SDK not loaded yet, retrying...');
          setTimeout(initOneSignal, 1000);
        }
      };
      
      // Начинаем инициализацию через 2 секунды
      setTimeout(initOneSignal, 2000);
    } else if (window.oneSignalInitialized && userRole && userId) {
      // Если OneSignal уже инициализирован, просто обновляем теги
      console.log('OneSignal already initialized, updating tags only');
      if (window.OneSignal) {
        window.OneSignal.push(function() {
          window.OneSignal.setExternalUserId(userId);
          window.OneSignal.sendTags({
            'user_role': userRole,
            'user_id': userId
          });
        });
      }
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