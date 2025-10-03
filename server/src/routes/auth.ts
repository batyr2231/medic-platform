import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, specialty, experience, areas } = req.body;

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email или телефоном уже существует' 
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'CLIENT',
      }
    });

    // Если это медик, создаем профиль медика
    if (role === 'MEDIC') {
      await prisma.medic.create({
        data: {
          userId: user.id,
          specialty: specialty || '',
          experience: parseInt(experience) || 0,
          areas: areas || [],
        }
      });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Получаем полные данные пользователя
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        medicProfile: true
      }
    });

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: fullUser!.id,
        name: fullUser!.name,
        email: fullUser!.email,
        phone: fullUser!.phone,
        role: fullUser!.role,
        medicProfile: fullUser!.medicProfile
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        medicProfile: true
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Создаем токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Успешный вход',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        medicProfile: user.medicProfile
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Получение текущего пользователя (требует токен)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        medicProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      medicProfile: user.medicProfile
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Недействительный токен' });
  }
});

export default router;