import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { notifyMedicsAboutNewOrder } from './notifications';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для проверки токена
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};

// Создание заказа (только для клиентов)
router.post('/', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Только клиенты могут создавать заказы' });
    }

    const { serviceType, address, scheduledTime, comment } = req.body;

    // Создание заказа
    const order = await prisma.order.create({
      data: {
        clientId: req.user.userId,
        serviceType,
        address,
        scheduledTime: new Date(scheduledTime),
        comment,
        status: 'NEW',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        }
      }
    });

    console.log('Заказ создан, отправляем уведомления...');
    await notifyMedicsAboutNewOrder(order.id, []);
    console.log('Уведомления отправлены');

    res.status(201).json({
      message: 'Заказ успешно создан',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

// Получение всех заказов пользователя
router.get('/my', authenticate, async (req: any, res) => {
  try {
    let orders;

    if (req.user.role === 'CLIENT') {
      // Клиент видит свои заказы
      orders = await prisma.order.findMany({
        where: { clientId: req.user.userId },
        include: {
          medic: {
            select: {
              id: true,
              name: true,
              phone: true,
              medicProfile: {
                select: {
                  specialty: true,
                  ratingAvg: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (req.user.role === 'MEDIC') {
      // Медик видит заказы где он назначен
      orders = await prisma.order.findMany({
        where: { medicId: req.user.userId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ orders });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});



// Получение доступных заказов для медика
router.get('/available', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'MEDIC') {
      return res.status(403).json({ error: 'Доступно только медикам' });
    }

    // Получаем районы медика
    const medic = await prisma.medic.findUnique({
      where: { userId: req.user.userId }
    });

    if (!medic) {
      return res.status(404).json({ error: 'Профиль медика не найден' });
    }

    // Находим новые заказы в районах медика
    const orders = await prisma.order.findMany({
      where: {
        status: 'NEW',
        medicId: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });

  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ error: 'Ошибка получения доступных заказов' });
  }
});

// Принятие заказа медиком
router.post('/:id/accept', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'MEDIC') {
      return res.status(403).json({ error: 'Только медики могут принимать заказы' });
    }

    const { id } = req.params;

    // Проверяем что заказ свободен
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.medicId) {
      return res.status(400).json({ error: 'Заказ уже принят другим медиком' });
    }

    // Принимаем заказ
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        medicId: req.user.userId,
        status: 'ACCEPTED',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        medic: {
          select: {
            id: true,
            name: true,
            phone: true,
            medicProfile: {
              select: {
                specialty: true,
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Заказ успешно принят',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ error: 'Ошибка принятия заказа' });
  }
});

// Обновление статуса заказа
router.patch('/:id/status', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Проверяем права
    if (req.user.role === 'CLIENT' && order.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа к этому заказу' });
    }

    if (req.user.role === 'MEDIC' && order.medicId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа к этому заказу' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        medic: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        }
      }
    });

    res.json({
      message: 'Статус заказа обновлен',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

// Отметка об оплате
router.post('/:id/paid', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'MEDIC') {
      return res.status(403).json({ error: 'Только медики могут отмечать оплату' });
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.medicId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа к этому заказу' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus: 'PAID' }
    });

    res.json({
      message: 'Оплата отмечена',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ error: 'Ошибка отметки оплаты' });
  }
});


// Получение каталога медиков
router.get('/catalog', async (req, res) => {
  try {
    const { specialty, area, minRating } = req.query;

    const where: any = {
      status: 'APPROVED',
    };

    if (specialty) {
      where.specialty = specialty;
    }

    if (area) {
      where.areas = { has: area as string };
    }

    if (minRating) {
      where.ratingAvg = { gte: parseFloat(minRating as string) };
    }

    const medics = await prisma.medic.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        }
      },
      orderBy: { ratingAvg: 'desc' }
    });

    res.json({ medics });
  } catch (error) {
    console.error('Get medics catalog error:', error);
    res.status(500).json({ error: 'Ошибка получения каталога' });
  }
});
export default router;