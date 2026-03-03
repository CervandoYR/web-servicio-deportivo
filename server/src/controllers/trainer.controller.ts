import { Response, NextFunction } from 'express';
import { trainerService } from '../services/trainer.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const trainerController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await trainerService.findAll(req.user!.academyId, req.query as any);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.findById(req.user!.academyId, req.params.id);
      res.json({ status: 'success', data: trainer });
    } catch (e) { next(e); }
  },
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.create(req.user!.academyId, req.body);
      res.status(201).json({ status: 'success', data: trainer });
    } catch (e) { next(e); }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.update(req.user!.academyId, req.params.id, req.body);
      res.json({ status: 'success', data: trainer });
    } catch (e) { next(e); }
  },
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await trainerService.delete(req.user!.academyId, req.params.id);
      res.json({ status: 'success', message: 'Trainer deleted' });
    } catch (e) { next(e); }
  },
};
