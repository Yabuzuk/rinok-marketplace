importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyADaZYOM7nOITKBlfn0jhtwtTBI7RbB_m8",
  authDomain: "kalaktika-app.firebaseapp.com",
  projectId: "kalaktika-app",
  storageBucket: "kalaktika-app.firebasestorage.app",
  messagingSenderId: "735114029908",
  appId: "1:735114029908:web:8155afa0b285ce8c06f6c1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});