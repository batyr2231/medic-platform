'use client';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  serviceType: string;
  address: string;
  scheduledTime: string;
  status: string;
  paymentStatus: string;
  comment?: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
  medic?: {
    id: string;
    name: string;
    phone: string;
    medicProfile?: {
      specialty: string;
      ratingAvg: number;
    };
  };
}

const STATUS_LABELS: Record<string, string> = {
  'NEW': 'Новый',
  'ACCEPTED': 'Принят', 
  'ON_THE_WAY': 'В пути',
  'STARTED': 'Выполняется',
  'COMPLETED': 'Завершен',
  'CANCELLED': 'Отменен',
};

const STATUS_COLORS: Record<string, string> = {
  'NEW': 'bg-yellow-100 text-yellow-800',
  'ACCEPTED': 'bg-blue-100 text-blue-800',
  'ON_THE_WAY': 'bg-purple-100 text-purple-800',
  'STARTED': 'bg-indigo-100 text-indigo-800',
  'COMPLETED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800',
};
interface OrdersListProps {
  userRole: string;
  onReviewNeeded?: (orderId: string, medicName: string) => void;
}

export default function OrdersList({ userRole, onReviewNeeded }: OrdersListProps) {
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

      const response = await fetch('http://localhost:3001/api/orders/my', {
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
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const markAsPaid = async (orderId: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      await fetch(`http://localhost:3001/api/orders/${orderId}/paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      alert('Оплата отмечена');
      fetchOrders();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка заказов...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {userRole === 'CLIENT' ? 'У вас пока нет заказов' : 'У вас пока нет принятых заказов'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold">{order.serviceType}</h3>
              <p className="text-gray-600">{order.address}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.scheduledTime).toLocaleString('ru-RU')}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
              {order.paymentStatus === 'PAID' && (
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Оплачено
                </span>
              )}
            </div>
          </div>

          {order.comment && (
            <p className="text-gray-600 mb-4">
              <strong>Комментарий:</strong> {order.comment}
            </p>
          )}

          {userRole === 'CLIENT' && order.medic && (
            <div className="bg-blue-50 p-4 rounded mb-4">
              <p className="font-medium">Медик:</p>
              <p>{order.medic.name}</p>
              <p className="text-sm text-gray-600">
                {order.medic.medicProfile?.specialty}
              </p>
              <p className="text-sm text-gray-600">{order.medic.phone}</p>
            </div>
          )}

          {userRole === 'MEDIC' && order.client && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="font-medium">Клиент:</p>
              <p>{order.client.name}</p>
              <p className="text-sm text-gray-600">{order.client.phone}</p>
            </div>
          )}

          {/* Кнопки управления для медика */}
          {userRole === 'MEDIC' && (
            <div className="flex gap-2 flex-wrap">
              {order.status !== 'NEW' && order.status !== 'CANCELLED' && (
                <button
                  onClick={() => window.location.href = `/chat/${order.id}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  💬 Чат
                </button>
              )}
              {order.status === 'ACCEPTED' && (
                <button
                  onClick={() => updateStatus(order.id, 'ON_THE_WAY')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  В пути
                </button>
              )}
              {order.status === 'ON_THE_WAY' && (
                <button
                  onClick={() => updateStatus(order.id, 'STARTED')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Начать работу
                </button>
              )}
              {order.status === 'STARTED' && (
                <button
                  onClick={() => updateStatus(order.id, 'COMPLETED')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Завершить
                </button>
              )}
              {order.status === 'COMPLETED' && order.paymentStatus !== 'PAID' && (
                <button
                  onClick={() => markAsPaid(order.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Получил оплату
                </button>
              )}
            </div>
          )}

          {/* Кнопка чата для клиента */}
          {userRole === 'CLIENT' && order.medic && order.status !== 'CANCELLED' && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => window.location.href = `/chat/${order.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                💬 Открыть чат с медиком
              </button>
              
              {order.status === 'COMPLETED' && order.paymentStatus === 'PAID' && onReviewNeeded && (
                <button
                  onClick={() => onReviewNeeded(order.id, order.medic?.name || 'Медик')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ⭐ Оставить отзыв
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}