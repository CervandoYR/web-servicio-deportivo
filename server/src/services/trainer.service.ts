import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export const trainerService = {
  async findAll(academyId: string, params: { search?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const { search } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.TrainerWhereInput = {
      academyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { specialty: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.trainer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { groups: true } } },
      }),
      prisma.trainer.count({ where }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findById(academyId: string, id: string) {
    const trainer = await prisma.trainer.findFirst({
      where: { id, academyId },
      include: {
        groups: {
          include: { _count: { select: { students: true } }, schedules: true },
        },
      },
    });
    if (!trainer) throw new AppError('Trainer not found', 404);
    return trainer;
  },

  async create(academyId: string, data: any) {
    const { speciality, ...rest } = data;
    return prisma.trainer.create({
      data: { ...rest, specialty: speciality ?? rest.specialty, academyId },
    });
  },

  async update(academyId: string, id: string, data: any) {
    const trainer = await prisma.trainer.findFirst({ where: { id, academyId } });
    if (!trainer) throw new AppError('Trainer not found', 404);
    const { speciality, ...rest } = data;
    return prisma.trainer.update({
      where: { id },
      data: { ...rest, ...(speciality !== undefined && { specialty: speciality }) },
    });
  },

  async delete(academyId: string, id: string) {
    const trainer = await prisma.trainer.findFirst({ where: { id, academyId } });
    if (!trainer) throw new AppError('Trainer not found', 404);
    await prisma.trainer.delete({ where: { id } });
  },
};
