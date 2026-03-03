import { Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const leadController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leadService.findAll(req.user!.academyId, req.query as any);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.headers['x-academy-slug'] as string || 'academia-elite';
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const academy = await prisma.academy.findUnique({ where: { slug } });
      await prisma.$disconnect();
      if (!academy) { res.status(404).json({ status: 'error', message: 'Academy not found' }); return; }
      const lead = await leadService.create(academy.id, req.body);
      res.status(201).json({ status: 'success', data: lead });
    } catch (e) { next(e); }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lead = await leadService.update(req.user!.academyId, req.params.id, req.body);
      res.json({ status: 'success', data: lead });
    } catch (e) { next(e); }
  },
  async convert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await leadService.convertToStudent(req.user!.academyId, req.params.id);
      res.json({ status: 'success', data: student });
    } catch (e) { next(e); }
  },
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await leadService.delete(req.user!.academyId, req.params.id);
      res.json({ status: 'success', message: 'Lead deleted' });
    } catch (e) { next(e); }
  },
};
