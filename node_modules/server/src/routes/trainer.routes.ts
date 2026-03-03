import { Router } from 'express';
import { trainerController } from '../controllers/trainer.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', trainerController.list);
router.get('/:id', trainerController.get);
router.post('/', authorize('ADMIN', 'SUPERADMIN'), trainerController.create);
router.put('/:id', authorize('ADMIN', 'SUPERADMIN'), trainerController.update);
router.delete('/:id', authorize('ADMIN', 'SUPERADMIN'), trainerController.remove);

export default router;
