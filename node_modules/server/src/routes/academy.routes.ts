import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res, next) => {
  try {
    const academy = await prisma.academy.findUnique({ where: { id: req.user.academyId } });
    res.json({ status: 'success', data: academy });
  } catch (e) { next(e); }
});

router.put('/', authorize('ADMIN', 'SUPERADMIN'), async (req: any, res, next) => {
  try {
    const academy = await prisma.academy.update({ where: { id: req.user.academyId }, data: req.body });
    res.json({ status: 'success', data: academy });
  } catch (e) { next(e); }
});

export default router;
