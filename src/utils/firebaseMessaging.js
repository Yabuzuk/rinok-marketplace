import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyADaZYOM7nOITKBlfn0jhtwtTBI7RbB_m8",
  authDomain: "kalaktika-app.firebaseapp.com",
  projectId: "kalaktika-app",
  storageBucket: "kalaktika-app.firebasestorage.app",
  messagingSenderId: "735114029908",
  appId: "1:735114029908:web:8155afa0b285ce8c06f6c1"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      
      // Send token to server
      await fetch('https://rinok.vercel.app/api/save-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });