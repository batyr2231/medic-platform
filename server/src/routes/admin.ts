import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для проверки админа
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступ запрещён. Только для администраторов' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};

// Получение всех медиков для модерации
router.get('/medics', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const medics = await prisma.medic.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          }
        }
      },
      orderBy: { user: { createdAt: 'desc' } }
    });

    res.json({ medics });
  } catch (error) {
    console.error('Get medics error:', error);
    res.status(500).json({ error: 'Ошибка получения списка медиков' });
  }
});

// Модерация медика (approve/reject)
router.patch('/medics/:userId/status', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'BANNED'].includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const medic = await prisma.medic.update({
      where: { userId },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    res.json({
      message: `Статус медика обновлён на ${status}`,
      medic
    });
  } catch (error) {
    console.error('Update medic status error:', error);
    res.status(500).json({ error: 'Ошибка обновления статуса медика' });
  }
});

// Получение всех заказов
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    const orders = await prisma.order.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        medic: {
          select: {
            name: true,
            email: true,
            phone: true,
            medicProfile: {
              select: {
                specialty: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});

// Просмотр чата заказа
router.get('/orders/:orderId/messages', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    const messages = await prisma.message.findMany({
      where: { orderId },
      include: {
        from: {
          select: {
            name: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Ошибка получения сообщений' });
  }
});

// Получение всех жалоб
router.get('/complaints', authenticateAdmin, async (req, res) => {
  try {
    const complaints = await prisma.review.findMany({
      where: { isComplaint: true },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        order: {
          select: {
            serviceType: true,
            address: true,
            scheduledTime: true,
          },
          include: {
            medic: {
              select: {
                name: true,
                email: true,
                phone: true,
                medicProfile: {
                  select: {
                    specialty: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Ошибка получения жалоб' });
  }
});

// Скрыть отзыв
router.patch('/reviews/:id/hide', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { isHidden }
    });

    res.json({
      message: isHidden ? 'Отзыв скрыт' : 'Отзыв показан',
      review
    });
  } catch (error) {
    console.error('Hide review error:', error);
    res.status(500).json({ error: 'Ошибка скрытия отзыва' });
  }
});

// Статистика платформы
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalOrders,
      completedOrders,
      totalMedics,
      approvedMedics,
      totalClients,
      totalReviews,
      avgRating,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.medic.count(),
      prisma.medic.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    // Заказы за последние 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // Процент принятых заказов быстро
    const ordersWithMedic = await prisma.order.findMany({
      where: {
        medicId: { not: null },
        status: { not: 'NEW' }
      },
      select: {
        createdAt: true,
        updatedAt: true,
      }
    });

    const fastAccepted = ordersWithMedic.filter(order => {
      const diff = order.updatedAt.getTime() - order.createdAt.getTime();
      return diff <= 15 * 60 * 1000; // 15 минут
    });

    const fastAcceptedPercent = ordersWithMedic.length > 0
      ? (fastAccepted.length / ordersWithMedic.length) * 100
      : 0;

    res.json({
      stats: {
        totalOrders,
        completedOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        totalMedics,
        approvedMedics,
        pendingMedics: totalMedics - approvedMedics,
        totalClients,
        totalReviews,
        avgRating: avgRating._avg.rating || 0,
        recentOrders,
        fastAcceptedPercent: fastAcceptedPercent.toFixed(1),
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

export default router;