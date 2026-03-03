import { Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const attendanceController = {
  async getByGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { groupId, date } = req.query as any;
      const data = await attendanceService.getByGroup(req.user!.academyId, groupId, date);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },
  async save(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { groupId, date, records } = req.body;
      const data = await attendanceService.saveAttendance(req.user!.academyId, groupId, date, records);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },
  async getStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.getStudentAttendance(req.user!.academyId, req.params.studentId, req.query as any);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },
  async alerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.getAbsenceAlerts(req.user!.academyId);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },
};
