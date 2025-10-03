'use client';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  serviceType: string;
  address: string;
  scheduledTime: string;
  comment?: string;
  client: {
    name: string;
    phone: string;
  };
}

export default function AvailableOrders({ onAccept }: { onAccept: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/orders/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Обновляем каждые 10 секунд
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async (orderId: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Не удалось принять заказ');
        return;
      }

      alert('Заказ успешно принят!');
      fetchOrders();
      onAccept();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Ошибка принятия заказа');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка доступных заказов...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет доступных заказов в вашем районе
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Доступные заказы ({orders.length})</h3>
        <button
          onClick={fetchOrders}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Обновить
        </button>
      </div>

      {orders.map(order => (
        <div key={order.id} className="bg-white border-2 border-blue-200 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">{order.serviceType}</h3>
              <p className="text-gray-600">{order.address}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.scheduledTime).toLocaleString('ru-RU')}
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Новый
            </span>
          </div>

          {order.comment && (
            <p className="text-gray-600 mb-4">
              <strong>Комментарий:</strong> {order.comment}
            </p>
          )}

          <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="font-medium text-sm">Клиент:</p>
            <p className="text-sm">{order.client.name}</p>
            <p className="text-sm text-gray-600">{order.client.phone}</p>
          </div>

          <button
            onClick={() => acceptOrder(order.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Принять заказ
          </button>
        </div>
      ))}
    </div>
  );
}