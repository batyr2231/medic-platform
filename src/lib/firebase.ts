
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;

// Инициализация только на клиенте
const initializeFirebase = () => {
  if (typeof window !== 'undefined' && firebaseConfig.apiKey && getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  }
};

// Запрос разрешения на уведомления
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!messaging) {
    initializeFirebase();
  }

  if (!messaging) {
    console.log('Firebase Messaging не инициализирован');
    return null;
  }

  try {
    if (!('Notification' in window)) {
      console.log('Браузер не поддерживает уведомления');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Разрешение на уведомления получено');
      
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Разрешение на уведомления отклонено');
      return null;
    }
  } catch (error) {
    console.error('Ошибка получения разрешения:', error);
    return null;
  }
};

// Слушаем входящие сообщения
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!messaging) {
      initializeFirebase();
    }

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Получено уведомление:', payload);
        resolve(payload);
      });
    }
  });

export { messaging };