'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Проверяем статус API
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(() => setApiStatus('success'))
      .catch(() => setApiStatus('error'));
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '✅ Backend работает';
      case 'error': return '❌ Backend не запущен';
      default: return '⏳ Проверка...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medic Platform
          </h1>
          <p className="text-gray-600">
            Платформа для взаимодействия клиентов и медиков
          </p>
        </div>

        {/* Статус системы */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">📊 Статус системы:</h3>
          <div className="flex justify-between items-center">
            <span>Backend API:</span>
            <span className={`text-sm px-2 py-1 rounded ${
              apiStatus === 'success' ? 'bg-green-100 text-green-800' :
              apiStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {getStatusText(apiStatus)}
            </span>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <Link 
            href="/auth/register"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            🔥 Регистрация
          </Link>
          
          <Link 
            href="/auth/login"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            🚪 Вход
          </Link>
        </div>

        {/* Инструкции */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🚀 Что дальше?</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>1. Запустите backend сервер</p>
            <p>2. Настройте базу данных</p>
            <p>3. Зарегистрируйтесь в системе</p>
          </div>
        </div>

        {/* Ошибки */}
        {apiStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm">
              <strong>Backend не запущен!</strong><br/>
              Выполните: <code className="bg-red-100 px-1 rounded">cd server && npm run dev</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}