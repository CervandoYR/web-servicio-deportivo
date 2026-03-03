import { Response, NextFunction } from 'express';
import { campaignService } from '../services/campaign.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const campaignController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await campaignService.findAll(req.user!.academyId, req.query as any);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.create(req.user!.academyId, req.body);
      res.status(201).json({ status: 'success', data: campaign });
    } catch (e) { next(e); }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.update(req.user!.academyId, req.params.id, req.body);
      res.json({ status: 'success', data: campaign });
    } catch (e) { next(e); }
  },
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignService.delete(req.user!.academyId, req.params.id);
      res.json({ status: 'success', message: 'Campaign deleted' });
    } catch (e) { next(e); }
  },
  async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await campaignService.send(req.user!.academyId, req.params.id);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
};
