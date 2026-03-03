import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export const studentService = {
  async findAll(academyId: string, params: { search?: string; status?: string; groupId?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const { search, status, groupId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      academyId,
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { parentName: { contains: search, mode: 'insensitive' } },
          { parentEmail: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(groupId && {
        groups: { some: { groupId, isActive: true } },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          groups: {
            where: { isActive: true },
            include: { group: { select: { id: true, name: true, sportType: true } } },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findById(academyId: string, id: string) {
    const student = await prisma.student.findFirst({
      where: { id, academyId },
      include: {
        groups: {
          include: { group: { include: { trainer: true, schedules: true } } },
          orderBy: { startDate: 'desc' },
        },
        payments: { orderBy: { year: 'desc' }, take: 12 },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
      },
    });
    if (!student) throw new AppError('Student not found', 404);
    return student;
  },

  async create(academyId: string, data: any) {
    return prisma.student.create({
      data: { ...data, academyId },
      include: { groups: true },
    });
  },

  async update(academyId: string, id: string, data: any) {
    const student = await prisma.student.findFirst({ where: { id, academyId } });
    if (!student) throw new AppError('Student not found', 404);
    return prisma.student.update({ where: { id }, data });
  },

  async delete(academyId: string, id: string) {
    const student = await prisma.student.findFirst({ where: { id, academyId } });
    if (!student) throw new AppError('Student not found', 404);
    await prisma.student.delete({ where: { id } });
  },

  async assignGroup(academyId: string, studentId: string, groupId: string, startDate?: Date) {
    const [student, group] = await Promise.all([
      prisma.student.findFirst({ where: { id: studentId, academyId } }),
      prisma.group.findFirst({ where: { id: groupId, academyId } }),
    ]);
    if (!student) throw new AppError('Student not found', 404);
    if (!group) throw new AppError('Group not found', 404);

    const existing = await prisma.studentGroup.findFirst({ where: { studentId, groupId, isActive: true } });
    if (existing) throw new AppError('Student already in this group', 400);

    return prisma.studentGroup.create({
      data: { studentId, groupId, startDate: startDate || new Date(), isActive: true },
    });
  },

  async removeGroup(academyId: string, studentId: string, groupId: string) {
    const student = await prisma.student.findFirst({ where: { id: studentId, academyId } });
    if (!student) throw new AppError('Student not found', 404);
    await prisma.studentGroup.updateMany({
      where: { studentId, groupId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });
  },
};
