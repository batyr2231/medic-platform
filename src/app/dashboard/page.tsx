'use client';
import { useEffect, useState } from 'react';
import CreateOrderForm from '@/components/orders/CreateOrderForm';
import OrdersList from '@/components/orders/OrdersList';
import AvailableOrders from '@/components/orders/AvailableOrders';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';
import NotificationPermission from '@/components/notifications/NotificationPermission';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [refresh, setRefresh] = useState(0);
  const [reviewOrder, setReviewOrder] = useState<{ orderId: string; medicName: string } | null>(null);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'CLIENT' ? 'Личный кабинет' : 'Кабинет медика'}
              </h1>
              <p className="text-gray-600">{user?.name}</p>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Мой профиль</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{user?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Роль</p>
                  <p className="font-medium">
                    {user?.role === 'CLIENT' ? 'Клиент' : user?.role === 'MEDIC' ? 'Медик' : 'Администратор'}
                  </p>
                </div>
              </div>

              {user?.medicProfile && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold mb-3">Профиль медика</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Специальность:</span>{' '}
                      <strong>{user.medicProfile.specialty}</strong>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Стаж:</span>{' '}
                      <strong>{user.medicProfile.experience} лет</strong>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Рейтинг:</span>{' '}
                      <strong>{user.medicProfile.ratingAvg}/5</strong>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Отзывов:</span>{' '}
                      <strong>{user.medicProfile.reviewsCount}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {user?.role === 'CLIENT' && (
              <CreateOrderForm onSuccess={() => setRefresh(r => r + 1)} />
            )}
          </div>

          <div className="lg:col-span-2">
            {user?.role === 'MEDIC' && (
              <NotificationPermission userRole={user.role} userId={user.id} />
            )}

            {user?.role === 'MEDIC' && (
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="flex border-b">
                    <button
                      onClick={() => setActiveTab('available')}
                      className={`flex-1 px-6 py-4 font-medium ${
                        activeTab === 'available'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Доступные заказы
                    </button>
                    <button
                      onClick={() => setActiveTab('my')}
                      className={`flex-1 px-6 py-4 font-medium ${
                        activeTab === 'my'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Мои заказы
                    </button>
                  </div>
                  <div className="p-6">
                    {activeTab === 'available' ? (
                      <AvailableOrders onAccept={() => {
                        setRefresh(r => r + 1);
                        setActiveTab('my');
                      }} />
                    ) : (
                      <OrdersList key={refresh} userRole={user?.role} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'CLIENT' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Мои заказы</h2>
                
                {reviewOrder ? (
                  <div>
                    <button
                      onClick={() => setReviewOrder(null)}
                      className="text-blue-600 hover:text-blue-700 mb-4"
                    >
                      ← Назад к заказам
                    </button>
                    <ReviewForm
                      orderId={reviewOrder.orderId}
                      medicName={reviewOrder.medicName}
                      onSuccess={() => {
                        setReviewOrder(null);
                        setRefresh(r => r + 1);
                      }}
                    />
                  </div>
                ) : (
                  <OrdersList
                    key={refresh}
                    userRole={user?.role}
                    onReviewNeeded={(orderId, medicName) => setReviewOrder({ orderId, medicName })}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {user?.role === 'MEDIC' && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Мои отзывы</h2>
            <ReviewsList medicId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
}