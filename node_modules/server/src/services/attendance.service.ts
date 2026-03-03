import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export const attendanceService = {
  async getByGroup(academyId: string, groupId: string, date: string) {
    const group = await prisma.group.findFirst({ where: { id: groupId, academyId } });
    if (!group) throw new AppError('Group not found', 404);

    const students = await prisma.studentGroup.findMany({
      where: { groupId, isActive: true },
      include: { student: true },
    });

    const existing = await prisma.attendance.findMany({
      where: { groupId, academyId, date: new Date(date) },
    });

    const existingMap = new Map(existing.map(a => [a.studentId, a]));

    return students.map(sg => ({
      studentId: sg.studentId,
      studentName: `${sg.student.firstName} ${sg.student.lastName}`,
      attendance: existingMap.get(sg.studentId) || null,
    }));
  },

  async saveAttendance(academyId: string, groupId: string, date: string, records: Array<{ studentId: string; status: string; notes?: string }>) {
    const results = await Promise.all(
      records.map(r =>
        prisma.attendance.upsert({
          where: { studentId_groupId_date: { studentId: r.studentId, groupId, date: new Date(date) } },
          update: { status: r.status as any, notes: r.notes },
          create: { studentId: r.studentId, groupId, date: new Date(date), status: r.status as any, notes: r.notes, academyId },
        })
      )
    );
    return results;
  },

  async getStudentAttendance(academyId: string, studentId: string, params: { groupId?: string; from?: string; to?: string }) {
    const { groupId, from, to } = params;
    return prisma.attendance.findMany({
      where: {
        academyId,
        studentId,
        ...(groupId && { groupId }),
        ...(from && to && { date: { gte: new Date(from), lte: new Date(to) } }),
      },
      include: { group: { select: { name: true, sportType: true } } },
      orderBy: { date: 'desc' },
    });
  },

  async getAbsenceAlerts(academyId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttendances = await prisma.attendance.findMany({
      where: {
        academyId,
        date: { gte: thirtyDaysAgo },
        status: 'ABSENT',
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, parentPhone: true, parentEmail: true } },
        group: { select: { name: true } },
      },
    });

    const absenceMap = new Map<string, { student: any; group: any; count: number }>();
    for (const a of recentAttendances) {
      const key = `${a.studentId}_${a.groupId}`;
      if (!absenceMap.has(key)) {
        absenceMap.set(key, { student: a.student, group: a.group, count: 0 });
      }
      absenceMap.get(key)!.count++;
    }

    return Array.from(absenceMap.values()).filter(v => v.count >= 3);
  },
};
