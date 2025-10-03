'use client';
import { useState } from 'react';

interface ReviewFormProps {
  orderId: string;
  medicName: string;
  onSuccess: () => void;
}

export default function ReviewForm({ orderId, medicName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isComplaint, setIsComplaint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          rating,
          comment,
          isComplaint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания отзыва');
      }

      alert('Спасибо за отзыв!');
      onSuccess();

    } catch (err: any) {
      setError(err.message || 'Ошибка создания отзыва');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Оставьте отзыв</h2>
      <p className="text-gray-600 mb-6">Медик: <strong>{medicName}</strong></p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Рейтинг */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Оценка работы медика
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {rating === 5 && 'Отлично!'}
            {rating === 4 && 'Хорошо'}
            {rating === 3 && 'Нормально'}
            {rating === 2 && 'Плохо'}
            {rating === 1 && 'Очень плохо'}
          </p>
        </div>

        {/* Комментарий */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Комментарий (необязательно)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            maxLength={300}
            placeholder="Расскажите о вашем опыте..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/300 символов
          </p>
        </div>

        {/* Жалоба */}
        <div className="bg-red-50 p-4 rounded-lg">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isComplaint}
              onChange={(e) => setIsComplaint(e.target.checked)}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-red-900">
                Это жалоба
              </span>
              <p className="text-sm text-red-700">
                Отметьте если у вас есть серьёзные претензии к медику (некачественная работа, грубость, нарушение этики)
              </p>
            </div>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg"
        >
          {loading ? 'Отправляем...' : 'Отправить отзыв'}
        </button>
      </form>
    </div>
  );
}