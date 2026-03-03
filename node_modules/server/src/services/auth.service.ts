import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';

export const authService = {
  async login(academySlug: string, email: string, password: string) {
    const academy = await prisma.academy.findUnique({ where: { slug: academySlug } });
    if (!academy) throw new AppError('Academy not found', 404);

    const user = await prisma.user.findUnique({
      where: { academyId_email: { academyId: academy.id, email } },
    });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const payload = { userId: user.id, academyId: academy.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      academy: { id: academy.id, name: academy.name, slug: academy.slug, primaryColor: academy.primaryColor, logo: academy.logo },
    };
  },

  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.userId, refreshToken: token },
    });
    if (!user) throw new AppError('Invalid refresh token', 401);

    const newPayload = { userId: user.id, academyId: payload.academyId, role: user.role };
    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return { accessToken, refreshToken };
  },

  async logout(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  },

  async createUser(academyId: string, data: { name: string; email: string; password: string; role?: UserRole }) {
    const exists = await prisma.user.findUnique({
      where: { academyId_email: { academyId, email: data.email } },
    });
    if (exists) throw new AppError('Email already in use', 409);

    const hashed = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: { ...data, password: hashed, academyId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { academy: true },
    });
    if (!user) throw new AppError('User not found', 404);
    const { password: _p, refreshToken: _r, ...safe } = user;
    return safe;
  },
};
