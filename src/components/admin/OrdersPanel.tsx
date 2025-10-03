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
  createdAt: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  medic?: {
    name: string;
    email: string;
    phone: string;
    medicProfile?: {
      specialty: string;
    };
  };
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    fetch('http://localhost:3001/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading orders:', err);
        setLoading(false);
      });
  }, []);

  const loadMessages = async (orderId: string) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    try {
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data.messages || []);
      setSelectedOrder(orderId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const statusLabels: Record<string, string> = {
    NEW: 'Новый',
    ACCEPTED: 'Принят',
    ON_THE_WAY: 'В пути',
    STARTED: 'Выполняется',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    ON_THE_WAY: 'bg-purple-100 text-purple-800',
    STARTED: 'bg-indigo-100 text-indigo-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка заказов...</div>;
  }

  if (selectedOrder) {
    return (
      <div>
        <button
          onClick={() => setSelectedOrder(null)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Назад к списку заказов
        </button>
        
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">История чата</h3>
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Нет сообщений</p>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{msg.from.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-gray-700">{msg.text}</p>
                  <span className="text-xs text-gray-400">
                    {msg.from.role === 'CLIENT' ? 'Клиент' : 'Медик'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Все заказы ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Заказов пока нет</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{order.serviceType}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    {order.paymentStatus === 'PAID' && (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Оплачено
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-1">{order.address}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.scheduledTime).toLocaleString('ru-RU')}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <p>Создан:</p>
                  <p>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>

              {order.comment && (
                <p className="text-gray-600 mb-4 p-3 bg-gray-50 rounded">
                  <strong>Комментарий:</strong> {order.comment}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-medium mb-2">Клиент:</p>
                  <p>{order.client.name}</p>
                  <p className="text-gray-600">{order.client.email}</p>
                  <p className="text-gray-600">{order.client.phone}</p>
                </div>

                {order.medic ? (
                  <div className="bg-green-50 p-3 rounded">
                    <p className="font-medium mb-2">Медик:</p>
                    <p>{order.medic.name}</p>
                    <p className="text-gray-600">{order.medic.medicProfile?.specialty}</p>
                    <p className="text-gray-600">{order.medic.phone}</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="font-medium">Медик не назначен</p>
                  </div>
                )}
              </div>

              {order.medic && (
                <button
                  onClick={() => loadMessages(order.id)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Просмотреть чат
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}