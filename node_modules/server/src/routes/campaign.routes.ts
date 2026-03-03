import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'));

router.get('/', campaignController.list);
router.post('/', campaignController.create);
router.put('/:id', campaignController.update);
router.delete('/:id', campaignController.remove);
router.post('/:id/send', campaignController.send);

export default router;
