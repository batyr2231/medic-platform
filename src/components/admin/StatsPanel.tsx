'use client';
import { useEffect, useState } from 'react';

interface Stats {
  totalOrders: number;
  completedOrders: number;
  completionRate: number;
  totalMedics: number;
  approvedMedics: number;
  pendingMedics: number;
  totalClients: number;
  totalReviews: number;
  avgRating: number;
  recentOrders: number;
  fastAcceptedPercent: string;
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    fetch('http://localhost:3001/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8">Загрузка статистики...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Ошибка загрузки статистики</div>;
  }

  const statCards = [
    {
      title: 'Всего заказов',
      value: stats.totalOrders,
      subtitle: `Завершено: ${stats.completedOrders} (${stats.completionRate.toFixed(1)}%)`,
      color: 'blue',
    },
    {
      title: 'Заказы за неделю',
      value: stats.recentOrders,
      subtitle: `Принято быстро: ${stats.fastAcceptedPercent}%`,
      color: 'green',
    },
    {
      title: 'Медики',
      value: stats.totalMedics,
      subtitle: `Одобрено: ${stats.approvedMedics} | На модерации: ${stats.pendingMedics}`,
      color: 'purple',
    },
    {
      title: 'Клиенты',
      value: stats.totalClients,
      subtitle: `Активные пользователи`,
      color: 'indigo',
    },
    {
      title: 'Отзывы',
      value: stats.totalReviews,
      subtitle: `Средний рейтинг: ${stats.avgRating.toFixed(1)} / 5`,
      color: 'yellow',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Общая статистика платформы</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-${card.color}-50 border border-${card.color}-200 rounded-lg p-6`}
          >
            <h3 className={`text-sm font-medium text-${card.color}-700 mb-2`}>
              {card.title}
            </h3>
            <p className={`text-3xl font-bold text-${card.color}-900 mb-1`}>
              {card.value}
            </p>
            <p className={`text-sm text-${card.color}-600`}>
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Ключевые метрики</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Процент завершённых заказов:</span>
            <span className="font-bold text-green-600">{stats.completionRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Заказы принятые в течение 15 мин:</span>
            <span className="font-bold text-blue-600">{stats.fastAcceptedPercent}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Средний рейтинг медиков:</span>
            <span className="font-bold text-yellow-600">{stats.avgRating.toFixed(2)} / 5.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}