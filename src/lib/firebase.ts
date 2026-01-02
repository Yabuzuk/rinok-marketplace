import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyADaZYOM7nOITKBlfn0jhtwtTBI7RbB_m8",
  authDomain: "kalaktika-app.firebaseapp.com",
  projectId: "kalaktika-app",
  storageBucket: "kalaktika-app.firebasestorage.app",
  messagingSenderId: "735114029908",
  appId: "1:735114029908:web:8155afa0b285ce8c06f6c1",
  measurementId: "G-T7JLSH3WQS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;