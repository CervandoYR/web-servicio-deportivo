import { Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const paymentController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.findAll(req.user!.academyId, req.query as any);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
  async markPaid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { method } = req.body;
      const payment = await paymentService.markPaid(req.user!.academyId, req.params.id, method);
      res.json({ status: 'success', data: payment });
    } catch (e) { next(e); }
  },
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.body;
      const result = await paymentService.generateMonthlyPayments(req.user!.academyId, month, year);
      res.json({ status: 'success', data: result, count: result.length });
    } catch (e) { next(e); }
  },
  async stats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await paymentService.getDashboardStats(req.user!.academyId);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },
  async updateOverdue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.updateOverdue(req.user!.academyId);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
};
