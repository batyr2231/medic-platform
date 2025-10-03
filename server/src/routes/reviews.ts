import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

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

// Создание отзыва (только для клиентов)
router.post('/', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Только клиенты могут оставлять отзывы' });
    }

    const { orderId, rating, comment, isComplaint } = req.body;

    // Проверяем что заказ существует и завершён
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Это не ваш заказ' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Отзыв можно оставить только после завершения заказа' });
    }

    if (!order.medicId) {
      return res.status(400).json({ error: 'У заказа нет медика' });
    }

    // Проверяем что отзыв ещё не оставлен
    const existingReview = await prisma.review.findUnique({
      where: { orderId }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Отзыв уже оставлен для этого заказа' });
    }

    // Создаём отзыв
    const review = await prisma.review.create({
      data: {
        orderId,
        clientId: req.user.userId,
        medicId: order.medicId,
        rating: parseInt(rating),
        comment,
        isComplaint: isComplaint || false,
      }
    });

    // Пересчитываем рейтинг медика
    const reviews = await prisma.review.findMany({
      where: { medicId: order.medicId }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.medic.update({
      where: { userId: order.medicId },
      data: {
        ratingAvg: avgRating,
        reviewsCount: reviews.length,
      }
    });

    res.status(201).json({
      message: 'Отзыв успешно добавлен',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Ошибка создания отзыва' });
  }
});

// Получение отзывов медика
router.get('/medic/:medicId', async (req, res) => {
  try {
    const { medicId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { 
        medicId,
        isHidden: false,
      },
      include: {
        client: {
          select: {
            name: true,
          }
        },
        order: {
          select: {
            serviceType: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Ошибка получения отзывов' });
  }
});

// Получение отзыва по заказу
router.get('/order/:orderId', authenticate, async (req: any, res) => {
  try {
    const { orderId } = req.params;

    const review = await prisma.review.findUnique({
      where: { orderId },
      include: {
        client: {
          select: {
            name: true,
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    res.json({ review });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Ошибка получения отзыва' });
  }
});

// Обновление отзыва (в течение 24 часов)
router.patch('/:id', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Только клиенты могут обновлять отзывы' });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    if (review.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Это не ваш отзыв' });
    }

    // Проверяем что прошло менее 24 часов
    const hoursSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({ error: 'Отзыв можно редактировать только в течение 24 часов' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ? parseInt(rating) : review.rating,
        comment: comment !== undefined ? comment : review.comment,
      }
    });

    // Пересчитываем рейтинг медика
    const reviews = await prisma.review.findMany({
      where: { medicId: review.medicId }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.medic.update({
      where: { userId: review.medicId },
      data: {
        ratingAvg: avgRating,
      }
    });

    res.json({
      message: 'Отзыв обновлён',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Ошибка обновления отзыва' });
  }
});

// Получение всех жалоб (для админа)
router.get('/complaints', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступно только администраторам' });
    }

    const complaints = await prisma.review.findMany({
      where: { isComplaint: true },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          }
        },
        order: {
          select: {
            serviceType: true,
            address: true,
          },
          include: {
            medic: {
              select: {
                name: true,
                email: true,
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

export default router;