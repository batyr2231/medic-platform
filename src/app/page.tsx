'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">🏥 MediCare</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600">Услуги</a>
              <a href="#doctors" className="text-gray-700 hover:text-blue-600">Врачи</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">О нас</a>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/login" className="px-4 py-2 text-blue-600 hover:text-blue-700">
                Войти
              </Link>
              <Link href="/auth/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Начать
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Медицинская помощь
              <br />
              <span className="text-yellow-300">у вас дома</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Квалифицированные врачи приедут к вам в течение 30 минут. 
              Профессионально, быстро, безопасно.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register" 
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition">
                Вызвать врача
              </Link>
              <a href="#doctors" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition">
                Наши специалисты
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Врачей' },
              { number: '5000+', label: 'Визитов' },
              { number: '4.9★', label: 'Рейтинг' },
              { number: '24/7', label: 'Доступность' },
            ].map((stat, i) => (
              <div key={i} className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Популярные услуги</h2>
            <p className="text-xl text-gray-600">Выберите нужную вам медицинскую помощь</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🩺', title: 'Вызов терапевта', desc: 'Консультация и осмотр на дому', price: 'от 3000₸' },
              { icon: '💉', title: 'Анализы на дому', desc: 'Забор крови и других материалов', price: 'от 2000₸' },
              { icon: '🏥', title: 'ЭКГ', desc: 'Электрокардиограмма с расшифровкой', price: 'от 4000₸' },
              { icon: '💊', title: 'Капельница', desc: 'Внутривенное введение препаратов', price: 'от 5000₸' },
              { icon: '🩹', title: 'Перевязки', desc: 'Обработка ран и смена повязок', price: 'от 2500₸' },
              { icon: '👶', title: 'Педиатр', desc: 'Детский врач на дом', price: 'от 4000₸' },
            ].map((service, i) => (
              <div key={i} 
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-600">{service.price}</span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Заказать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши специалисты</h2>
            <p className="text-xl text-gray-600">Опытные врачи с подтверждённой квалификацией</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Др. Иванов А.', spec: 'Терапевт', exp: '15 лет', rating: '4.9' },
              { name: 'Др. Петрова М.', spec: 'Кардиолог', exp: '12 лет', rating: '4.8' },
              { name: 'Др. Сидоров Д.', spec: 'Педиатр', exp: '10 лет', rating: '5.0' },
            ].map((doctor, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white">
                  👨‍⚕️
                </div>
                <h3 className="text-xl font-bold mb-2">{doctor.name}</h3>
                <p className="text-gray-600 mb-1">{doctor.spec}</p>
                <p className="text-sm text-gray-500 mb-3">{doctor.exp} опыта</p>
                <div className="flex justify-center items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{doctor.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Как это работает</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📱', title: 'Выберите услугу', desc: 'Укажите нужную медицинскую помощь' },
              { step: '2', icon: '🏥', title: 'Закажите визит', desc: 'Заполните простую форму заказа' },
              { step: '3', icon: '👨‍⚕️', title: 'Встретьте врача', desc: 'Специалист приедет в указанное время' },
              { step: '4', icon: '✅', title: 'Оплатите', desc: 'Оплата после оказания услуги' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Отзывы клиентов</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Анна К.', text: 'Отличный сервис! Врач приехал через 20 минут. Профессионально и быстро.', rating: 5 },
              { name: 'Дмитрий М.', text: 'Удобно заказать через приложение. Цены адекватные. Рекомендую!', rating: 5 },
              { name: 'Елена С.', text: 'Спасибо за оперативность. Доктор был очень внимательным и компетентным.', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-500">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{review.text}"</p>
                <p className="font-semibold">— {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Готовы получить помощь прямо сейчас?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Присоединяйтесь к тысячам довольных клиентов
          </p>
          <Link href="/auth/register" 
            className="inline-block px-10 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition">
            Вызвать врача →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🏥 MediCare</h3>
              <p className="text-gray-400">Профессиональная медицинская помощь на дому</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Вызов терапевта</li>
                <li>Анализы</li>
                <li>ЭКГ на дому</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li>О нас</li>
                <li>Контакты</li>
                <li>Вакансии</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 +7 (777) 123-45-67</li>
                <li>📧 info@medicare.kz</li>
                <li>📍 Алматы, Казахстан</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 MediCare. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}