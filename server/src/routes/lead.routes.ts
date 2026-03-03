import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/public', leadController.create);

router.use(authenticate);
router.get('/', leadController.list);
router.put('/:id', authorize('ADMIN', 'SUPERADMIN'), leadController.update);
router.post('/:id/convert', authorize('ADMIN', 'SUPERADMIN'), leadController.convert);
router.delete('/:id', authorize('ADMIN', 'SUPERADMIN'), leadController.remove);

export default router;
