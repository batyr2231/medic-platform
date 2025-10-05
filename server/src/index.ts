import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import ordersRoutes from './routes/orders';
import reviewsRoutes from './routes/reviews';
import adminRoutes from './routes/admin';
import { prisma } from './lib/prisma';
import notificationsRoutes from './routes/notifications';

// Загружаем переменные окружения
dotenv.config({ path: '../.env' });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://medic-platform.vercel.app', // замените на ваш реальный Vercel домен
  ],
  credentials: true
}));
app.use(express.json());

// Базовые роуты
app.get('/', (req, res) => {
  res.json({ 
    message: 'Medic Platform API работает!', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend сервер запущен и работает!'
  });
});

// Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Тестовый роут
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Тестовый роут работает',
    data: {
      users: ['Клиент 1', 'Медик 1'],
      orders: ['Заказ 1', 'Заказ 2']
    }
  });
});

// Socket.IO для чата
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Присоединение к комнате заказа
  socket.on('join_order', async (orderId: string) => {
    socket.join(`order_${orderId}`);
    console.log(`Пользователь ${socket.id} присоединился к заказу ${orderId}`);
    
    // Загружаем историю сообщений
    try {
      const messages = await prisma.message.findMany({
        where: { orderId },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      
      socket.emit('message_history', messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  });

  // Отправка сообщения
  socket.on('send_message', async (data) => {
    const { orderId, fromUserId, text, fileUrl } = data;
    
    try {
      const message = await prisma.message.create({
        data: {
          orderId,
          fromUserId,
          text,
          fileUrl,
          fileType: fileUrl ? 'FILE' : 'TEXT',
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        }
      });

      // Отправляем всем в комнате
      io.to(`order_${orderId}`).emit('new_message', message);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      socket.emit('message_error', { error: 'Не удалось отправить сообщение' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Backend сервер запущен на http://localhost:${PORT}`);
  console.log(`📡 Socket.IO готов к подключениям`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Завершение работы сервера...');
  await prisma.$disconnect();
  process.exit(0);
});