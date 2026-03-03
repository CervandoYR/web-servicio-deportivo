import prisma from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { sendEmail, welcomeEmailTemplate } from '../utils/email';
import { Prisma } from '@prisma/client';

export const leadService = {
  async findAll(academyId: string, params: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const { search, status } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = {
      academyId,
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.lead.count({ where }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async create(academyId: string, data: any) {
    return prisma.lead.create({ data: { ...data, academyId } });
  },

  async update(academyId: string, id: string, data: any) {
    const lead = await prisma.lead.findFirst({ where: { id, academyId } });
    if (!lead) throw new AppError('Lead not found', 404);
    return prisma.lead.update({ where: { id }, data });
  },

  async convertToStudent(academyId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, academyId } });
    if (!lead) throw new AppError('Lead not found', 404);

    const student = await prisma.student.create({
      data: {
        academyId,
        firstName: lead.name.split(' ')[0] || lead.name,
        lastName: lead.name.split(' ').slice(1).join(' ') || '',
        birthDate: lead.childAge ? new Date(new Date().getFullYear() - lead.childAge, 0, 1) : new Date(),
        parentName: lead.parentName,
        parentPhone: lead.phone,
        parentEmail: lead.email,
        status: 'ACTIVE',
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONVERTED', convertedAt: new Date() },
    });

    if (lead.email) {
      const academy = await prisma.academy.findUnique({ where: { id: academyId } });
      try {
        await sendEmail(
          lead.email,
          `¡Bienvenido a ${academy?.name}!`,
          welcomeEmailTemplate(lead.name, academy?.name || 'la academia')
        );
      } catch {
        // Non-blocking
      }
    }

    return student;
  },

  async delete(academyId: string, id: string) {
    const lead = await prisma.lead.findFirst({ where: { id, academyId } });
    if (!lead) throw new AppError('Lead not found', 404);
    await prisma.lead.delete({ where: { id } });
  },
};
