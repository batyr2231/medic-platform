'use client';
import { useState } from 'react';

const AREAS = [
  'Алмалинский район',
  'Ауэзовский район',
  'Бостандыкский район',
  'Жетысуский район',
  'Медеуский район',
  'Наурызбайский район',
  'Турксибский район',
  'Алатауский район',
];

const SPECIALTIES = [
  'Терапевт',
  'Кардиолог',
  'Невролог',
  'Педиатр',
  'Хирург',
  'Гинеколог',
  'Офтальмолог',
  'ЛОР',
  'Дерматолог',
  'Эндокринолог',
];

export default function RegisterForm() {
  const [role, setRole] = useState<'CLIENT' | 'MEDIC'>('CLIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    experience: '',
    areas: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (role === 'MEDIC' && (!formData.specialty || formData.areas.length === 0)) {
      setError('Для медика необходимо указать специальность и районы');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role,
          specialty: formData.specialty,
          experience: formData.experience,
          areas: formData.areas,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // Сохраняем токен
      document.cookie = `token=${data.token}; path=/; max-age=604800`; // 7 дней

      // Показываем успех и перенаправляем
      alert(`Регистрация успешна! Добро пожаловать, ${data.user.name}`);
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔥</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Регистрация
          </h1>
          <p className="text-gray-600">
            Создайте новый аккаунт
          </p>
        </div>

        {/* Выбор роли */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Выберите роль
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-4 border-2 rounded-lg transition-all ${
                role === 'CLIENT'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">Клиент</div>
              <div className="text-xs text-gray-500">Заказываю услуги</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('MEDIC')}
              className={`p-4 border-2 rounded-lg transition-all ${
                role === 'MEDIC'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <div className="font-medium">Медик</div>
              <div className="text-xs text-gray-500">Оказываю услуги</div>
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ФИО
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>

          {/* Email и Телефон */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+7 (777) 123-45-67"
                required
              />
            </div>
          </div>

          {/* Пароли */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Минимум 6 символов"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Повторите пароль"
                required
              />
            </div>
          </div>

          {/* Дополнительные поля для медика */}
          {role === 'MEDIC' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Специальность
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => handleChange('specialty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Выберите специальность</option>
                    {SPECIALTIES.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стаж (лет)
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Районы выезда
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AREAS.map(area => (
                    <label key={area} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.areas.includes(area)}
                        onChange={() => handleAreaToggle(area)}
                        className="mr-2"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Ошибка */}
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Кнопка регистрации */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Ссылка на вход */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <a 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Войти
            </a>
          </p>
        </div>

        {/* Кнопка назад */}
        <div className="mt-4 text-center">
          <a 
            href="/" 
            className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
          >
            ← Назад на главную
          </a>
        </div>
      </div>
    </div>
  );
}