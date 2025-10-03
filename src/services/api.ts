import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Типы данных
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'MEDIC' | 'ADMIN';
  medicProfile?: {
    id: string;
    specialty: string;
    experience: number;
    status: string;
    ratingAvg: number;
    reviewsCount: number;
  };
}

export interface Order {
  id: string;
  serviceType: string;
  address: string;
  scheduledTime: string;
  status: string;
  paymentStatus: string;
  comment?: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
  medic?: {
    id: string;
    name: string;
    phone: string;
    specialty: string;
  };
  createdAt: string;
}

// Основные API функции
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    specialty?: string;
    experience?: number;
    areas?: string[];
  }) => api.post('/auth/register', data),
  
  getCurrentUser: () => api.get('/auth/me'),
};

export const ordersAPI = {
  getOrders: () => api.get('/orders'),
  createOrder: (data: {
    serviceType: string;
    address: string;
    scheduledTime: string;
    comment?: string;
  }) => api.post('/orders', data),
  
  acceptOrder: (id: string) => api.post(`/orders/${id}/accept`),
  updateStatus: (id: string, status: string) => 
    api.patch(`/orders/${id}/status`, { status }),
  markAsPaid: (id: string) => api.post(`/orders/${id}/paid`),
};