'use client';
import { useEffect, useState } from 'react';

interface Medic {
  id: string;
  specialty: string;
  experience: number;
  areas: string[];
  ratingAvg: number;
  reviewsCount: number;
  user: {
    id: string;
    name: string;
    phone: string;
  };
}

const SPECIALTIES = [
  'Все',
  'Терапевт',
  'Кардиолог',
  'Невролог',
  'Педиатр',
  'Хирург',
];

export default function MedicsCatalog() {
  const [medics, setMedics] = useState<Medic[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('Все');

  useEffect(() => {
    const fetchMedics = async () => {
      setLoading(true);
      try {
        const url = specialty === 'Все'
          ? 'http://localhost:3001/api/orders/catalog'
          : `http://localhost:3001/api/orders/catalog?specialty=${specialty}`;

        const response = await fetch(url);
        const data = await response.json();
        setMedics(data.medics || []);
      } catch (error) {
        console.error('Error loading medics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedics();
  }, [specialty]);

  if (loading) {
    return <div className="text-center py-8">Загрузка каталога...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Каталог медиков ({medics.length})</h2>
        
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {SPECIALTIES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {medics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Медиков не найдено
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medics.map(medic => (
            <div key={medic.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{medic.user.name}</h3>
                  <p className="text-sm text-gray-600">{medic.specialty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="font-bold">{medic.ratingAvg.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{medic.reviewsCount} отзывов</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="text-gray-500">Стаж:</span>{' '}
                  <strong>{medic.experience} лет</strong>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Телефон:</span>{' '}
                  <strong>{medic.user.phone}</strong>
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Районы:</p>
                <div className="flex flex-wrap gap-1">
                  {medic.areas.slice(0, 3).map(area => (
                    <span key={area} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {area.split(' ')[0]}
                    </span>
                  ))}
                  {medic.areas.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{medic.areas.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => window.location.href = `/medic/${medic.user.id}`}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Подробнее
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}