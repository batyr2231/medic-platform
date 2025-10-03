'use client';
import { useEffect, useState } from 'react';

interface Complaint {
  id: string;
  rating: number;
  comment?: string;
  isHidden: boolean;
  createdAt: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  order: {
    serviceType: string;
    address: string;
    scheduledTime: string;
    medic: {
      name: string;
      email: string;
      phone: string;
      medicProfile?: {
        specialty: string;
      };
    };
  };
}

export default function ComplaintsPanel() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    fetch('http://localhost:3001/api/admin/complaints', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setComplaints(data.complaints || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading complaints:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const hideReview = async (reviewId: string, isHidden: boolean) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    try {
      const response = await fetch(`http://localhost:3001/api/admin/reviews/${reviewId}/hide`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isHidden }),
      });

      if (response.ok) {
        alert(isHidden ? 'Отзыв скрыт' : 'Отзыв показан');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error hiding review:', error);
      alert('Ошибка изменения видимости отзыва');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка жалоб...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Жалобы ({complaints.length})</h2>

      {complaints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Жалоб пока нет
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                    ⚠️ ЖАЛОБА
                  </span>
                  {complaint.isHidden && (
                    <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
                      Скрыто
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(complaint.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>

              {/* Рейтинг */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Оценка:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={star <= complaint.rating ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({complaint.rating}/5)</span>
                </div>
              </div>

              {/* Комментарий */}
              {complaint.comment && (
                <div className="mb-4 p-4 bg-white rounded border border-red-200">
                  <p className="font-medium mb-2">Текст жалобы:</p>
                  <p className="text-gray-800">{complaint.comment}</p>
                </div>
              )}

              {/* Информация */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="font-medium mb-2">Клиент:</p>
                  <p>{complaint.client.name}</p>
                  <p className="text-gray-600">{complaint.client.email}</p>
                  <p className="text-gray-600">{complaint.client.phone}</p>
                </div>

                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="font-medium mb-2">Медик:</p>
                  <p>{complaint.order.medic.name}</p>
                  <p className="text-gray-600">{complaint.order.medic.medicProfile?.specialty}</p>
                  <p className="text-gray-600">{complaint.order.medic.phone}</p>
                </div>

                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="font-medium mb-2">Заказ:</p>
                  <p>{complaint.order.serviceType}</p>
                  <p className="text-gray-600 text-xs">{complaint.order.address}</p>
                  <p className="text-gray-600 text-xs">
                    {new Date(complaint.order.scheduledTime).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>

              {/* Действия */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-red-200">
                <button
                  onClick={() => hideReview(complaint.id, !complaint.isHidden)}
                  className={`px-4 py-2 rounded ${
                    complaint.isHidden
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white`}
                >
                  {complaint.isHidden ? 'Показать отзыв' : 'Скрыть отзыв'}
                </button>
                
                <a
                  href={`mailto:${complaint.order.medic.email}?subject=Жалоба на заказ&body=Здравствуйте, ${complaint.order.medic.name}. На вас поступила жалоба...`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Связаться с медиком
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}