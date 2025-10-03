importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Конфигурация Firebase (замените на ваши данные)
firebase.initializeApp({
  apiKey: "AIzaSyCSG6L27wpnDsWGQ62WlUtOyCXmfP08Ez4",
  authDomain: "medic-platform.firebaseapp.com",
  projectId: "medic-platform",
  storageBucket: "medic-platform.firebasestorage.app",
  messagingSenderId: "44119443373",
  appId: "1:44119443373:web:7e0bffc0c753772e9bc324"
});

const messaging = firebase.messaging();

// Обработка фоновых сообщений
messaging.onBackgroundMessage((payload) => {
  console.log('Получено фоновое сообщение:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'Посмотреть'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Клик по уведомлению:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Открываем соответствующую страницу
    const orderId = event.notification.data?.orderId;
    if (orderId) {
      event.waitUntil(
        clients.openWindow(`/dashboard`)
      );
    }
  }
});