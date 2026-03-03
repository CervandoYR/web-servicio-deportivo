import { Response, NextFunction } from 'express';
import { studentService } from '../services/student.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const studentController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await studentService.findAll(req.user!.academyId, req.query as any);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentService.findById(req.user!.academyId, req.params.id);
      res.json({ status: 'success', data: student });
    } catch (e) { next(e); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentService.create(req.user!.academyId, req.body);
      res.status(201).json({ status: 'success', data: student });
    } catch (e) { next(e); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentService.update(req.user!.academyId, req.params.id, req.body);
      res.json({ status: 'success', data: student });
    } catch (e) { next(e); }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await studentService.delete(req.user!.academyId, req.params.id);
      res.json({ status: 'success', message: 'Student deleted' });
    } catch (e) { next(e); }
  },

  async assignGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await studentService.assignGroup(req.user!.academyId, req.params.id, req.body.groupId, req.body.startDate);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },

  async removeGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await studentService.removeGroup(req.user!.academyId, req.params.id, req.params.groupId);
      res.json({ status: 'success', message: 'Student removed from group' });
    } catch (e) { next(e); }
  },
};
