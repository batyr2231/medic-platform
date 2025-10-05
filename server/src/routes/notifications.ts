import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import admin from 'firebase-admin';
import * as path from 'path';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Инициализация Firebase Admin
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('✅ Firebase Admin инициализирован (env vars)');
    } else {
      const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin инициализирован (file)');
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Ошибка Firebase:', err.message);
  }
}

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

router.post('/register', authenticate, async (req: any, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM токен не предоставлен' });
    }

    if (req.user.role === 'MEDIC') {
      await prisma.medic.update({
        where: { userId: req.user.userId },
        data: { pushToken: fcmToken }
      });
      
      console.log(`FCM токен сохранён для медика ${req.user.userId}`);
    }

    res.json({ message: 'FCM токен сохранён' });
  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({ error: 'Ошибка сохранения токена' });
  }
});

export const notifyMedicsAboutNewOrder = async (orderId: string, areas: string[]) => {
  try {
    console.log(`Отправка уведомлений о новом заказе ${orderId}`);

    const medics = await prisma.medic.findMany({
      where: {
        status: 'APPROVED',
        pushToken: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          }
        }
      }
    });

    if (medics.length === 0) {
      console.log('Нет медиков с push-токенами');
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    console.log(`Найдено ${medics.length} медиков для уведомления`);

    const tokens = medics.map(m => m.pushToken).filter(Boolean) as string[];

    if (admin.apps.length > 0 && tokens.length > 0) {
      const message = {
        notification: {
          title: 'Новый заказ!',
          body: `${order.serviceType} - ${order.address}`,
        },
        data: {
          orderId: order.id,
          type: 'new_order',
        },
        tokens: tokens,
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Отправлено ${response.successCount} push-уведомлений`);
        
        if (response.failureCount > 0) {
          console.log(`Ошибок отправки: ${response.failureCount}`);
        }

        await Promise.all(
          medics.map(medic =>
            prisma.notification.create({
              data: {
                userId: medic.userId,
                channel: 'PUSH',
                type: 'NEW_ORDER',
                orderId: order.id,
                title: message.notification.title,
                body: message.notification.body,
                status: 'SENT',
              }
            })
          )
        );

      } catch (error) {
        console.error('Ошибка отправки push:', error);
      }
    } else {
      console.log('Firebase не настроен или нет токенов');
    }

  } catch (error) {
    console.error('Ошибка уведомлений:', error);
  }
};

export const notifyClientAboutAcceptedOrder = async (orderId: string, medicName: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true }
    });

    if (!order) return;

    await prisma.notification.create({
      data: {
        userId: order.clientId,
        channel: 'PUSH',
        type: 'ORDER_ACCEPTED',
        orderId: order.id,
        title: 'Заказ принят!',
        body: `Медик ${medicName} принял ваш заказ`,
        status: 'SENT',
      }
    });

    console.log(`Уведомление клиенту ${order.client.name} о принятии заказа`);
  } catch (error) {
    console.error('Error notifying client:', error);
  }
};

export default router;