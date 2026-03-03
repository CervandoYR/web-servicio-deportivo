import prisma from '../lib/prisma';

export const dashboardService = {
  async getStats(academyId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const [
      totalStudents,
      activeStudents,
      totalTrainers,
      totalGroups,
      newLeads,
      monthlyRevenue,
      lastMonthRevenue,
      pendingPayments,
      overduePayments,
    ] = await Promise.all([
      prisma.student.count({ where: { academyId } }),
      prisma.student.count({ where: { academyId, status: 'ACTIVE' } }),
      prisma.trainer.count({ where: { academyId, isActive: true } }),
      prisma.group.count({ where: { academyId, status: 'ACTIVE' } }),
      prisma.lead.count({ where: { academyId, status: 'NEW' } }),
      prisma.payment.aggregate({ where: { academyId, status: 'PAID', month: currentMonth, year: currentYear }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { academyId, status: 'PAID', month: lastMonth, year: lastMonthYear }, _sum: { amount: true } }),
      prisma.payment.count({ where: { academyId, status: 'PENDING' } }),
      prisma.payment.count({ where: { academyId, status: 'OVERDUE' } }),
    ]);

    const revenueGrowth = monthlyRevenue._sum.amount && lastMonthRevenue._sum.amount
      ? ((Number(monthlyRevenue._sum.amount) - Number(lastMonthRevenue._sum.amount)) / Number(lastMonthRevenue._sum.amount)) * 100
      : 0;

    return {
      totalStudents,
      activeStudents,
      totalTrainers,
      totalGroups,
      newLeads,
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      lastMonthRevenue: Number(lastMonthRevenue._sum.amount || 0),
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      pendingPayments,
      overduePayments,
    };
  },

  async getMonthlyRevenue(academyId: string, months = 12) {
    const now = new Date();
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const result = await prisma.payment.aggregate({
        where: { academyId, status: 'PAID', month, year },
        _sum: { amount: true },
      });

      data.push({
        month,
        year,
        label: date.toLocaleString('es', { month: 'short', year: '2-digit' }),
        amount: Number(result._sum.amount || 0),
      });
    }

    return data;
  },

  async getGroupOccupancy(academyId: string) {
    return prisma.group.findMany({
      where: { academyId, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        sportType: true,
        capacity: true,
        _count: { select: { students: { where: { isActive: true } } } },
      },
    });
  },

  async getRecentActivity(academyId: string) {
    const [recentStudents, recentLeads, recentPayments] = await Promise.all([
      prisma.student.findMany({
        where: { academyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, createdAt: true },
      }),
      prisma.lead.findMany({
        where: { academyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, status: true, createdAt: true },
      }),
      prisma.payment.findMany({
        where: { academyId, status: 'PAID' },
        orderBy: { paidAt: 'desc' },
        take: 5,
        include: { student: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    return { recentStudents, recentLeads, recentPayments };
  },
};
