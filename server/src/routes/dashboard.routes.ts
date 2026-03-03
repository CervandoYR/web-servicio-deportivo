import { Router } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/stats', async (req: any, res, next) => {
  try {
    const data = await dashboardService.getStats(req.user.academyId);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.get('/revenue', async (req: any, res, next) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const data = await dashboardService.getMonthlyRevenue(req.user.academyId, months);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.get('/occupancy', async (req: any, res, next) => {
  try {
    const data = await dashboardService.getGroupOccupancy(req.user.academyId);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.get('/activity', async (req: any, res, next) => {
  try {
    const data = await dashboardService.getRecentActivity(req.user.academyId);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

export default router;
