import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export const paymentService = {
  async findAll(academyId: string, params: { studentId?: string; status?: string; month?: number; year?: number; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const { studentId, status } = params;
    const month = params.month ? Number(params.month) : undefined;
    const year = params.year ? Number(params.year) : undefined;
    const skip = (page - 1) * limit;
    const where: Prisma.PaymentWhereInput = {
      academyId,
      ...(studentId && { studentId }),
      ...(status && { status: status as any }),
      ...(month && { month }),
      ...(year && { year }),
    };
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async markPaid(academyId: string, id: string, method: string) {
    const payment = await prisma.payment.findFirst({ where: { id, academyId } });
    if (!payment) throw new AppError('Payment not found', 404);
    return prisma.payment.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date(), method },
    });
  },

  async generateMonthlyPayments(academyId: string, month: number, year: number) {
    const studentGroups = await prisma.studentGroup.findMany({
      where: { isActive: true, group: { academyId } },
      include: { group: true },
    });

    const created = [];
    for (const sg of studentGroups) {
      const dueDate = new Date(year, month - 1, 10);
      try {
        const payment = await prisma.payment.upsert({
          where: { studentId_groupId_month_year: { studentId: sg.studentId, groupId: sg.groupId, month, year } },
          update: {},
          create: {
            academyId,
            studentId: sg.studentId,
            groupId: sg.groupId,
            month,
            year,
            amount: sg.group.monthlyPrice,
            status: 'PENDING',
            dueDate,
          },
        });
        created.push(payment);
      } catch {
        // Skip duplicates
      }
    }
    return created;
  },

  async getDashboardStats(academyId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [totalPaid, totalPending, totalOverdue, monthlyRevenue] = await Promise.all([
      prisma.payment.aggregate({ where: { academyId, status: 'PAID', year: currentYear, month: currentMonth }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { academyId, status: 'PENDING' }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { academyId, status: 'OVERDUE' }, _sum: { amount: true }, _count: true }),
      prisma.payment.groupBy({
        by: ['month', 'year'],
        where: { academyId, status: 'PAID', year: { gte: currentYear - 1 } },
        _sum: { amount: true },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      }),
    ]);

    return { totalPaid, totalPending, totalOverdue, monthlyRevenue };
  },

  async updateOverdue(academyId: string) {
    const today = new Date();
    return prisma.payment.updateMany({
      where: { academyId, status: 'PENDING', dueDate: { lt: today } },
      data: { status: 'OVERDUE' },
    });
  },
};
