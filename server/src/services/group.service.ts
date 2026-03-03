import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export const groupService = {
  async findAll(academyId: string, params: { search?: string; sportType?: string; status?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const { search, sportType, status } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.GroupWhereInput = {
      academyId,
      ...(status && { status: status as any }),
      ...(sportType && { sportType: { contains: sportType, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sportType: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          trainer: { select: { id: true, name: true, photo: true } },
          schedules: true,
          _count: { select: { students: { where: { isActive: true } } } },
        },
      }),
      prisma.group.count({ where }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findById(academyId: string, id: string) {
    const group = await prisma.group.findFirst({
      where: { id, academyId },
      include: {
        trainer: true,
        schedules: true,
        students: {
          where: { isActive: true },
          include: { student: true },
        },
      },
    });
    if (!group) throw new AppError('Group not found', 404);
    return group;
  },

  async create(academyId: string, data: any) {
    const { schedules, ...groupData } = data;
    return prisma.group.create({
      data: {
        ...groupData,
        academyId,
        ...(schedules && {
          schedules: { create: schedules },
        }),
      },
      include: { schedules: true, trainer: true },
    });
  },

  async update(academyId: string, id: string, data: any) {
    const group = await prisma.group.findFirst({ where: { id, academyId } });
    if (!group) throw new AppError('Group not found', 404);
    const { schedules, ...groupData } = data;
    if (schedules) {
      await prisma.schedule.deleteMany({ where: { groupId: id } });
      return prisma.group.update({
        where: { id },
        data: { ...groupData, schedules: { create: schedules } },
        include: { schedules: true, trainer: true },
      });
    }
    return prisma.group.update({ where: { id }, data: groupData, include: { schedules: true, trainer: true } });
  },

  async delete(academyId: string, id: string) {
    const group = await prisma.group.findFirst({ where: { id, academyId } });
    if (!group) throw new AppError('Group not found', 404);
    await prisma.group.delete({ where: { id } });
  },

  async getOccupancy(academyId: string) {
    const groups = await prisma.group.findMany({
      where: { academyId, status: 'ACTIVE' },
      include: { _count: { select: { students: { where: { isActive: true } } } } },
    });
    return groups.map(g => ({
      id: g.id,
      name: g.name,
      capacity: g.capacity,
      enrolled: g._count.students,
      occupancy: Math.round((g._count.students / g.capacity) * 100),
    }));
  },
};
