'use client';
import { useEffect, useState } from 'react';

interface Medic {
  id: string;
  userId: string;
  specialty: string;
  experience: number;
  documents: string[];
  areas: string[];
  status: string;
  ratingAvg: number;
  reviewsCount: number;
  user: {
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
}

export default function MedicsPanel() {
  const [medics, setMedics] = useState<Medic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchMedics = async () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    const url = filter === 'all' 
      ? 'http://localhost:3001/api/admin/medics'
      : `http://localhost:3001/api/admin/medics?status=${filter}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMedics(data.medics || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading medics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedics();
  }, [filter]);

  const updateStatus = async (userId: string, status: string) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    try {
      const response = await fetch(`http://localhost:3001/api/admin/medics/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`Статус медика обновлён на ${status}`);
        fetchMedics();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка обновления статуса');
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    BANNED: 'bg-gray-900 text-white',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'На модерации',
    APPROVED: 'Одобрен',
    REJECTED: 'Отклонён',
    BANNED: 'Заблокирован',
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка медиков...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Модерация медиков ({medics.length})</h2>
        
        <div className="flex gap-2">
          {['all', 'PENDING', 'APPROVED', 'REJECTED', 'BANNED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f === 'all' ? 'Все' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {medics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Медиков не найдено</div>
      ) : (
        <div className="space-y-4">
          {medics.map(medic => (
            <div key={medic.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{medic.user.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[medic.status]}`}>
                      {statusLabels[medic.status]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email:</p>
                      <p className="font-medium">{medic.user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Телефон:</p>
                      <p className="font-medium">{medic.user.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Специальность:</p>
                      <p className="font-medium">{medic.specialty}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Стаж:</p>
                      <p className="font-medium">{medic.experience} лет</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Рейтинг:</p>
                      <p className="font-medium">{medic.ratingAvg.toFixed(1)} / 5 ({medic.reviewsCount} отзывов)</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Дата регистрации:</p>
                      <p className="font-medium">
                        {new Date(medic.user.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-gray-500 text-sm">Районы:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {medic.areas.map(area => (
                        <span key={area} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {medic.documents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-gray-500 text-sm">Документы:</p>
                      <p className="text-sm">{medic.documents.length} файл(ов)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопки модерации */}
              <div className="flex gap-2 pt-4 border-t">
                {medic.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus(medic.userId, 'APPROVED')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => updateStatus(medic.userId, 'REJECTED')}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Отклонить
                    </button>
                  </>
                )}
                
                {medic.status === 'APPROVED' && (
                  <button
                    onClick={() => updateStatus(medic.userId, 'BANNED')}
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                  >
                    Заблокировать
                  </button>
                )}

                {medic.status === 'BANNED' && (
                  <button
                    onClick={() => updateStatus(medic.userId, 'APPROVED')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Разблокировать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}