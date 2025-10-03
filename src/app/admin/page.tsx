'use client';
import { useEffect, useState } from 'react';
import StatsPanel from '@/components/admin/StatsPanel';
import MedicsPanel from '@/components/admin/MedicsPanel';
import OrdersPanel from '@/components/admin/OrdersPanel';
import ComplaintsPanel from '@/components/admin/ComplaintsPanel';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'medics' | 'orders' | 'complaints'>('stats');

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
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'ADMIN') {
          alert('Доступ запрещён');
          window.location.href = '/dashboard';
          return;
        }
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
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Админ-панель
            </h1>
            <button
              onClick={() => {
                document.cookie = 'token=; path=/; max-age=0';
                window.location.href = '/';
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Табы */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {[
              { key: 'stats', label: 'Статистика', icon: '📊' },
              { key: 'medics', label: 'Медики', icon: '👨‍⚕️' },
              { key: 'orders', label: 'Заказы', icon: '📋' },
              { key: 'complaints', label: 'Жалобы', icon: '⚠️' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-6 py-4 font-medium ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'stats' && <StatsPanel />}
            {activeTab === 'medics' && <MedicsPanel />}
            {activeTab === 'orders' && <OrdersPanel />}
            {activeTab === 'complaints' && <ComplaintsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}