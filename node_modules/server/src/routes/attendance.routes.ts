import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', attendanceController.getByGroup);
router.post('/', attendanceController.save);
router.get('/alerts', attendanceController.alerts);
router.get('/student/:studentId', attendanceController.getStudent);

export default router;
