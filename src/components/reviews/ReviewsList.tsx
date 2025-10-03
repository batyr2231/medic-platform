'use client';
import { useEffect, useState } from 'react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  isComplaint: boolean;
  createdAt: string;
  client: {
    name: string;
  };
  order: {
    serviceType: string;
  };
}

export default function ReviewsList({ medicId }: { medicId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/reviews/medic/${medicId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading reviews:', err);
        setLoading(false);
      });
  }, [medicId]);

  if (loading) {
    return <div className="text-center py-4">Загрузка отзывов...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Пока нет отзывов
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{review.client.name}</p>
              <p className="text-sm text-gray-500">
                {review.order.serviceType}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {review.comment && (
            <p className="text-gray-700 mb-2">{review.comment}</p>
          )}

          {review.isComplaint && (
            <div className="bg-red-50 text-red-700 px-3 py-1 rounded text-sm inline-block">
              Жалоба
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
      ))}
    </div>
  );
}