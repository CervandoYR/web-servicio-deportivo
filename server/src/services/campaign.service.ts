import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { sendEmail } from '../utils/email';
import { Prisma } from '@prisma/client';

export const campaignService = {
  async findAll(academyId: string, params: { page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.campaign.findMany({
        where: { academyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { logs: true } } },
      }),
      prisma.campaign.count({ where: { academyId } }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async create(academyId: string, data: any) {
    const { segment, body, ...rest } = data;
    return prisma.campaign.create({
      data: {
        ...rest,
        body: body || '',
        targetSegment: segment || 'ALL',
        type: data.type || 'EMAIL',
        academyId,
      },
    });
  },

  async update(academyId: string, id: string, data: any) {
    const c = await prisma.campaign.findFirst({ where: { id, academyId } });
    if (!c) throw new AppError('Campaign not found', 404);
    return prisma.campaign.update({ where: { id }, data });
  },

  async delete(academyId: string, id: string) {
    const c = await prisma.campaign.findFirst({ where: { id, academyId } });
    if (!c) throw new AppError('Campaign not found', 404);
    await prisma.campaign.delete({ where: { id } });
  },

  async getRecipients(academyId: string, targetSegment: string, groupId?: string): Promise<Array<{ id: string; name: string; email?: string | null; phone?: string | null }>> {
    switch (targetSegment.toUpperCase()) {
      case 'ALL':
      case 'ACTIVE':
      case 'ALL_STUDENTS': {
        const students = await prisma.student.findMany({
          where: { academyId, status: 'ACTIVE' },
          select: { id: true, firstName: true, lastName: true, parentEmail: true, parentPhone: true },
        });
        return students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, email: s.parentEmail, phone: s.parentPhone }));
      }
      case 'OVERDUE': {
        const payments = await prisma.payment.findMany({
          where: { academyId, status: 'OVERDUE' },
          include: { student: { select: { id: true, firstName: true, lastName: true, parentEmail: true, parentPhone: true } } },
        });
        const unique = new Map(payments.map(p => [p.studentId, p.student]));
        return Array.from(unique.values()).map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, email: s.parentEmail, phone: s.parentPhone }));
      }
      case 'LEADS': {
        const leads = await prisma.lead.findMany({
          where: { academyId, status: { in: ['NEW', 'CONTACTED'] } },
          select: { id: true, name: true, email: true, phone: true },
        });
        return leads.map(l => ({ id: l.id, name: l.name, email: l.email, phone: l.phone }));
      }
      case 'GROUP': {
        if (!groupId) return [];
        const sgs = await prisma.studentGroup.findMany({
          where: { groupId, isActive: true },
          include: { student: { select: { id: true, firstName: true, lastName: true, parentEmail: true, parentPhone: true } } },
        });
        return sgs.map(sg => ({ id: sg.student.id, name: `${sg.student.firstName} ${sg.student.lastName}`, email: sg.student.parentEmail, phone: sg.student.parentPhone }));
      }
      default:
        return [];
    }
  },

  async send(academyId: string, id: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id, academyId } });
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (campaign.status === 'SENT') throw new AppError('Campaign already sent', 400);

    await prisma.campaign.update({ where: { id }, data: { status: 'SENDING' } });

    const recipients = await this.getRecipients(academyId, campaign.targetSegment || 'ALL');
    let sent = 0;

    for (const recipient of recipients) {
      if (campaign.type === 'EMAIL' && recipient.email) {
        try {
          await sendEmail(recipient.email, campaign.subject || campaign.name, campaign.body);
          await prisma.campaignLog.create({ data: { campaignId: id, recipientId: recipient.id, type: 'email', status: 'sent' } });
          sent++;
        } catch (err: any) {
          await prisma.campaignLog.create({ data: { campaignId: id, recipientId: recipient.id, type: 'email', status: 'failed', error: err.message } });
        }
      }
    }

    await prisma.campaign.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date(), recipientCount: sent },
    });

    return { sent, total: recipients.length };
  },
};
