'use client';
import { useEffect, useState } from 'react';

interface NotificationPermissionProps {
  userRole: string;
  userId: string;
}

export default function NotificationPermission({ userRole, userId }: NotificationPermissionProps) {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission as 'default' | 'granted' | 'denied');
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm as 'default' | 'granted' | 'denied');
  };

  if (!isClient || userRole !== 'MEDIC' || permission === 'granted') {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔔</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Включите уведомления
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Получайте мгновенные уведомления о новых заказах
          </p>
          <button
            onClick={handleRequestPermission}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Включить уведомления
          </button>
        </div>
      </div>
    </div>
  );
}