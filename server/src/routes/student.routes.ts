import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', studentController.list);
router.get('/:id', studentController.get);
router.post('/', authorize('ADMIN', 'SUPERADMIN'), studentController.create);
router.put('/:id', authorize('ADMIN', 'SUPERADMIN'), studentController.update);
router.delete('/:id', authorize('ADMIN', 'SUPERADMIN'), studentController.remove);
router.post('/:id/group', authorize('ADMIN', 'SUPERADMIN'), studentController.assignGroup);
router.delete('/:id/group/:groupId', authorize('ADMIN', 'SUPERADMIN'), studentController.removeGroup);

export default router;
