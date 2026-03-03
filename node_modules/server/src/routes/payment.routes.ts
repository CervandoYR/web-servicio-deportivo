import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', paymentController.list);
router.get('/stats', paymentController.stats);
router.post('/generate', authorize('ADMIN', 'SUPERADMIN'), paymentController.generate);
router.post('/update-overdue', authorize('ADMIN', 'SUPERADMIN'), paymentController.updateOverdue);
router.patch('/:id/pay', authorize('ADMIN', 'SUPERADMIN'), paymentController.markPaid);

export default router;
