import { Router } from 'express';
import { groupController } from '../controllers/group.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/occupancy', groupController.occupancy);
router.get('/', groupController.list);
router.get('/:id', groupController.get);
router.post('/', authorize('ADMIN', 'SUPERADMIN'), groupController.create);
router.put('/:id', authorize('ADMIN', 'SUPERADMIN'), groupController.update);
router.delete('/:id', authorize('ADMIN', 'SUPERADMIN'), groupController.remove);

export default router;
