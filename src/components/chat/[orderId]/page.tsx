'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        window.location.href = '/auth/login';
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Назад к заказам
          </button>
        </div>
        <ChatWindow orderId={orderId} currentUserId={user.id} />
      </div>
    </div>
  );
}