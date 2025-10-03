'use client';
import { useEffect, useState } from 'react';
import MedicsCatalog from '@/components/medics/MedicsCatalog';

export default function MedicsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      fetch('http://localhost:3001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => {});
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Каталог медиков</h1>
            <div className="flex gap-2">
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Главная
              </a>
              {user && (
                <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
                  Личный кабинет
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MedicsCatalog />
      </div>
    </div>
  );
}