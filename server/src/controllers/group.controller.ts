import { Response, NextFunction } from 'express';
import { groupService } from '../services/group.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const groupController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await groupService.findAll(req.user!.academyId, req.query as any);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.findById(req.user!.academyId, req.params.id);
      res.json({ status: 'success', data: group });
    } catch (e) { next(e); }
  },
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.create(req.user!.academyId, req.body);
      res.status(201).json({ status: 'success', data: group });
    } catch (e) { next(e); }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.update(req.user!.academyId, req.params.id, req.body);
      res.json({ status: 'success', data: group });
    } catch (e) { next(e); }
  },
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await groupService.delete(req.user!.academyId, req.params.id);
      res.json({ status: 'success', message: 'Group deleted' });
    } catch (e) { next(e); }
  },
  async occupancy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await groupService.getOccupancy(req.user!.academyId);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },
};
