import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const landingService = {
  async getPublicSections(slug: string) {
    const academy = await prisma.academy.findUnique({
      where: { slug },
      include: {
        landingSections: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: { media: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!academy) throw new AppError('Academy not found', 404);

    const trainerSection = academy.landingSections.find((s: any) => s.type === 'trainers');
    const selectedIds: string[] | undefined = (trainerSection?.content as any)?.selectedTrainerIds;

    const [trainers, groups] = await Promise.all([
      prisma.trainer.findMany({
        where: {
          academyId: academy.id,
          isActive: true,
          ...(selectedIds?.length ? { id: { in: selectedIds } } : {}),
        },
        orderBy: { name: 'asc' },
      }),
      prisma.group.findMany({
        where: { academyId: academy.id, status: 'ACTIVE' },
        include: {
          trainer: { select: { id: true, name: true, specialty: true } },
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          _count: { select: { students: { where: { isActive: true } } } },
        },
        orderBy: [{ sportType: 'asc' }, { name: 'asc' }],
      }),
    ]);

    const groupsWithDays = groups.map((g: any) => ({
      ...g,
      scheduleSummary: g.schedules
        .map((s: any) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}-${s.endTime}`)
        .join(' | '),
    }));

    return { academy, sections: academy.landingSections, trainers, groups: groupsWithDays };
  },

  async getSections(academyId: string) {
    return prisma.landingSection.findMany({
      where: { academyId },
      orderBy: { order: 'asc' },
      include: { media: { orderBy: { order: 'asc' } } },
    });
  },

  async createSection(academyId: string, data: any) {
    const last = await prisma.landingSection.findFirst({
      where: { academyId },
      orderBy: { order: 'desc' },
    });
    return prisma.landingSection.create({
      data: { type: data.type, content: data.content || {}, academyId, order: (last?.order || 0) + 1 },
    });
  },

  async updateSection(academyId: string, id: string, data: any) {
    const section = await prisma.landingSection.findFirst({ where: { id, academyId } });
    if (!section) throw new AppError('Section not found', 404);
    return prisma.landingSection.update({ where: { id }, data: { content: data.content, isActive: data.isActive } });
  },

  async toggleSection(academyId: string, id: string) {
    const section = await prisma.landingSection.findFirst({ where: { id, academyId } });
    if (!section) throw new AppError('Section not found', 404);
    return prisma.landingSection.update({ where: { id }, data: { isActive: !section.isActive } });
  },

  async reorderSections(academyId: string, orders: Array<{ id: string; order: number }>) {
    const updates = orders.map(({ id, order }) =>
      prisma.landingSection.updateMany({ where: { id, academyId }, data: { order } })
    );
    await Promise.all(updates);
    return this.getSections(academyId);
  },

  async deleteSection(academyId: string, id: string) {
    const section = await prisma.landingSection.findFirst({ where: { id, academyId } });
    if (!section) throw new AppError('Section not found', 404);
    await prisma.landingSection.delete({ where: { id } });
  },

  async addMedia(academyId: string, sectionId: string, data: { url: string; key?: string; altText?: string }) {
    const section = await prisma.landingSection.findFirst({ where: { id: sectionId, academyId } });
    if (!section) throw new AppError('Section not found', 404);
    const last = await prisma.landingMedia.findFirst({ where: { sectionId }, orderBy: { order: 'desc' } });
    return prisma.landingMedia.create({
      data: { url: data.url, key: data.key, altText: data.altText, sectionId, academyId, order: (last?.order ?? 0) + 1 },
    });
  },

  async deleteMedia(academyId: string, id: string) {
    const media = await prisma.landingMedia.findFirst({ where: { id, academyId } });
    if (!media) throw new AppError('Media not found', 404);
    await prisma.landingMedia.delete({ where: { id } });
  },

  async getTrainers(academyId: string) {
    return prisma.trainer.findMany({ where: { academyId, isActive: true }, orderBy: { name: 'asc' } });
  },

  async submitPublicLead(slug: string, data: { name: string; email?: string; phone?: string; message?: string; sportInterest?: string }) {
    const academy = await prisma.academy.findUnique({ where: { slug } });
    if (!academy) throw new AppError('Academy not found', 404);
    return prisma.lead.create({
      data: {
        academyId: academy.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        notes: data.message,
        sportInterest: data.sportInterest,
        source: 'Landing page',
        status: 'NEW',
      },
    });
  },
};
